import { ArrowLeft, Calendar, MapPin, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/w2w/AppShell";
import { workshops, pastWorkshops } from "@/lib/w2w-data";
import { toast } from "sonner";

export default function Workshops() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <header className="bg-gold text-gold-foreground rounded-b-3xl px-5 pt-12 pb-5 shadow-card">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-xl bg-foreground/10 flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs opacity-80">Workshop Hub</p>
            <h1 className="text-xl font-extrabold">Learn. Build. Earn.</h1>
          </div>
        </div>
      </header>

      <section className="px-5 mt-4">
        <h2 className="text-sm font-bold mb-2">Upcoming events</h2>
        <div className="space-y-3">
          {workshops.map((w) => (
            <div key={w.id} className="rounded-2xl bg-card border border-border p-4 shadow-card">
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 rounded-xl bg-primary text-primary-foreground flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold opacity-80 uppercase">{w.date.split(" ")[0]}</span>
                  <span className="text-lg font-extrabold leading-none">{w.date.split(" ")[1]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/15 rounded-full px-2 py-0.5">{w.tag}</span>
                  <p className="mt-1 text-sm font-extrabold leading-tight">{w.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{w.time}</p>
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{w.location}</p>
                </div>
              </div>
              <Button onClick={() => toast.success(`Registered for ${w.title}`)} className="mt-3 w-full h-10 rounded-xl bg-primary hover:bg-primary/90 font-bold text-xs">
                Register
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-sm font-bold mb-2">Past workshops</h2>
        <div className="space-y-2">
          {pastWorkshops.map((w) => (
            <div key={w.id} className="rounded-2xl bg-card border border-border p-3.5 shadow-card flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-card-muted flex items-center justify-center text-xl">📸</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{w.title}</p>
                <p className="text-xs text-muted-foreground">{w.date}</p>
              </div>
              {w.certificate && (
                <button onClick={() => toast("Certificate downloaded")} className="inline-flex items-center gap-1 text-xs font-bold text-gold bg-gold/15 rounded-full px-2.5 py-1.5">
                  <Award className="h-3.5 w-3.5" /> Cert
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
