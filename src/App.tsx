
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import InstagramCampaigns from "./pages/InstagramCampaigns";
import DatabasePage from "./pages/Database";
import AIInsights from "./pages/AIInsights";
import NotFound from "./pages/NotFound";
import Businesses from "./pages/Businesses";
import BusinessDetail from "./pages/BusinessDetail";
import Survey from "./pages/Survey";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/businesses" element={<Businesses />} />
          <Route path="/business/:id" element={<BusinessDetail />} />
          <Route path="/survey/:id" element={<Survey />} />
          <Route path="/survey/create/:businessId" element={<Survey />} />
          <Route path="/instagram-campaigns/:businessId" element={<InstagramCampaigns />} />
          <Route path="/database/:businessId" element={<DatabasePage />} />
          <Route path="/ai-insights/:businessId" element={<AIInsights />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
