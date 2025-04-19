
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import InsightGenerator from "@/components/ai-insights/InsightGenerator";
import RecentInsights from "@/components/ai-insights/RecentInsights";
import TrendingTopics from "@/components/ai-insights/TrendingTopics";
import UserEngagement from "@/components/ai-insights/UserEngagement";

const AIInsights = () => {
  // Mock business data - in a real app, this would come from your storage
  const businesses = JSON.parse(localStorage.getItem('businesses') || '[]');

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">AI Insights</h1>
          <p className="text-clari-muted mt-1">Unlock deeper insights with AI-driven analysis</p>
        </div>
        <Button className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90">
          <Lightbulb size={16} />
          Generate New Insight
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <InsightGenerator businesses={businesses} />
          <RecentInsights />
        </div>
        
        <div className="space-y-6">
          <TrendingTopics />
          <UserEngagement />
        </div>
      </div>
    </MainLayout>
  );
};

export default AIInsights;
