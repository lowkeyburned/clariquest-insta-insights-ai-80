
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BusinessWithSurveyCount } from "@/utils/types/database";
import BusinessList from "@/components/business/BusinessList";
import ChatInterface from "@/components/ai-insights/ChatInterface";

const AIInsights = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(businessId || null);
  
  const { data: business, isLoading } = useQuery({
    queryKey: ['business', selectedBusinessId],
    queryFn: async () => {
      if (!selectedBusinessId) return null;
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', selectedBusinessId)
        .single();
      
      if (error) throw error;
      return data as BusinessWithSurveyCount;
    },
    enabled: !!selectedBusinessId
  });

  const handleBusinessSelect = (id: string) => {
    setSelectedBusinessId(id);
  };

  // If no business is selected, show the business selection screen
  if (!selectedBusinessId) {
    return (
      <MainLayout>
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <BrainCircuit className="text-clari-gold" size={32} />
            <div>
              <h1 className="text-3xl font-bold">AI Insights</h1>
              <p className="text-clari-muted mt-1">Select a business to start the AI chat</p>
            </div>
          </div>
        </div>

        <Card className="bg-clari-darkCard border-clari-darkAccent mb-6">
          <CardHeader>
            <CardTitle>Select a Business</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Choose a business to generate AI insights for:</p>
            <BusinessSelector onSelectBusiness={handleBusinessSelect} />
          </CardContent>
        </Card>
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
        <Button variant="outline" onClick={() => setSelectedBusinessId(null)} className="mb-4 gap-2">
          <ArrowLeft size={16} />
          Change Business
        </Button>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BrainCircuit className="text-clari-gold" size={32} />
            <div>
              <h1 className="text-3xl font-bold">AI Chat</h1>
              <p className="text-clari-muted mt-1">Chat with AI to get insights for {business.name}</p>
            </div>
          </div>
        </div>
      </div>

      <ChatInterface business={business} />
    </MainLayout>
  );
};

// Simple component to select a business from a list
const BusinessSelector = ({ onSelectBusiness }: { onSelectBusiness: (id: string) => void }) => {
  const { data: businesses, isLoading, error } = useQuery({
    queryKey: ['businesses'],
    queryFn: async () => {
      console.log('Fetching businesses...');
      const { data, error } = await supabase
        .from('businesses')
        .select('*');
      
      if (error) {
        console.error('Error fetching businesses:', error);
        throw error;
      }
      
      console.log('Businesses fetched:', data);
      return (data || []) as BusinessWithSurveyCount[];
    }
  });

  console.log('BusinessSelector render - businesses:', businesses, 'isLoading:', isLoading, 'error:', error);

  if (isLoading) return <div>Loading businesses...</div>;

  if (error) {
    console.error('Query error:', error);
    return <div>Error loading businesses. Please try again.</div>;
  }

  // Ensure businesses is always an array
  const businessList = Array.isArray(businesses) ? businesses : [];

  if (businessList.length === 0) {
    return <div>No businesses found. Please create a business first.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {businessList.map((business) => (
        <Card 
          key={business.id} 
          className="bg-clari-darkBg border-clari-darkAccent hover:border-clari-gold/50 transition-colors cursor-pointer"
          onClick={() => onSelectBusiness(business.id || '')}
        >
          <CardContent className="p-4">
            <h3 className="font-medium">{business.name}</h3>
            <p className="text-sm text-clari-muted truncate">{business.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AIInsights;
