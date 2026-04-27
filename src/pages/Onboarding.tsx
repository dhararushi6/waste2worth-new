import { useState } from "react";
import { Camera, MapPin, Gift, ChevronRight, Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AppShell from "@/components/w2w/AppShell";
import Auth from "./Auth";

const slides = [
  { icon: Camera, title: "Scan waste, earn instantly", body: "Point your camera. Our AI identifies devices and rewards you in W2W coins." },
  { icon: MapPin, title: "Drop at a smart kiosk or request pickup", body: "Find the nearest smart bin in your city, or have it picked from your home." },
  { icon: Gift, title: "Redeem real rewards", body: "Chai, mobile recharge, eco-experiences, and more." },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [showAuth, setShowAuth] = useState(false);

  if (showAuth) return <Auth />;

  const Slide = slides[step];
  const last = step === slides.length - 1;

  return (
    <AppShell hideNav>
      <div className="min-h-screen flex flex-col px-6 pt-10 pb-6 gradient-hero text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Recycle className="h-5 w-5" />
            </div>
            <div className="font-extrabold text-lg tracking-tight">Waste2Worth</div>
          </div>
          {!last && (
            <button onClick={() => setShowAuth(true)} className="text-sm font-semibold opacity-90">
              Skip
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center fade-in" key={step}>
          <div className="h-24 w-24 rounded-3xl flex items-center justify-center mb-6 bg-white/20">
            <Slide.icon className="h-12 w-12" strokeWidth={1.6} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">{Slide.title}</h1>
          <p className="mt-3 text-sm sm:text-base text-white/85 leading-relaxed">{Slide.body}</p>

          <div className="mt-8 flex gap-1.5">
            {slides.map((_, i) => (
              <span
                key={i}
                className={cn("h-1.5 rounded-full transition-all", i === step ? "w-8 bg-white" : "w-2 bg-white/40")}
              />
            ))}
          </div>
        </div>

        <Button
          onClick={() => (last ? setShowAuth(true) : setStep(step + 1))}
          size="lg"
          className="w-full h-14 rounded-2xl bg-card text-foreground hover:bg-card/90 text-base font-bold shadow-elevated"
        >
          {last ? "Create your account" : "Next"}
          <ChevronRight className="ml-1 h-5 w-5" />
        </Button>
      </div>
    </AppShell>
  );
}
