import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Truck, Clock, MapPin } from "lucide-react";
import AppShell from "@/components/w2w/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PickupRequest = {
  id: string;
  address: string;
  pickup_date: string;
  slot: string;
  notes: string;
  created_at: string;
  status: string;
};

export default function MyPickups() {
  const navigate = useNavigate();

  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [address, setAddress] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [slot, setSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const loadPickups = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("pickups")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Failed to load pickups");
      return;
    }

    setPickups(data || []);
  };

  useEffect(() => {
    loadPickups();
  }, []);

  const createPickup = async () => {
    if (!address || !pickupDate || !slot) {
      toast.error("Please fill address, date and slot");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login first");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("pickups").insert([
      {
        user_id: user.id,
        address,
        pickup_date: pickupDate,
        slot,
        notes,
        status: "requested",
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      toast.error("Pickup not saved");
      return;
    }

    toast.success("Pickup request saved");

    setAddress("");
    setPickupDate("");
    setSlot("");
    setNotes("");
    setShowForm(false);

    loadPickups();
  };

  return (
    <AppShell>
      <div className="p-4 pb-32">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1 className="text-xl font-extrabold">E-Waste Pickups</h1>
        </div>

        {showForm && (
          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm mb-5">
            <h2 className="text-lg font-bold mb-4">Book Pickup</h2>

            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full pickup address"
              className="w-full mb-3 px-4 py-3 rounded-xl border border-border bg-background"
            />

            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full mb-3 px-4 py-3 rounded-xl border border-border bg-background"
            />

            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className="w-full mb-3 px-4 py-3 rounded-xl border border-border bg-background"
            >
              <option value="">Select pickup slot</option>
              <option value="Morning 9 AM - 12 PM">Morning 9 AM - 12 PM</option>
              <option value="Afternoon 12 PM - 3 PM">Afternoon 12 PM - 3 PM</option>
              <option value="Evening 3 PM - 6 PM">Evening 3 PM - 6 PM</option>
            </select>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Device details / notes"
              className="w-full mb-4 px-4 py-3 rounded-xl border border-border bg-background min-h-24"
            />

            <Button
              onClick={createPickup}
              disabled={loading}
              className="w-full rounded-xl"
            >
              {loading ? "Saving..." : "Confirm Pickup"}
            </Button>

            <button
              onClick={() => setShowForm(false)}
              className="w-full mt-3 text-sm text-muted-foreground"
            >
              Cancel
            </button>
          </div>
        )}

        {pickups.length === 0 && !showForm ? (
          <div className="text-center pt-20">
            <Truck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />

            <p className="text-muted-foreground">No pickup requests yet.</p>

            <Button onClick={() => setShowForm(true)} className="mt-4">
              Book your first pickup
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {!showForm && (
              <Button onClick={() => setShowForm(true)} className="w-full mb-4">
                Book New Pickup
              </Button>
            )}

            {pickups.map((p) => (
              <div
                key={p.id}
                className="bg-card rounded-2xl p-4 border border-border shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(p.created_at).toLocaleDateString()}
                  </div>

                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                    {p.status}
                  </span>
                </div>

                <div className="mt-2 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm font-medium">{p.address}</p>
                </div>

                <p className="text-xs text-muted-foreground mt-1">
                  {p.pickup_date} • {p.slot}
                </p>

                {p.notes && (
                  <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                    📝 {p.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}