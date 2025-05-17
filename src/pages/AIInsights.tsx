
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BusinessData, BusinessWithSurveyCount } from "@/components/business/BusinessForm";
import InsightGenerator from "@/components/ai-insights/InsightGenerator";
import RecentInsights from "@/components/ai-insights/RecentInsights";
import BusinessList from "@/components/business/BusinessList";

const AIInsights = () => {
  const { businessId } = useParams<{ businessId: string }>();
  
  const { data: business, isLoading } = useQuery({
    queryKey: ['business', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();
      
      if (error) throw error;
      return data as BusinessWithSurveyCount;
    },
    enabled: !!businessId
  });

  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*');
      
      if (error) throw error;
      return (data || []) as BusinessWithSurveyCount[];
    }
  });

  // If no businessId is provided, show the business listing
  if (!businessId) {
    return (
      <MainLayout>
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <BrainCircuit className="text-clari-gold" size={32} />
            <div>
              <h1 className="text-3xl font-bold">AI Insights</h1>
              <p className="text-clari-muted mt-1">Select a business to view AI insights</p>
            </div>
          </div>
        </div>

        <BusinessList />
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="text-center py-12">Loading business details...</div>
      </MainLayout>
    );
  }

  if (!business) {
    return (
      <MainLayout>
        <div className="text-center py-12">Business not found</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link to={`/business/${businessId}`} className="gap-2">
            <ArrowLeft size={16} />
            Back to Business
          </Link>
        </Button>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BrainCircuit className="text-clari-gold" size={32} />
            <div>
              <h1 className="text-3xl font-bold">AI Insights</h1>
              <p className="text-clari-muted mt-1">Get AI-powered insights for {business.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Generate New Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <InsightGenerator business={business} />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Recent Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentInsights businessId={business.id || ''} />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AIInsights;
