import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Home from "./pages/Home.tsx";
import Scan from "./pages/Scan.tsx";
import MapScreen from "./pages/MapScreen.tsx";
import Rewards from "./pages/Rewards.tsx";
import Profile from "./pages/Profile.tsx";
import Workshops from "./pages/Workshops.tsx";
import Pickup from "./pages/Pickup.tsx";
import ReportIssue from "./pages/ReportIssue.tsx";
import { useW2W } from "@/store/w2w-store";

const queryClient = new QueryClient();

const Protected = ({ children }: { children: JSX.Element }) => {
  const authed = useW2W((s) => s.authed);
  return authed ? children : <Navigate to="/" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Protected><Home /></Protected>} />
          <Route path="/scan" element={<Protected><Scan /></Protected>} />
          <Route path="/map" element={<Protected><MapScreen /></Protected>} />
          <Route path="/rewards" element={<Protected><Rewards /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/workshops" element={<Protected><Workshops /></Protected>} />
          <Route path="/pickup" element={<Protected><Pickup /></Protected>} />
          <Route path="/report" element={<Protected><ReportIssue /></Protected>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
