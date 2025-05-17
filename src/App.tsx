
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import InstagramCampaigns from "./pages/InstagramCampaigns";
import InstagramMessaging from "./pages/InstagramMessaging";
import AIInsights from "./pages/AIInsights";
import NotFound from "./pages/NotFound";
import Businesses from "./pages/Businesses";
import BusinessDetail from "./pages/BusinessDetail";
import Survey from "./pages/Survey";
import SurveyResultsPage from "./pages/SurveyResults";
import Auth from "./pages/Auth";
import UserManagement from "./pages/UserManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />} />
            <Route path="/businesses" element={
              <ProtectedRoute>
                <Businesses />
              </ProtectedRoute>
            } />
            <Route path="/business/:id" element={
              <ProtectedRoute>
                <BusinessDetail />
              </ProtectedRoute>
            } />
            <Route path="/survey/:id" element={<Survey />} />
            <Route path="/survey/create/:businessId" element={
              <ProtectedRoute>
                <Survey />
              </ProtectedRoute>
            } />
            <Route path="/survey/results/:id" element={
              <ProtectedRoute>
                <SurveyResultsPage />
              </ProtectedRoute>
            } />
            <Route path="/instagram-campaigns" element={
              <ProtectedRoute>
                <InstagramCampaigns />
              </ProtectedRoute>
            } />
            <Route path="/instagram-campaigns/:businessId" element={
              <ProtectedRoute>
                <InstagramCampaigns />
              </ProtectedRoute>
            } />
            <Route path="/instagram-messaging" element={
              <ProtectedRoute>
                <InstagramMessaging />
              </ProtectedRoute>
            } />
            <Route path="/ai-insights" element={
              <ProtectedRoute>
                <AIInsights />
              </ProtectedRoute>
            } />
            <Route path="/ai-insights/:businessId" element={
              <ProtectedRoute>
                <AIInsights />
              </ProtectedRoute>
            } />
            <Route path="/user-management" element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
