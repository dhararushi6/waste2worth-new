import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, MapPin, Gift, ChevronRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { w2wStore } from "@/store/w2w-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import AppShell from "@/components/w2w/AppShell";

const slides = [
  { icon: Camera, title: "Scan waste, earn instantly", body: "Point your camera. Our AI identifies materials and rewards you in W2W coins.", tint: "bg-primary/15 text-primary" },
  { icon: MapPin, title: "Drop at smart kiosk or request pickup", body: "Find the nearest smart bin on campus, or have it picked from your hostel.", tint: "bg-[hsl(var(--deep-blue))]/10 text-[hsl(var(--deep-blue))]" },
  { icon: Gift, title: "Redeem rewards", body: "Chai, mobile recharge, front-row concert seats, and more.", tint: "bg-gold/20 text-gold" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"slides" | "phone" | "otp">("slides");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const Slide = slides[step];

  const next = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else setPhase("phone");
  };

  const sendOtp = () => {
    if (phone.length < 10) return toast.error("Enter a valid 10-digit number");
    toast.success("OTP sent: 1234 (demo)");
    setPhase("otp");
  };

  const verify = () => {
    if (otp.length < 4) return toast.error("Enter the 4-digit OTP");
    w2wStore.signIn();
    toast.success("Welcome to Waste2Worth!");
    navigate("/home");
  };

  return (
    <AppShell hideNav>
      <div className="min-h-screen flex flex-col px-6 pt-12 pb-8 gradient-hero text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center text-lg">♻️</div>
            <div className="font-extrabold text-lg tracking-tight">Waste2Worth</div>
          </div>
          {phase === "slides" && step < slides.length - 1 && (
            <button onClick={() => setPhase("phone")} className="text-sm font-semibold opacity-90">Skip</button>
          )}
        </div>

        {phase === "slides" && (
          <div className="flex-1 flex flex-col justify-center fade-in" key={step}>
            <div className={cn("h-28 w-28 rounded-3xl flex items-center justify-center mb-8 bg-white/20")}>
              <Slide.icon className="h-14 w-14" strokeWidth={1.6} />
            </div>
            <h1 className="text-3xl font-extrabold leading-tight">{Slide.title}</h1>
            <p className="mt-3 text-base text-white/85 leading-relaxed">{Slide.body}</p>

            <div className="mt-10 flex gap-1.5">
              {slides.map((_, i) => (
                <span key={i} className={cn("h-1.5 rounded-full transition-all", i === step ? "w-8 bg-white" : "w-2 bg-white/40")} />
              ))}
            </div>
          </div>
        )}

        {phase !== "slides" && (
          <div className="flex-1 flex flex-col justify-center fade-in">
            <h1 className="text-3xl font-extrabold leading-tight">
              {phase === "phone" ? "Sign in with your phone" : "Verify it's you"}
            </h1>
            <p className="mt-2 text-white/85">
              {phase === "phone" ? "We'll send a one-time code to confirm." : `Code sent to +91 ${phone}`}
            </p>

            <div className="mt-8 bg-card text-foreground rounded-2xl p-4 shadow-card">
              {phase === "phone" ? (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-3 rounded-xl bg-muted text-sm font-semibold flex items-center gap-1"><Phone className="h-4 w-4" />+91</span>
                  <Input
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="border-0 bg-transparent text-base font-semibold focus-visible:ring-0"
                  />
                </div>
              ) : (
                <Input
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="• • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="border-0 bg-transparent text-center text-2xl font-bold tracking-[1em] focus-visible:ring-0"
                />
              )}
            </div>
          </div>
        )}

        <div className="mt-8 space-y-3">
          {phase === "slides" && (
            <Button
              onClick={next}
              size="lg"
              className="w-full h-14 rounded-2xl bg-card text-foreground hover:bg-card/90 text-base font-bold shadow-elevated"
            >
              {step < slides.length - 1 ? "Next" : "Sign up with phone"}
              <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          )}
          {phase === "phone" && (
            <Button onClick={sendOtp} size="lg" className="w-full h-14 rounded-2xl bg-card text-foreground hover:bg-card/90 text-base font-bold">
              Send OTP
            </Button>
          )}
          {phase === "otp" && (
            <>
              <Button onClick={verify} size="lg" className="w-full h-14 rounded-2xl bg-card text-foreground hover:bg-card/90 text-base font-bold">
                Verify & Continue
              </Button>
              <button onClick={() => setPhase("phone")} className="w-full text-center text-sm text-white/85 underline-offset-2 hover:underline">
                Change number
              </button>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
