import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Sparkles,
  MapPin,
  Truck,
  X,
  ChevronDown,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppShell from "@/components/w2w/AppShell";
import CoinBadge from "@/components/w2w/CoinBadge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const devices = [
  { id: "phone",      name: "Smartphone",         emoji: "📱", weight: 0.18, base: 850  },
  { id: "feature",   name: "Feature Phone",        emoji: "📞", weight: 0.1,  base: 220  },
  { id: "earbuds",   name: "Wireless Earbuds",     emoji: "🎧", weight: 0.05, base: 180  },
  { id: "headphones",name: "Headphones",           emoji: "🎧", weight: 0.25, base: 320  },
  { id: "smartwatch",name: "Smartwatch",           emoji: "⌚", weight: 0.06, base: 400  },
  { id: "fitband",   name: "Fitness Band",         emoji: "📿", weight: 0.03, base: 150  },
  { id: "powerbank", name: "Power Bank",           emoji: "🔋", weight: 0.3,  base: 260  },
  { id: "tablet",    name: "Tablet / iPad",        emoji: "📱", weight: 0.45, base: 1400 },
  { id: "laptop",    name: "Laptop / Notebook",    emoji: "💻", weight: 2.0,  base: 2500 },
  { id: "ereader",   name: "E-Reader (Kindle)",    emoji: "📖", weight: 0.2,  base: 600  },
  { id: "camera",    name: "Digital Camera",       emoji: "📷", weight: 0.4,  base: 900  },
  { id: "console",   name: "Handheld Console",     emoji: "🎮", weight: 0.35, base: 1100 },
  { id: "charger",   name: "Charger / Adapter",    emoji: "🔌", weight: 0.12, base: 60   },
  { id: "cable",     name: "USB / Cable Bundle",   emoji: "🧵", weight: 0.1,  base: 40   },
  { id: "speaker",   name: "Bluetooth Speaker",   emoji: "🔊", weight: 0.4,  base: 350  },
  { id: "calculator",name: "Calculator",           emoji: "🔢", weight: 0.15, base: 80   },
];

const conditionFor = (v: number) => {
  if (v >= 80)
    return {
      label: "Like New",
      mult: 1.0,
      tone: "text-primary",
      desc: "Fully working, minimal wear",
    };
  if (v >= 60)
    return {
      label: "Good",
      mult: 0.75,
      tone: "text-deep-blue",
      desc: "Working, minor scratches",
    };
  if (v >= 40)
    return {
      label: "Fair",
      mult: 0.5,
      tone: "text-gold",
      desc: "Boots up, visible damage",
    };
  if (v >= 20)
    return {
      label: "Faulty",
      mult: 0.3,
      tone: "text-olive",
      desc: "Partial function / battery issues",
    };
  return {
    label: "Dead / Scrap",
    mult: 0.15,
    tone: "text-destructive",
    desc: "Recycle for materials only",
  };
};

/**
 * Estimates device condition (0-100) from a camera frame.
 *
 * Uses three complementary image signals:
 *  1. Sharpness  – luminance-weighted Sobel edge magnitude (higher → cleaner screen)
 *  2. Brightness – overly dark or washed-out frames suggest damage / dirt
 *  3. Contrast   – low variance often indicates a dead or cracked screen
 *
 * The three scores are blended with empirical weights and clamped to [0, 100].
 */
const estimateConditionFromImage = (imageData: ImageData): number => {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const total = width * height;

  // --- 1. Sharpness via luminance-based Sobel ---
  // Convert each pixel to perceived luminance first (ITU-R BT.601)
  const luma = new Float32Array(total);
  for (let i = 0; i < total; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    luma[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  let sobelSum = 0;
  let brightnessSum = 0;
  let varianceSum = 0;
  let meanLuma = 0;

  // Single pass: accumulate brightness for mean
  for (let i = 0; i < total; i++) meanLuma += luma[i];
  meanLuma /= total;

  // Second pass: Sobel + variance
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const c = y * width + x;
      // 3×3 neighbourhood indices
      const tl = luma[c - width - 1], tc = luma[c - width], tr = luma[c - width + 1];
      const ml = luma[c - 1],                               mr = luma[c + 1];
      const bl = luma[c + width - 1], bc = luma[c + width], br = luma[c + width + 1];

      const gx = -tl - 2 * ml - bl + tr + 2 * mr + br;
      const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;
      sobelSum += Math.sqrt(gx * gx + gy * gy);

      const diff = luma[c] - meanLuma;
      varianceSum += diff * diff;
      brightnessSum += luma[c];
    }
  }

  const innerPixels = (width - 2) * (height - 2);
  const avgSobel = sobelSum / innerPixels;
  const avgBrightness = brightnessSum / innerPixels;
  const stdDev = Math.sqrt(varianceSum / innerPixels);

  // --- 2. Individual sub-scores (each 0–100) ---
  // Sharpness: calibrated against typical real-world device images
  // avgSobel ~400 → good focus, ~1600 → very sharp edges
  const sharpnessScore = Math.min(100, (avgSobel / 1400) * 100);

  // Brightness: ideal range 80-200; penalise very dark (<60) or blown-out (>220)
  const brightnessPenalty =
    avgBrightness < 60
      ? (60 - avgBrightness) / 60        // dark penalty 0–1
      : avgBrightness > 220
      ? (avgBrightness - 220) / 35       // blown-out penalty 0–1
      : 0;
  const brightnessScore = Math.max(0, 100 - brightnessPenalty * 40);

  // Contrast/variance: stdDev ~25 is flat/damaged, ~60+ is detailed/good
  const contrastScore = Math.min(100, (stdDev / 55) * 100);

  // --- 3. Weighted blend ---
  const blended = sharpnessScore * 0.55 + brightnessScore * 0.25 + contrastScore * 0.20;

  // Snap to nearest 5% step (matches the slider step)
  return Math.min(100, Math.max(0, Math.round(blended / 5) * 5));
};

export default function Scan() {
  const navigate = useNavigate();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [deviceId, setDeviceId] = useState<string>("phone");
  const [condition, setCondition] = useState<number>(70);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  // COCO-SSD lite (~1.5 MB) for primary detection + MobileNet v1-0.25 (~500 KB) fallback
  const [cocoModel,      setCocoModel]      = useState<any>(null);
  const [mobilenetModel, setMobilenetModel] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReady,   setAiReady]   = useState(false);
  const [aiError,   setAiError]   = useState<string | null>(null);

  const device = useMemo(
    () => devices.find((d) => d.id === deviceId)!,
    [deviceId]
  );

  const cond = conditionFor(condition);
  const coins = Math.round(device.base * cond.mult);

  /**
   * Maps a MobileNet / ImageNet label string to one of our device IDs.
   * Returns null when no match is found so callers can skip unrecognised labels.
   *
   * The keyword list has been expanded to cover the most common ImageNet class
   * names that actually appear when pointing a phone at electronic waste.
   */
  const labelToDeviceId = (label: string): string | null => {
    const l = label.toLowerCase();

    // ── Laptop / notebook ──────────────────────────────────────────────────
    if (
      l.includes("laptop") || l.includes("notebook") ||
      l.includes("computer keyboard") || l.includes("space bar") ||
      l.includes("desktop computer")
    ) return "laptop";

    // ── Tablet / iPad ─────────────────────────────────────────────────────
    if (
      l.includes("tablet") || l.includes("ipad") ||
      l.includes("digital clock")        // iPads are often misclassified here
    ) return "tablet";

    // ── Smartphone / feature phone ────────────────────────────────────────
    if (
      l.includes("smartphone") || l.includes("iphone") ||
      l.includes("cellular") || l.includes("cell phone") ||
      l.includes("mobile phone") || l.includes("cordless phone") ||
      l.includes("telephone") || l.includes("dial telephone")
    ) return "phone";

    // ── Feature phone (lower-end) ─────────────────────────────────────────
    if (
      l.includes("feature phone") || l.includes("flip phone")
    ) return "feature";

    // ── Camera ────────────────────────────────────────────────────────────
    if (
      l.includes("camera") || l.includes("reflex camera") ||
      l.includes("polaroid") || l.includes("lens cap") ||
      l.includes("binoculars")
    ) return "camera";

    // ── Smartwatch ────────────────────────────────────────────────────────
    if (
      l.includes("watch") || l.includes("wristwatch") ||
      l.includes("analog clock")          // watches are often predicted as clocks
    ) return "smartwatch";

    // ── Headphones / earbuds ──────────────────────────────────────────────
    if (
      l.includes("headphone") || l.includes("earbud") ||
      l.includes("earphone") || l.includes("hearing aid") ||
      l.includes("in-ear") || l.includes("iPod")
    ) return "earbuds";

    // ── Bluetooth speaker ─────────────────────────────────────────────────
    if (
      l.includes("speaker") || l.includes("loudspeaker") ||
      l.includes("subwoofer") || l.includes("home theater") ||
      l.includes("amplifier")
    ) return "speaker";

    // ── Handheld game console ─────────────────────────────────────────────
    if (
      l.includes("console") || l.includes("gamepad") ||
      l.includes("joystick") || l.includes("game controller")
    ) return "console";

    // ── Power bank / battery pack ─────────────────────────────────────────
    if (
      l.includes("power bank") || l.includes("battery") ||
      l.includes("electric battery")
    ) return "powerbank";

    // ── Charger / adapter / cable ─────────────────────────────────────────
    if (
      l.includes("charger") || l.includes("adapter") ||
      l.includes("power strip") || l.includes("plug") ||
      l.includes("coax")
    ) return "charger";

    if (
      l.includes("cable") || l.includes("usb") ||
      l.includes("wire") || l.includes("extension cord")
    ) return "cable";

    // ── E-reader ──────────────────────────────────────────────────────────
    if (
      l.includes("kindle") || l.includes("e-reader") ||
      l.includes("ereader") || l.includes("book")
    ) return "ereader";

    // ── Fitness band ──────────────────────────────────────────────────────
    if (
      l.includes("band") || l.includes("bracelet") ||
      l.includes("pedometer")
    ) return "fitband";

    // ── Calculator ────────────────────────────────────────────────────────
    if (
      l.includes("calculator") || l.includes("abacus") ||
      l.includes("cash machine") || l.includes("slide rule")
    ) return "calculator";

    // ── Earbuds (MobileNet labels) ─────────────────────────────────────────
    // MobileNet predicts earbuds as iPod, Walkman, or similar
    if (
      l.includes("ipod") || l.includes("walkman") ||
      l.includes("earphone") || l.includes("in-ear") ||
      l.includes("hearing aid")
    ) return "earbuds";

    return null;  // unknown — caller will skip this prediction
  };

  /**
   * COCO-SSD → device ID map.
   * COCO-SSD classes relevant to e-waste: cell phone, laptop, keyboard,
   * mouse, remote, tv, book, clock, backpack, handbag, suitcase.
   */
  const cocoClassToDeviceId = (cls: string): string | null => {
    switch (cls.toLowerCase()) {
      case "cell phone":   return "phone";
      case "laptop":       return "laptop";
      case "keyboard":     return "laptop";   // often seen with laptops
      case "mouse":        return "laptop";
      case "remote":       return "charger";  // closest match
      case "clock":        return "smartwatch";
      case "book":         return "ereader";
      case "headphones":   return "headphones";
      case "backpack":
      case "handbag":
      case "suitcase":     return null;       // not e-waste
      default:             return null;
    }
  };

  /**
   * Loads both models in parallel on first call; returns cached refs instantly
   * on subsequent calls.
   *
   * • COCO-SSD lite  (~1.5 MB) — object detector: knows cell phone, laptop, etc.
   * • MobileNet v1 α=0.25 (~500 KB) — scene classifier: knows calculator,
   *   iPod/earbuds, camera, speaker, console, and 1 000 ImageNet classes.
   *
   * Total cold download ≈ 2 MB. Preloaded on mount so tap is instant.
   */
  const loadModels = async (): Promise<{ coco: any; mn: any }> => {
    if (aiError) throw new Error(aiError);
    if (cocoModel && mobilenetModel) return { coco: cocoModel, mn: mobilenetModel };

    setAiLoading(true);
    try {
      const tf        = await import("@tensorflow/tfjs");
      const cocoSsd   = await import("@tensorflow-models/coco-ssd");
      const mobilenet = await import("@tensorflow-models/mobilenet");

      await tf.ready();

      // Load both in parallel — total wall-clock time = max(coco, mn) not sum
      const [coco, mn] = await Promise.all([
        cocoSsd.load({ base: "lite_mobilenet_v2" }),          // ~1.5 MB
        mobilenet.load({ version: 1, alpha: 0.25 }),           // ~500 KB
      ]);

      setCocoModel(coco);
      setMobilenetModel(mn);
      setAiReady(true);
      setAiError(null);

      return { coco, mn };
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Failed to load AI");
      throw err;
    } finally {
      setAiLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(media);

      if (videoRef.current) {
        videoRef.current.srcObject = media;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error(err);
      toast.error("Camera permission denied");
    }
  };

  useEffect(() => {
    // Kick off camera + both AI models the moment the page opens.
    // All three run in parallel; by the time the user taps the button
    // everything is in memory and detection is near-instant.
    startCamera();
    loadModels().catch(() => { /* silently ignore preload errors */ });

    return () => {
      setStream((current) => {
        current?.getTracks().forEach((track) => track.stop());
        return null;
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startScan = () => {
    setScanning(true);

    setTimeout(() => {
      stopCamera();
      setScanning(false);
      setScanned(true);
    }, 1600);
  };

  const autoDetect = async () => {
    try {
      // Returns instantly when preloaded on mount (common case).
      const { coco, mn } = await loadModels();

      if (!videoRef.current || !canvasRef.current || !stream) {
        toast.error("Camera not ready");
        return;
      }

      const video  = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas error");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // ── STAGE 1: COCO-SSD ─────────────────────────────────────────────
      // Best for: cell phone, laptop, keyboard, mouse, remote, clock, book.
      const cocoDetections: Array<{ bbox: number[]; class: string; score: number }> =
        await coco.detect(canvas);

      const sorted = [...cocoDetections].sort((a, b) => b.score - a.score);

      let detectedId:    string|null   = null;
      let detectedBbox:  number[]|null = null;
      let detectedScore: number        = 0;
      let detectedBy = "";

      for (const det of sorted) {
        const mapped = cocoClassToDeviceId(det.class);
        if (mapped && det.score > 0.28) {
          detectedId    = mapped;
          detectedBbox  = det.bbox;
          detectedScore = det.score;
          detectedBy    = "COCO";
          break;
        }
      }

      // ── STAGE 2: MobileNet fallback ────────────────────────────────────
      // Covers: calculator, earbuds (iPod), camera, speaker, console,
      // fitness band, power bank, charger, cable, e-reader, and more.
      if (!detectedId) {
        const preds = await mn.classify(canvas, 6);
        const scoreMap: Record<string, number> = {};
        for (const p of preds) {
          const mapped = labelToDeviceId(p.className);
          if (mapped) scoreMap[mapped] = (scoreMap[mapped] ?? 0) + p.probability;
        }
        let best = 0;
        for (const [id, sc] of Object.entries(scoreMap)) {
          if (sc > best) { detectedId = id; best = sc; }
        }
        if (detectedId && best > 0.10) {
          detectedScore = best;
          detectedBy    = "MobileNet";
        } else {
          detectedId = null;
        }
      }

      // ── Condition (crop to bbox if COCO gave us one) ───────────────────
      let conditionScore: number;
      if (detectedBbox) {
        const [bx, by, bw, bh] = detectedBbox;
        const cx = Math.max(0, Math.round(bx));
        const cy = Math.max(0, Math.round(by));
        const cw = Math.min(canvas.width  - cx, Math.round(bw));
        const ch = Math.min(canvas.height - cy, Math.round(bh));
        conditionScore = estimateConditionFromImage(ctx.getImageData(cx, cy, cw, ch));
      } else {
        conditionScore = estimateConditionFromImage(
          ctx.getImageData(0, 0, canvas.width, canvas.height)
        );
      }
      setCondition(conditionScore);

      if (detectedId) {
        setDeviceId(detectedId);
        const det      = devices.find((d) => d.id === detectedId);
        const confPct  = Math.min(99, Math.round(detectedScore * 100));
        const condLabel= conditionFor(conditionScore).label;
        toast.success(
          `Detected: ${det?.name} · ${confPct}% conf · ${condLabel} [${detectedBy}]`
        );
      } else {
        toast.warning(
          `Device unclear – condition ${conditionScore}%. Please select type manually.`
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Detection failed – check console for details");
    }
  };

  const deposit = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please login first");
        return;
      }

      const { error: scanError } = await supabase.from("scans").insert([
        {
          user_id: user.id,
          device_id: device.id,
          device_name: device.name,
          weight_kg: device.weight,
          condition_pct: condition,
          condition_label: cond.label,
          coins_earned: coins,
          ai_notes: `AI estimate: ${device.name}, ${cond.label}`,
        },
      ]);

      if (scanError) {
        console.error("Scan insert error:", scanError);
        toast.error(scanError.message || "Failed to save scan");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("coins,total_kg")
        .eq("id", user.id)
        .single();

      const newCoins = (profile?.coins || 0) + coins;
      const newKg = Number(profile?.total_kg || 0) + device.weight;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          coins: newCoins,
          total_kg: newKg,
        })
        .eq("id", user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        toast.error(profileError.message || "Coins update failed");
        return;
      }

      toast.success(`+${coins} W2W coins added`);
      navigate("/map");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message ?? "Failed to save scan");
    }
  };

  const pickup = () => {
    toast.success("Opening pickup form");
    navigate("/pickup");
  };

  const resetScan = () => {
    setScanned(false);
    startCamera();
  };

  return (
    <AppShell>
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative h-[42vh] bg-black overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.2),transparent_70%)]" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-52 w-52">
            {[
              "top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl",
              "top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl",
              "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl",
              "bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl",
            ].map((c, i) => (
              <span
                key={i}
                className={`absolute h-10 w-10 border-primary ${c}`}
              />
            ))}

            {scanning && (
              <span
                className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_20px_hsl(var(--primary))] animate-[scan_1.6s_ease-in-out]"
                style={{ animationName: "scan" }}
              />
            )}

            <style>{`
              @keyframes scan {
                0% { top: 0 }
                50% { top: 100% }
                100% { top: 0 }
              }
            `}</style>
          </div>
        </div>

        <div className="absolute top-0 inset-x-0 px-5 pt-12 flex items-center justify-between text-white">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center backdrop-blur"
          >
            <X className="h-5 w-5" />
          </button>

          <p className="text-sm font-semibold">AI Device Scanner</p>

          <div className="h-10 w-10" />
        </div>

        {!scanned && !scanning && (
          <p className="absolute bottom-4 inset-x-0 text-center text-white/85 text-xs px-8">
            Point camera at device → tap 🤖 Auto Detect
          </p>
        )}
      </div>

      <div className="px-5 -mt-4 space-y-4">
        <div className="rounded-2xl bg-card border border-border shadow-elevated p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Select portable device
            </label>

            <Button
              onClick={autoDetect}
              disabled={aiLoading}
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1 relative"
            >
              <Brain className="h-3 w-3" />
              {aiLoading
                ? "Loading…"
                : aiReady
                ? "🤖 Auto Detect"
                : "🤖 Auto Detect"}
            </Button>
          </div>

          {aiError && (
            <div className="text-[10px] text-red-500 mb-2">
              AI unavailable – manual only
            </div>
          )}

          <Select
            value={deviceId}
            onValueChange={(v) => {
              setDeviceId(v);
              setScanned(false);
            }}
          >
            <SelectTrigger className="mt-2 h-12 rounded-xl border-border bg-card-muted font-bold text-sm">
              <SelectValue />
              <ChevronDown className="h-4 w-4 opacity-50" />
            </SelectTrigger>

            <SelectContent className="max-h-72">
              {devices.map((d) => (
                <SelectItem key={d.id} value={d.id} className="font-semibold">
                  <span className="mr-2">{d.emoji}</span>
                  {d.name}
                  <span className="text-muted-foreground ml-2 text-xs">
                    · ~{d.weight}kg
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Device condition
              </span>

              <span className={`text-xs font-extrabold ${cond.tone}`}>
                {condition}% · {cond.label}
              </span>
            </div>

            <Slider
              value={[condition]}
              min={0}
              max={100}
              step={5}
              onValueChange={(v) => {
                setCondition(v[0]);
                setScanned(false);
              }}
            />

            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground font-semibold">
              <span>Scrap</span>
              <span>Faulty</span>
              <span>Fair</span>
              <span>Good</span>
              <span>New</span>
            </div>

            <p className="mt-2 text-[11px] text-muted-foreground">
              {cond.desc}
            </p>
          </div>
        </div>

        {!scanned ? (
          <div className="flex flex-col items-center pt-1">
            <button
              onClick={startScan}
              disabled={scanning}
              className="h-20 w-20 rounded-full bg-card border-4 border-primary shadow-elevated flex items-center justify-center disabled:opacity-60"
            >
              <Camera className="h-8 w-8 text-primary" />
            </button>

            <p className="mt-3 text-xs text-muted-foreground font-semibold">
              {scanning ? "Analyzing…" : "Tap to confirm & earn coins"}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-card border border-border shadow-elevated p-5 fade-in">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center text-2xl">
                {device.emoji}
              </div>

              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI Estimate
                </p>

                <p className="text-base font-extrabold leading-tight">
                  {device.name}
                </p>

                <p className="text-[11px] text-muted-foreground font-semibold">
                  ~{device.weight.toFixed(2)} kg · {cond.label}
                </p>
              </div>

              <CoinBadge />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat label="Condition score" value={`${condition}%`} />
              <Stat label="You'll earn" value={`+${coins} W2W`} accent />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button
                onClick={deposit}
                className="h-12 rounded-xl bg-deep-blue text-deep-blue-foreground hover:bg-deep-blue/90 font-bold"
              >
                <MapPin className="h-4 w-4 mr-1" /> Deposit at Kiosk
              </Button>

              <Button
                onClick={pickup}
                className="h-12 rounded-xl bg-olive text-olive-foreground hover:bg-olive/90 font-bold"
              >
                <Truck className="h-4 w-4 mr-1" /> Request Pickup
              </Button>
            </div>

            <button
              onClick={resetScan}
              className="mt-3 w-full text-xs text-muted-foreground font-semibold py-2"
            >
              Scan another device
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 border border-border ${
        accent ? "bg-primary/10" : "bg-card-muted"
      }`}
    >
      <p className="text-[11px] text-muted-foreground font-semibold">{label}</p>
      <p
        className={`text-base font-extrabold ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}