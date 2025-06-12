
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Link, BarChart2, BrainCircuit, Plus } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchBusinesses } from "@/utils/supabase/businessHelpers";
import { fetchSurveysForBusiness } from "@/utils/supabase/businessHelpers";
import { getSurveySubmissionStats } from "@/utils/supabase/surveySubmissionHelpers";
import BusinessSurveyCard from "./BusinessSurveyCard";

const BusinessList = () => {
  const { data: businessesResult, isLoading, error } = useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses
  });

  // Extract businesses array from the result
  const businesses = businessesResult?.success ? businessesResult.data || [] : [];

  console.log('BusinessList render:', { businessesResult, businesses, isLoading, error });

  if (isLoading) {
    return <div className="text-center py-10">Loading businesses...</div>;
  }

  if (error) {
    console.error('BusinessList error:', error);
    return (
      <div className="text-center py-10">
        <p className="text-red-400 mb-4">Error loading businesses. Please try again.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {businesses.map((business) => (
        <BusinessSurveyCard key={business.id} business={business} />
      ))}

      {businesses.length === 0 && (
        <div className="col-span-2 text-center py-12">
          <div className="mb-6">
            <div className="w-16 h-16 bg-clari-darkAccent rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="text-clari-muted" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">No businesses yet</h3>
            <p className="text-clari-muted">
              Create your first business to start managing surveys and campaigns.
            </p>
          </div>
          <Button className="gap-2" asChild>
            <RouterLink to="#" onClick={() => window.location.reload()}>
              <Plus size={16} />
              Add Your First Business
            </RouterLink>
          </Button>
        </div>
      )}
    </div>
  );
};

export default BusinessList;
