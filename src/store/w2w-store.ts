// Global state synced with Supabase auth & profiles
import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { user as initialUser } from "@/lib/w2w-data";

type Coupon = { id: string; rewardName: string; cost: number; code: string; createdAt: number };
type RecentItem = { id: number | string; title: string; subtitle: string; coins: number; when: string };

type State = {
  authed: boolean;
  ready: boolean;
  userId: string | null;
  name: string;
  city: string;
  coins: number;
  totalKg: number;
  coupons: Coupon[];
  recent: RecentItem[];
};

let state: State = {
  authed: false,
  ready: false,
  userId: null,
  name: initialUser.name,
  city: "Bengaluru",
  coins: 0,
  totalKg: 0,
  coupons: [],
  recent: [],
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (patch: Partial<State>) => { state = { ...state, ...patch }; emit(); };

async function loadProfile(userId: string) {
  const [{ data: profile }, { data: scans }, { data: redemptions }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("scans").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(8),
    supabase.from("redemptions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
  ]);

  set({
    coins: profile?.coins ?? 0,
    totalKg: Number(profile?.total_kg ?? 0),
    name: profile?.name ?? state.name,
    city: profile?.city ?? "Bengaluru",
    recent: (scans ?? []).map((s) => ({
      id: s.id,
      title: `${s.device_name} (${s.condition_label})`,
      subtitle: `${Number(s.weight_kg).toFixed(2)} kg · ${s.condition_pct}% condition`,
      coins: s.coins_earned,
      when: new Date(s.created_at).toLocaleDateString(),
    })),
    coupons: (redemptions ?? []).map((r) => ({
      id: r.id, rewardName: r.reward_name, cost: r.cost, code: r.code,
      createdAt: new Date(r.created_at).getTime(),
    })),
  });
}

// Init auth listener
supabase.auth.onAuthStateChange((_e, session) => {
  if (session?.user) {
    set({ authed: true, userId: session.user.id, ready: true });
    setTimeout(() => loadProfile(session.user.id), 0);
  } else {
    set({ authed: false, userId: null, ready: true, coins: 0, totalKg: 0, coupons: [], recent: [] });
  }
});
supabase.auth.getSession().then(({ data }) => {
  if (data.session?.user) {
    set({ authed: true, userId: data.session.user.id, ready: true });
    loadProfile(data.session.user.id);
  } else {
    set({ ready: true });
  }
});

export const w2wStore = {
  getState: () => state,
  subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); },

  async signOut() { await supabase.auth.signOut(); },

  async addScan(opts: {
    deviceId: string; deviceName: string; weightKg: number;
    conditionPct: number; conditionLabel: string; coinsEarned: number; aiNotes?: string;
  }) {
    if (!state.userId) return;
    const { data, error } = await supabase.from("scans").insert({
      user_id: state.userId,
      device_id: opts.deviceId,
      device_name: opts.deviceName,
      weight_kg: opts.weightKg,
      condition_pct: opts.conditionPct,
      condition_label: opts.conditionLabel,
      coins_earned: opts.coinsEarned,
      ai_notes: opts.aiNotes,
    }).select().single();
    if (error) throw error;

    const newCoins = state.coins + opts.coinsEarned;
    const newKg = +(state.totalKg + opts.weightKg).toFixed(2);
    await supabase.from("profiles").update({ coins: newCoins, total_kg: newKg, updated_at: new Date().toISOString() }).eq("id", state.userId);

    set({
      coins: newCoins,
      totalKg: newKg,
      recent: [{
        id: data.id,
        title: `${opts.deviceName} (${opts.conditionLabel})`,
        subtitle: `${opts.weightKg.toFixed(2)} kg · ${opts.conditionPct}% condition`,
        coins: opts.coinsEarned,
        when: "Just now",
      }, ...state.recent].slice(0, 8),
    });
  },

  async redeem(rewardName: string, cost: number) {
    if (!state.userId || state.coins < cost) return false;
    const code = "W2W-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const newCoins = state.coins - cost;
    const { data, error } = await supabase.from("redemptions").insert({
      user_id: state.userId, reward_name: rewardName, cost, code,
    }).select().single();
    if (error) return false;
    await supabase.from("profiles").update({ coins: newCoins }).eq("id", state.userId);
    set({
      coins: newCoins,
      coupons: [{ id: data.id, rewardName, cost, code, createdAt: Date.now() }, ...state.coupons],
    });
    return code;
  },

  async createPickup(address: string, slot?: string) {
    if (!state.userId) return false;
    const { error } = await supabase.from("pickups").insert({
      user_id: state.userId, address, slot, status: "requested",
    });
    return !error;
  },
};

export function useW2W<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(w2wStore.subscribe, () => selector(w2wStore.getState()));
}
