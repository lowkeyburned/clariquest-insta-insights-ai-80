
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Link, BarChart2, BrainCircuit, Plus, Sparkles } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchBusinesses } from "@/utils/supabase/businessHelpers";
import BusinessSurveyCard from "./BusinessSurveyCard";

const BusinessList = () => {
  const { data: businessesResult, isLoading, error } = useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses
  });

  const businesses = businessesResult?.success ? businessesResult.data || [] : [];

  console.log('BusinessList render:', { businessesResult, businesses, isLoading, error });

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-clari-darkCard rounded-full border border-clari-darkAccent/30">
          <div className="w-5 h-5 border-2 border-clari-gold border-t-transparent rounded-full animate-spin"></div>
          <span className="text-clari-text font-medium">Loading businesses...</span>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('BusinessList error:', error);
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto">
          <div className="p-4 bg-red-500/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Building2 className="text-red-400" size={36} />
          </div>
          <h3 className="text-xl font-semibold text-clari-text mb-2">Something went wrong</h3>
          <p className="text-red-400 mb-6">Error loading businesses. Please try again.</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="border-red-400/30 text-red-400 hover:bg-red-400/10"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {businesses.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {businesses.map((business) => (
            <BusinessSurveyCard key={business.id} business={business} />
          ))}
        </div>
      )}

      {businesses.length === 0 && (
        <div className="text-center py-20">
          <div className="max-w-lg mx-auto">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-clari-gold/20 to-clari-gold/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-clari-gold/20">
                <Building2 className="text-clari-gold" size={48} />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-clari-gold to-clari-gold/80 rounded-full flex items-center justify-center">
                  <Sparkles className="text-clari-darkBg" size={16} />
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-clari-text mb-4">
              Welcome to ClariQuest
            </h3>
            <p className="text-clari-muted mb-8 text-lg leading-relaxed">
              Create your first business profile to start collecting valuable customer feedback 
              and unlock powerful AI-driven insights.
            </p>
            
            <div className="space-y-4">
              <Button 
                className="bg-gradient-to-r from-clari-gold to-clari-gold/80 hover:from-clari-gold/90 hover:to-clari-gold/70 text-clari-darkBg font-semibold px-8 py-3 text-base"
                asChild
              >
                <RouterLink to="#" onClick={() => window.location.reload()}>
                  <Plus size={18} className="mr-2" />
                  Create Your First Business
                </RouterLink>
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-clari-darkAccent/30">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-clari-darkAccent/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FileText className="text-clari-gold" size={24} />
                  </div>
                  <h4 className="font-medium text-clari-text mb-1">Create Surveys</h4>
                  <p className="text-sm text-clari-muted">Build custom surveys to gather feedback</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-clari-darkAccent/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BarChart2 className="text-clari-gold" size={24} />
                  </div>
                  <h4 className="font-medium text-clari-text mb-1">Analyze Data</h4>
                  <p className="text-sm text-clari-muted">Get detailed analytics and insights</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-clari-darkAccent/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BrainCircuit className="text-clari-gold" size={24} />
                  </div>
                  <h4 className="font-medium text-clari-text mb-1">AI Insights</h4>
                  <p className="text-sm text-clari-muted">Leverage AI for deeper understanding</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessList;
