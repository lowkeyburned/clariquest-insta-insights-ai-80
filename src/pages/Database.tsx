
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Table, Users, Building2, FileText, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface BusinessData {
  id: string;
  name: string;
  description: string;
  industry: string;
  owner_id: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

interface SurveyData {
  id: string;
  title: string;
  description: string;
  business_id: string;
  created_at: string;
  is_active: boolean;
}

interface ResponseData {
  id: string;
  survey_id: string;
  user_id: string;
  created_at: string;
}

const DatabasePage = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [surveys, setSurveys] = useState<SurveyData[]>([]);
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch businesses
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('*')
          .order('created_at', { ascending: false });

        if (businessError) throw businessError;

        // Transform business data to include website field
        const transformedBusinesses: BusinessData[] = (businessData || []).map(business => ({
          ...business,
          website: business.website || undefined
        }));

        setBusinesses(transformedBusinesses);

        // Fetch surveys
        const { data: surveyData, error: surveyError } = await supabase
          .from('surveys')
          .select('*')
          .order('created_at', { ascending: false });

        if (surveyError) throw surveyError;
        setSurveys(surveyData || []);

        // Fetch responses
        const { data: responseData, error: responseError } = await supabase
          .from('survey_responses')
          .select('*')
          .order('created_at', { ascending: false });

        if (responseError) throw responseError;
        setResponses(responseData || []);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-clari-gold animate-pulse" />
            <p className="text-lg text-clari-text">Loading database overview...</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    totalBusinesses: businesses.length,
    totalSurveys: surveys.length,
    totalResponses: responses.length,
    activeSurveys: surveys.filter(s => s.is_active).length,
  };

  return (
    <div className="container mx-auto p-6 bg-clari-darkBg min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-clari-text mb-2">Database Overview</h1>
        <p className="text-clari-muted">Monitor your application's data and performance metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-clari-text">Total Businesses</CardTitle>
            <Building2 className="h-4 w-4 text-clari-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-clari-gold">{stats.totalBusinesses}</div>
          </CardContent>
        </Card>

        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-clari-text">Total Surveys</CardTitle>
            <FileText className="h-4 w-4 text-clari-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-clari-gold">{stats.totalSurveys}</div>
          </CardContent>
        </Card>

        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-clari-text">Survey Responses</CardTitle>
            <TrendingUp className="h-4 w-4 text-clari-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-clari-gold">{stats.totalResponses}</div>
          </CardContent>
        </Card>

        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-clari-text">Active Surveys</CardTitle>
            <Users className="h-4 w-4 text-clari-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-clari-gold">{stats.activeSurveys}</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="businesses" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-clari-darkCard">
          <TabsTrigger value="businesses" className="data-[state=active]:bg-clari-gold data-[state=active]:text-black">
            Businesses
          </TabsTrigger>
          <TabsTrigger value="surveys" className="data-[state=active]:bg-clari-gold data-[state=active]:text-black">
            Surveys
          </TabsTrigger>
          <TabsTrigger value="responses" className="data-[state=active]:bg-clari-gold data-[state=active]:text-black">
            Responses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="businesses">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle className="text-clari-text">Businesses</CardTitle>
              <CardDescription className="text-clari-muted">
                All registered businesses in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {businesses.map((business) => (
                  <div
                    key={business.id}
                    className="flex items-center justify-between p-4 border border-clari-darkAccent rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-clari-text">{business.name}</h3>
                      <p className="text-sm text-clari-muted">{business.industry}</p>
                      <p className="text-xs text-clari-muted">
                        Created: {new Date(business.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/business/${business.id}`)}
                      className="border-clari-gold text-clari-gold hover:bg-clari-gold hover:text-black"
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surveys">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle className="text-clari-text">Surveys</CardTitle>
              <CardDescription className="text-clari-muted">
                All surveys created in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {surveys.map((survey) => (
                  <div
                    key={survey.id}
                    className="flex items-center justify-between p-4 border border-clari-darkAccent rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-clari-text">{survey.title}</h3>
                      <p className="text-sm text-clari-muted">{survey.description}</p>
                      <p className="text-xs text-clari-muted">
                        Created: {new Date(survey.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={survey.is_active ? "default" : "secondary"}
                        className={survey.is_active ? "bg-green-600" : ""}
                      >
                        {survey.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/survey-results/${survey.id}`)}
                        className="border-clari-gold text-clari-gold hover:bg-clari-gold hover:text-black"
                      >
                        View Results
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle className="text-clari-text">Survey Responses</CardTitle>
              <CardDescription className="text-clari-muted">
                All responses submitted to surveys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {responses.map((response) => (
                  <div
                    key={response.id}
                    className="flex items-center justify-between p-4 border border-clari-darkAccent rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-clari-text">Response #{response.id.slice(0, 8)}</h3>
                      <p className="text-sm text-clari-muted">Survey ID: {response.survey_id.slice(0, 8)}</p>
                      <p className="text-xs text-clari-muted">
                        Submitted: {new Date(response.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-clari-gold text-clari-gold">
                      Completed
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabasePage;
