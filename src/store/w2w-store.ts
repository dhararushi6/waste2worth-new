// Lightweight global state without extra deps
import { useSyncExternalStore } from "react";
import { user as initialUser } from "@/lib/w2w-data";

type Coupon = { id: string; rewardName: string; cost: number; code: string; createdAt: number };
type State = {
  onboarded: boolean;
  authed: boolean;
  coins: number;
  totalKg: number;
  coupons: Coupon[];
  recent: { id: number; title: string; subtitle: string; coins: number; when: string }[];
};

let state: State = {
  onboarded: false,
  authed: false,
  coins: initialUser.coins,
  totalKg: initialUser.totalKg,
  coupons: [],
  recent: [],
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const w2wStore = {
  getState: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  completeOnboarding() { state = { ...state, onboarded: true }; emit(); },
  signIn() { state = { ...state, authed: true, onboarded: true }; emit(); },
  signOut() { state = { ...state, authed: false }; emit(); },
  addCoins(n: number) { state = { ...state, coins: state.coins + n }; emit(); },
  spendCoins(n: number) {
    if (state.coins < n) return false;
    state = { ...state, coins: state.coins - n };
    emit();
    return true;
  },
  addRecent(item: State["recent"][number]) {
    state = { ...state, recent: [item, ...state.recent].slice(0, 6) };
    emit();
  },
  addKg(kg: number) { state = { ...state, totalKg: +(state.totalKg + kg).toFixed(2) }; emit(); },
  addCoupon(c: Coupon) { state = { ...state, coupons: [c, ...state.coupons] }; emit(); },
};

export function useW2W<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(w2wStore.subscribe, () => selector(w2wStore.getState()));
}
