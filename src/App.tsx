
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SurveyAnalysis from "./pages/SurveyAnalysis";
import InstagramMessaging from "./pages/InstagramMessaging";
import LocationTargeting from "./pages/LocationTargeting";
import DatabasePage from "./pages/Database";
import AIInsights from "./pages/AIInsights";
import QuestionEngine from "./pages/QuestionEngine";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/survey-analysis" element={<SurveyAnalysis />} />
          <Route path="/instagram-messaging" element={<InstagramMessaging />} />
          <Route path="/location-targeting" element={<LocationTargeting />} />
          <Route path="/database" element={<DatabasePage />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/question-engine" element={<QuestionEngine />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
