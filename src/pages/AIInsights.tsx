
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Lightbulb, ArrowLeft, BrainCircuit } from "lucide-react";
import InsightGenerator from "@/components/ai-insights/InsightGenerator";
import RecentInsights from "@/components/ai-insights/RecentInsights";
import TrendingTopics from "@/components/ai-insights/TrendingTopics";
import UserEngagement from "@/components/ai-insights/UserEngagement";
import { BusinessData } from "@/components/business/BusinessForm";
import { Card } from "@/components/ui/card";

const AIInsights = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);

  useEffect(() => {
    const loadBusinesses = () => {
      try {
        const storedBusinesses = localStorage.getItem('businesses');
        if (storedBusinesses) {
          const parsedBusinesses = JSON.parse(storedBusinesses);
          setBusinesses(parsedBusinesses);
          
          if (businessId) {
            const foundBusiness = parsedBusinesses.find((b: BusinessData) => b.id === Number(businessId));
            if (foundBusiness) {
              setBusiness(foundBusiness);
            }
          }
        }
      } catch (error) {
        console.error("Error loading businesses:", error);
      }
    };

    loadBusinesses();
  }, [businessId]);

  // If no businessId is provided, show a business selector
  if (!businessId && businesses.length > 0) {
    return (
      <MainLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Select a Business</h1>
          <p className="text-clari-muted mt-1">
            Choose a business to view AI insights
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <Card 
              key={business.id} 
              className="cursor-pointer bg-clari-darkCard border-clari-darkAccent hover:border-clari-gold transition-colors"
              onClick={() => navigate(`/ai-insights/${business.id}`)}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <BrainCircuit className="text-clari-gold" />
                  <h3 className="text-xl font-medium">{business.name}</h3>
                </div>
                <p className="text-sm text-clari-muted">
                  View AI insights for {business.name}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link to={businessId ? `/business/${businessId}` : "/businesses"} className="gap-2">
            <ArrowLeft size={16} />
            {businessId ? "Back to Business" : "Back to Businesses"}
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
          <InsightGenerator businesses={business ? [business] : null} />
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
