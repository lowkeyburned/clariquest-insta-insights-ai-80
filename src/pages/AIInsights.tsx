
import { useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit, BarChart3, Database, MessageSquare } from "lucide-react";
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
      
      // Since database tables don't exist, return null
      console.log('Business tables do not exist - cannot fetch business data');
      return null;
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-clari-gold/10">
                <BrainCircuit className="text-clari-gold" size={32} />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">AI Business Assistant</h1>
            <p className="text-clari-muted text-lg">Select a business to access AI-powered insights and tools</p>
          </div>

          <Card className="bg-clari-darkCard border-clari-darkAccent max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Choose Your Business</CardTitle>
              <p className="text-clari-muted">Select a business to unlock AI-powered survey creation, data visualization, and database insights</p>
            </CardHeader>
            <CardContent className="p-8">
              <BusinessSelector onSelectBusiness={handleBusinessSelect} />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clari-gold mx-auto mb-4"></div>
            <p className="text-clari-muted">Loading business details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!business) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-red-400 mb-4 text-xl">Business not found</div>
            <Button onClick={() => setSelectedBusinessId(null)} variant="outline">
              Back to Business Selection
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => setSelectedBusinessId(null)} 
            className="mb-6 gap-2 hover:bg-clari-darkAccent"
          >
            <ArrowLeft size={16} />
            Change Business
          </Button>
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-clari-gold/10">
                <BrainCircuit className="text-clari-gold" size={32} />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">AI Business Assistant</h1>
            <p className="text-clari-muted text-lg">AI-powered tools for <span className="text-clari-gold font-medium">{business.name}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <AIAssistantCard
            type="survey"
            title="Survey AI"
            description="Create intelligent surveys and questionnaires for customer feedback with AI assistance"
            icon={MessageSquare}
            business={business}
          />
          
          <AIAssistantCard
            type="chart"
            title="Chart AI"
            description="Generate data visualizations and analytical insights from your business data"
            icon={BarChart3}
            business={business}
          />
          
          <AIAssistantCard
            type="database"
            title="Database AI"
            description="Query and analyze your business data using natural language commands"
            icon={Database}
            business={business}
          />
        </div>
      </div>
    </MainLayout>
  );
};

// Business selection component
const BusinessSelector = ({ onSelectBusiness }: { onSelectBusiness: (id: string) => void }) => {
  const { data: businesses, isLoading, error } = useQuery({
    queryKey: ['businesses'],
    queryFn: async () => {
      // Since database tables don't exist, return empty array
      console.log('Business tables do not exist - returning empty array');
      return [];
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clari-gold mx-auto mb-4"></div>
        <p className="text-clari-muted">Loading businesses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Error loading businesses. Please try again.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const businessList = Array.isArray(businesses) ? businesses : [];

  return (
    <div className="text-center py-12">
      <div className="mb-4">
        <div className="w-16 h-16 bg-clari-darkAccent rounded-full flex items-center justify-center mx-auto mb-4">
          <Database className="text-clari-muted" size={32} />
        </div>
        <p className="text-clari-muted text-lg mb-2">No businesses found</p>
        <p className="text-sm text-clari-muted">Database tables were cleared. Please recreate the database schema to start adding businesses.</p>
      </div>
      <Button variant="outline" className="gap-2">
        <Database size={16} />
        Create Database Schema
      </Button>
    </div>
  );
};

export default AIInsights;
