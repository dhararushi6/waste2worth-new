import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AppShell from "@/components/w2w/AppShell";
import { toast } from "sonner";

export default function Pickup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ address: "Tagore Hostel, Block C, Room 214", date: "Tomorrow", slot: "10–12 AM", notes: "" });

  return (
    <AppShell>
      <header className="bg-olive text-olive-foreground rounded-b-3xl px-5 pt-12 pb-5 shadow-card">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs opacity-80">Doorstep service</p>
            <h1 className="text-xl font-extrabold">Book a Pickup</h1>
          </div>
        </div>
      </header>

      <section className="px-5 mt-4 space-y-4">
        <Field label="Pickup address">
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="rounded-xl h-12" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <select value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full h-12 rounded-xl border border-border bg-card px-3 text-sm font-semibold">
              {["Today", "Tomorrow", "This weekend"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Time slot">
            <select value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })} className="w-full h-12 rounded-xl border border-border bg-card px-3 text-sm font-semibold">
              {["8–10 AM", "10–12 AM", "2–4 PM", "5–7 PM"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Notes (optional)">
          <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="What are we picking up?" className="rounded-xl min-h-[96px]" />
        </Field>

        <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 flex items-start gap-3">
          <Truck className="h-5 w-5 text-primary mt-0.5" />
          <p className="text-xs text-foreground/80">A volunteer will arrive within your selected slot. You'll earn coins after weighing.</p>
        </div>

        <Button
          onClick={() => { toast.success("Pickup request confirmed!"); navigate("/home"); }}
          className="w-full h-13 py-3.5 rounded-2xl bg-olive text-olive-foreground hover:bg-olive/90 font-bold text-base"
        >
          Confirm Pickup
        </Button>
      </section>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
