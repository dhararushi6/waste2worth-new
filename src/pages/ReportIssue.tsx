import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AppShell from "@/components/w2w/AppShell";
import { toast } from "sonner";

const issues = ["Kiosk full", "Kiosk damaged", "Wrong reading", "Missed pickup", "Other"];

export default function ReportIssue() {
  const navigate = useNavigate();
  const [type, setType] = useState(issues[0]);
  const [where, setWhere] = useState("");
  const [details, setDetails] = useState("");

  return (
    <AppShell>
      <header className="bg-destructive text-destructive-foreground rounded-b-3xl px-5 pt-12 pb-5 shadow-card">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs opacity-85">Help us improve</p>
            <h1 className="text-xl font-extrabold">Report an Issue</h1>
          </div>
        </div>
      </header>

      <section className="px-5 mt-4 space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {issues.map((i) => (
              <button
                key={i}
                onClick={() => setType(i)}
                className={`px-3 py-2 rounded-full text-xs font-bold border ${type === i ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}
              >{i}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</label>
          <Input className="mt-1.5 h-12 rounded-xl" placeholder="e.g. Block C kiosk" value={where} onChange={(e) => setWhere(e.target.value)} />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Details</label>
          <Textarea className="mt-1.5 rounded-xl min-h-[120px]" placeholder="Describe what happened…" value={details} onChange={(e) => setDetails(e.target.value)} />
        </div>

        <div className="rounded-2xl bg-gold/15 border border-gold/30 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-gold mt-0.5" />
          <p className="text-xs text-foreground/80">Reports help campus ops fix kiosks faster. You earn 5 W2W coins per verified report.</p>
        </div>

        <Button
          onClick={() => { toast.success("Report submitted. Thank you!"); navigate("/home"); }}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-bold text-base"
        >
          Submit Report
        </Button>
      </section>
    </AppShell>
  );
}
