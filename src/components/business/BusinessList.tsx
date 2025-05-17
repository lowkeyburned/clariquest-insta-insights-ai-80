
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Link, BarChart2, BrainCircuit } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { BusinessData, BusinessWithSurveyCount } from "./BusinessForm";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const BusinessList = () => {
  const { data: businesses = [], isLoading, error } = useQuery({
    queryKey: ['businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*');
      
      if (error) throw error;
      
      // Fetch survey counts for each business (if needed)
      const businessesWithCounts: BusinessWithSurveyCount[] = await Promise.all((data || []).map(async (business) => {
        // You can fetch survey counts here if needed
        return {
          ...business,
          surveyCount: 0 // Set default or fetch actual count
        };
      }));
      
      return businessesWithCounts;
    }
  });

  if (isLoading) {
    return <div className="text-center py-10">Loading businesses...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error loading businesses. Please try again.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {businesses.map((business) => (
        <Card key={business.id} className="bg-clari-darkCard border-clari-darkAccent">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="text-clari-gold" size={24} />
                <CardTitle>{business.name}</CardTitle>
              </div>
              {business.website && (
                <Button variant="outline" size="sm" asChild>
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <Link size={14} />
                    Website
                  </a>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-clari-muted">{business.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-clari-muted">
                <FileText size={16} />
                <span>{business.surveyCount || 0} Surveys</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <RouterLink to={`/survey/create/${business.id}`} className="gap-2">
                    <FileText size={14} />
                    Surveys
                  </RouterLink>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <RouterLink to={`/business/${business.id}`} className="gap-2">
                    <BarChart2 size={14} />
                    Analysis
                  </RouterLink>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <RouterLink to={`/ai-insights/${business.id}`} className="gap-2">
                    <BrainCircuit size={14} />
                    AI Insights
                  </RouterLink>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {businesses.length === 0 && (
        <div className="col-span-2 text-center py-12 text-clari-muted">
          No businesses found. Add your first business using the form above.
        </div>
      )}
    </div>
  );
};

export default BusinessList;
