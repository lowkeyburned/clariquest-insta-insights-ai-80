
import { useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit, BarChart3, Database, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BusinessWithSurveyCount } from "@/utils/types/database";
import AIAssistantCard from "@/components/ai-insights/AIAssistantCard";

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
              <h1 className="text-3xl font-bold">AI Business Assistant</h1>
              <p className="text-clari-muted mt-1">Select a business to access AI-powered insights</p>
            </div>
          </div>
        </div>

        <Card className="bg-clari-darkCard border-clari-darkAccent mb-6">
          <CardHeader>
            <CardTitle>Choose Your Business</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Select a business to unlock AI-powered survey creation, data visualization, and database insights:</p>
            <BusinessSelector onSelectBusiness={handleBusinessSelect} />
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clari-gold mx-auto mb-4"></div>
          Loading business details...
        </div>
      </MainLayout>
    );
  }

  if (!business) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">Business not found</div>
          <Button onClick={() => setSelectedBusinessId(null)}>
            Back to Business Selection
          </Button>
        </div>
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
              <h1 className="text-3xl font-bold">AI Business Assistant</h1>
              <p className="text-clari-muted mt-1">AI-powered tools for {business.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AIAssistantCard
          type="survey"
          title="Survey AI"
          description="Create intelligent surveys and questionnaires for customer feedback"
          icon={MessageSquare}
          business={business}
        />
        
        <AIAssistantCard
          type="chart"
          title="Chart AI"
          description="Generate data visualizations and analytical insights"
          icon={BarChart3}
          business={business}
        />
        
        <AIAssistantCard
          type="database"
          title="Database AI"
          description="Query and analyze your business data with natural language"
          icon={Database}
          business={business}
        />
      </div>
    </MainLayout>
  );
};

// Business selection component
const BusinessSelector = ({ onSelectBusiness }: { onSelectBusiness: (id: string) => void }) => {
  const { data: businesses, isLoading, error } = useQuery({
    queryKey: ['businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*');
      
      if (error) throw error;
      return (data || []) as BusinessWithSurveyCount[];
    }
  });

  if (isLoading) return <div className="text-center py-8">Loading businesses...</div>;

  if (error) {
    return <div className="text-center py-8 text-red-400">Error loading businesses. Please try again.</div>;
  }

  const businessList = Array.isArray(businesses) ? businesses : [];

  if (businessList.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-clari-muted mb-4">No businesses found.</p>
        <Button variant="outline">Create Your First Business</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {businessList.map((business) => (
        <Card 
          key={business.id} 
          className="bg-clari-darkBg border-clari-darkAccent hover:border-clari-gold/50 transition-all duration-200 cursor-pointer hover:scale-105"
          onClick={() => onSelectBusiness(business.id || '')}
        >
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-2">{business.name}</h3>
            <p className="text-sm text-clari-muted line-clamp-2">{business.description || 'No description available'}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AIInsights;
