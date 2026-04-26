import { Navigate } from "react-router-dom";
import Onboarding from "./Onboarding";
import { useW2W } from "@/store/w2w-store";

const Index = () => {
  const authed = useW2W((s) => s.authed);
  if (authed) return <Navigate to="/home" replace />;
  return <Onboarding />;
};

export default Index;
