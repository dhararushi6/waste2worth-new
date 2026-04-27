import { Navigate } from "react-router-dom";
import Onboarding from "./Onboarding";
import { useW2W } from "@/store/w2w-store";

const Index = () => {
  const authed = useW2W((s) => s.authed);
  const ready = useW2W((s) => s.ready);
  if (!ready) return null;
  if (authed) return <Navigate to="/home" replace />;
  return <Onboarding />;
};

export default Index;
