
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchBusinessById } from "@/utils/supabase/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Globe, Users, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BusinessWithSurveyCount } from "@/utils/types/database";

const BusinessDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: business, isLoading, error } = useQuery({
    queryKey: ['business', id],
    queryFn: async () => {
      if (!id) throw new Error('Business ID is required');
      const result = await fetchBusinessById(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-10">Loading business details...</div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-10 text-red-500">
          Error loading business details. Please try again.
        </div>
      </div>
    );
  }

  // Transform business to include missing properties for BusinessWithSurveyCount
  const businessWithCount: BusinessWithSurveyCount = {
    ...business,
    website: business.website || null,
    survey_count: 0 // This would be fetched separately if needed
  };

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="outline" 
        onClick={() => navigate(-1)} 
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-clari-gold" />
                <div>
                  <CardTitle className="text-2xl">{business.name}</CardTitle>
                  <CardDescription>{business.industry}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{business.description}</p>
              
              {business.website && (
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-4 w-4" />
                  <a 
                    href={business.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-clari-gold hover:underline"
                  >
                    {business.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => navigate(`/survey/create/${business.id}`)}
              >
                Create Survey
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/ai-insights/${business.id}`)}
              >
                View AI Insights
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Business Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Surveys:</span>
                  <span className="font-medium">{businessWithCount.survey_count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span className="font-medium">
                    {new Date(business.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetail;
