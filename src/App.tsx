import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Scan from "./pages/Scan";
import MapScreen from "./pages/MapScreen";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";
import Workshops from "./pages/Workshops";
import Pickup from "./pages/Pickup";
import ReportIssue from "./pages/ReportIssue";
import History from "./pages/History";

const queryClient = new QueryClient();

// PROTECTED COMPONENT
const Protected = ({ children }: { children: JSX.Element }) => {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setAuthed(!!data?.user);
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center font-bold text-primary">
        Checking login...
      </div>
    );
  }

  return authed ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />

        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* All Protected Routes */}
            <Route path="/home" element={<Protected><Home /></Protected>} />
            <Route path="/scan" element={<Protected><Scan /></Protected>} />
            <Route path="/map" element={<Protected><MapScreen /></Protected>} />
            <Route path="/rewards" element={<Protected><Rewards /></Protected>} />
            <Route path="/profile" element={<Protected><Profile /></Protected>} />
            <Route path="/workshops" element={<Protected><Workshops /></Protected>} />
            <Route path="/pickup" element={<Protected><Pickup /></Protected>} />
            <Route path="/report" element={<Protected><ReportIssue /></Protected>} />
            <Route path="/history" element={<Protected><History /></Protected>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;