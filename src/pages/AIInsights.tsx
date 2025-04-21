
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Lightbulb, ArrowLeft } from "lucide-react";
import InsightGenerator from "@/components/ai-insights/InsightGenerator";
import RecentInsights from "@/components/ai-insights/RecentInsights";
import TrendingTopics from "@/components/ai-insights/TrendingTopics";
import UserEngagement from "@/components/ai-insights/UserEngagement";
import { BusinessData } from "@/components/business/BusinessForm";

const AIInsights = () => {
  const { businessId } = useParams();
  const [business, setBusiness] = useState<BusinessData | null>(null);

  useEffect(() => {
    const loadBusiness = () => {
      try {
        const storedBusinesses = localStorage.getItem('businesses');
        if (storedBusinesses) {
          const businesses = JSON.parse(storedBusinesses);
          const foundBusiness = businesses.find((b: BusinessData) => b.id === Number(businessId));
          
          if (foundBusiness) {
            setBusiness(foundBusiness);
          }
        }
      } catch (error) {
        console.error("Error loading business:", error);
      }
    };

    loadBusiness();
  }, [businessId]);

  return (
    <MainLayout>
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link to={`/business/${businessId}`} className="gap-2">
            <ArrowLeft size={16} />
            Back to Business
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">AI Insights</h1>
          <p className="text-clari-muted mt-1">
            {business ? `Unlock deeper insights for ${business.name} with AI-driven analysis` : 'Loading...'}
          </p>
        </div>
        <Button className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90">
          <Lightbulb size={16} />
          Generate New Insight
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <InsightGenerator businesses={business ? [business] : []} />
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
