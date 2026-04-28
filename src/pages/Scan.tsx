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
  { id: "phone", name: "Smartphone", emoji: "📱", weight: 0.18, base: 850 },
  { id: "feature", name: "Feature Phone", emoji: "📞", weight: 0.1, base: 220 },
  { id: "earbuds", name: "Wireless Earbuds", emoji: "🎧", weight: 0.05, base: 180 },
  { id: "headphones", name: "Headphones", emoji: "🎧", weight: 0.25, base: 320 },
  { id: "smartwatch", name: "Smartwatch", emoji: "⌚", weight: 0.06, base: 400 },
  { id: "fitband", name: "Fitness Band", emoji: "📿", weight: 0.03, base: 150 },
  { id: "powerbank", name: "Power Bank", emoji: "🔋", weight: 0.3, base: 260 },
  { id: "tablet", name: "Tablet / iPad", emoji: "📱", weight: 0.45, base: 1400 },
  { id: "laptop", name: "Laptop / Notebook", emoji: "💻", weight: 2.0, base: 2500 },
  { id: "ereader", name: "E-Reader (Kindle)", emoji: "📖", weight: 0.2, base: 600 },
  { id: "camera", name: "Digital Camera", emoji: "📷", weight: 0.4, base: 900 },
  { id: "console", name: "Handheld Console", emoji: "🎮", weight: 0.35, base: 1100 },
  { id: "charger", name: "Charger / Adapter", emoji: "🔌", weight: 0.12, base: 60 },
  { id: "cable", name: "USB / Cable Bundle", emoji: "🧵", weight: 0.1, base: 40 },
  { id: "speaker", name: "Bluetooth Speaker", emoji: "🔊", weight: 0.4, base: 350 },
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

const estimateConditionFromImage = (imageData: ImageData): number => {
  const data = imageData.data;
  let sum = 0;
  const width = imageData.width;
  const height = imageData.height;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      const gx =
        -1 * data[idx - 4 - width * 4] +
        1 * data[idx + 4 - width * 4] +
        -2 * data[idx - 4] +
        2 * data[idx + 4] +
        -1 * data[idx - 4 + width * 4] +
        1 * data[idx + 4 + width * 4];

      const gy =
        -1 * data[idx - 4 - width * 4] +
        -2 * data[idx - width * 4] +
        -1 * data[idx + 4 - width * 4] +
        1 * data[idx - 4 + width * 4] +
        2 * data[idx + width * 4] +
        1 * data[idx + 4 + width * 4];

      sum += Math.sqrt(gx * gx + gy * gy);
    }
  }

  const avgSharpness = sum / ((width - 2) * (height - 2));
  return Math.min(100, Math.max(0, Math.round((avgSharpness / 1200) * 100)));
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

  const [aiModel, setAiModel] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const device = useMemo(
    () => devices.find((d) => d.id === deviceId)!,
    [deviceId]
  );

  const cond = conditionFor(condition);
  const coins = Math.round(device.base * cond.mult);

  const labelToDeviceId = (label: string): string => {
    const l = label.toLowerCase();

    if (l.includes("tablet") || l.includes("ipad")) return "tablet";
    if (l.includes("laptop") || l.includes("notebook")) return "laptop";
    if (l.includes("smartphone") || l.includes("iphone") || l.includes("cellular"))
      return "phone";
    if (l.includes("camera")) return "camera";
    if (l.includes("watch")) return "smartwatch";
    if (l.includes("headphone") || l.includes("earbud")) return "earbuds";
    if (l.includes("speaker")) return "speaker";
    if (l.includes("console") || l.includes("gamepad")) return "console";

    return "phone";
  };

  const loadAI = async () => {
    if (aiModel) return aiModel;
    if (aiError) throw new Error(aiError);

    setAiLoading(true);

    try {
      const tf = await import("@tensorflow/tfjs");
      const mobilenet = await import("@tensorflow-models/mobilenet");

      await tf.ready();

      const model = await mobilenet.load();

      setAiModel(model);
      setAiError(null);
      toast.success("AI model ready");

      return model;
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Failed to load AI");
      toast.error("AI unavailable – manual selection only");
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
    startCamera();

    return () => {
      setStream((current) => {
        current?.getTracks().forEach((track) => track.stop());
        return null;
      });
    };
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
      const model = await loadAI();

      if (!videoRef.current || !canvasRef.current || !stream) {
        toast.error("Camera not ready");
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Canvas error");

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const conditionScore = estimateConditionFromImage(imageData);

      setCondition(conditionScore);

      const predictions = await model.classify(canvas, 3);

      let bestId: string | null = null;
      let bestConfidence = 0;

      for (const pred of predictions) {
        const mapped = labelToDeviceId(pred.className);

        if (mapped && pred.probability > bestConfidence) {
          bestId = mapped;
          bestConfidence = pred.probability;
        }
      }

      if (bestId && bestConfidence > 0.2) {
        const detectedDevice = devices.find((d) => d.id === bestId);
        setDeviceId(bestId);

        toast.success(
          `Detected: ${detectedDevice?.name} (${Math.round(
            bestConfidence * 100
          )}% confidence)`
        );
      } else {
        toast.warning(`Could not identify device, condition set to ${conditionScore}%`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Detection failed");
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
              className="h-8 text-xs gap-1"
            >
              <Brain className="h-3 w-3" />
              {aiLoading ? "Loading AI..." : "🤖 Auto Detect"}
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