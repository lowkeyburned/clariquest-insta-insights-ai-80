
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Lightbulb, ArrowLeft, BrainCircuit, BarChart, LineChart, PieChart } from "lucide-react";
import InsightGenerator from "@/components/ai-insights/InsightGenerator";
import RecentInsights from "@/components/ai-insights/RecentInsights";
import UserEngagement from "@/components/ai-insights/UserEngagement";
import { BusinessData } from "@/components/business/BusinessForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const AIInsights = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  // Fetch business data from Supabase
  const { data: business, isLoading } = useQuery({
    queryKey: ['business', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();
      
      if (error) throw error;
      return data as BusinessData;
    },
    enabled: !!businessId
  });

  // Fetch all businesses for the current user
  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*');
      
      if (error) throw error;
      return (data || []) as BusinessData[];
    }
  });

  const handleGenerateInsight = () => {
    setIsGeneratingInsight(true);
    
    // Simulate AI insight generation
    setTimeout(() => {
      setIsGeneratingInsight(false);
      toast("New Insight Generated", {
        description: "AI has generated a new insight based on your data.",
      });
    }, 2000);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p>Loading business data...</p>
        </div>
      </MainLayout>
    );
  }

  // If no business is selected, show the list of businesses
  if (!businessId) {
    return (
      <MainLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">AI Insights</h1>
          <p className="text-clari-muted mt-1">
            Select a business to view AI-powered analytics and recommendations
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
                  Generate AI insights and predictions for {business.name}
                </p>
              </div>
            </Card>
          ))}
        </div>
        
        {businesses.length === 0 && (
          <div className="text-center py-12 border border-dashed border-clari-darkAccent rounded-lg">
            <BrainCircuit size={40} className="mx-auto text-clari-muted mb-4" />
            <h3 className="text-xl font-medium mb-2">No Businesses Found</h3>
            <p className="text-clari-muted mb-4">
              Add a business first to start generating AI insights
            </p>
            <Button asChild>
              <Link to="/businesses">Add Business</Link>
            </Button>
          </div>
        )}
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
          <h1 className="text-3xl font-bold">AI Insights Dashboard</h1>
          <p className="text-clari-muted mt-1">
            {business ? `Unlock deeper insights for ${business.name} with AI-driven analysis` : 'Loading...'}
          </p>
        </div>
        <Button 
          className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90"
          onClick={handleGenerateInsight}
          disabled={isGeneratingInsight}
        >
          <Lightbulb size={16} />
          {isGeneratingInsight ? "Generating..." : "Generate New Insight"}
        </Button>
      </div>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="bg-clari-darkCard">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <InsightGenerator businesses={business ? [business] : []} />
              <RecentInsights />
            </div>
            
            <div className="space-y-6">
              <UserEngagement />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="predictions" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-clari-darkCard border-clari-darkAccent">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Response Rate Prediction</CardTitle>
                  <LineChart size={20} className="text-clari-gold" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 border border-dashed border-clari-darkAccent rounded-md flex items-center justify-center">
                  <p className="text-clari-muted">AI-predicted response rate trend for next quarter</p>
                </div>
                <div className="mt-4 p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <h3 className="text-sm font-medium mb-2">Key Prediction</h3>
                  <p className="text-sm text-clari-muted">
                    Based on historical data, expect a 23% increase in survey responses during the summer season.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-clari-darkCard border-clari-darkAccent">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Customer Sentiment Forecast</CardTitle>
                  <BarChart size={20} className="text-clari-gold" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 border border-dashed border-clari-darkAccent rounded-md flex items-center justify-center">
                  <p className="text-clari-muted">AI-predicted customer sentiment changes</p>
                </div>
                <div className="mt-4 p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <h3 className="text-sm font-medium mb-2">Key Prediction</h3>
                  <p className="text-sm text-clari-muted">
                    Customer satisfaction is projected to improve by 12% following the upcoming product update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-clari-darkCard border-clari-darkAccent mt-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Market Trend Analysis</CardTitle>
                <PieChart size={20} className="text-clari-gold" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-clari-darkBg rounded-md border border-clari-darkAccent mb-4">
                <h3 className="font-medium mb-2">AI-Generated Market Predictions</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>User engagement is expected to peak in August based on seasonal patterns.</li>
                  <li>Mobile usage of your platform is predicted to increase by 35% in the next quarter.</li>
                  <li>Competitor activity suggests a potential market shift toward video-based surveys.</li>
                  <li>Demographics analysis indicates growing interest from the 25-34 age segment.</li>
                </ul>
              </div>
              <Button className="w-full">Generate Detailed Prediction Report</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="mt-6">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>AI-Powered Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <div className="flex items-start gap-3">
                    <div className="bg-clari-gold rounded-full p-2 mt-1">
                      <Lightbulb size={16} className="text-black" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Survey Design Improvement</h3>
                      <p className="text-sm text-clari-muted mb-2">
                        Analysis shows that surveys with 5-7 questions have 40% higher completion rates than longer surveys.
                      </p>
                      <Button variant="outline" size="sm">Apply Recommendation</Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <div className="flex items-start gap-3">
                    <div className="bg-clari-gold rounded-full p-2 mt-1">
                      <Lightbulb size={16} className="text-black" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Engagement Strategy</h3>
                      <p className="text-sm text-clari-muted mb-2">
                        Sending surveys between 1-3 PM on Tuesdays results in 28% higher open rates based on your audience behavior.
                      </p>
                      <Button variant="outline" size="sm">Apply Recommendation</Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <div className="flex items-start gap-3">
                    <div className="bg-clari-gold rounded-full p-2 mt-1">
                      <Lightbulb size={16} className="text-black" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Question Phrasing</h3>
                      <p className="text-sm text-clari-muted mb-2">
                        Using more conversational language in your survey questions could increase response accuracy by 15%.
                      </p>
                      <Button variant="outline" size="sm">Apply Recommendation</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default AIInsights;
