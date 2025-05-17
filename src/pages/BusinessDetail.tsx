
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, PieChart, LineChart, Building2, ArrowLeft, FileText, Plus, Database, Instagram, Lightbulb } from "lucide-react";
import { BusinessData, BusinessWithSurveyCount } from "@/components/business/BusinessForm";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Use BusinessWithSurveyCount to support the surveyCount property
  const { data: business, isLoading } = useQuery({
    queryKey: ['business', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Add surveyCount to the business data
      const businessWithSurveyCount: BusinessWithSurveyCount = {
        ...data,
        surveyCount: 0 // Default value, you can fetch the actual count here
      };
      
      return businessWithSurveyCount;
    }
  });

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
          <Link to="/businesses" className="gap-2">
            <ArrowLeft size={16} />
            Back to Businesses
          </Link>
        </Button>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Building2 className="text-clari-gold" size={32} />
            <div>
              <h1 className="text-3xl font-bold">{business.name}</h1>
              <p className="text-clari-muted mt-1">{business.description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="default" className="bg-clari-gold hover:bg-clari-gold/90">
              <Link to={`/survey/create/${business.id}`} className="gap-2">
                <Plus size={16} />
                Create New Survey
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="pt-6">
            <Link to={`/database/${business.id}`} className="flex items-center gap-3">
              <Database size={24} className="text-clari-gold" />
              <div>
                <h3 className="text-lg font-medium">Database</h3>
                <p className="text-sm text-clari-muted">Manage business-specific data</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="pt-6">
            <Link to={`/instagram-campaigns/${business.id}`} className="flex items-center gap-3">
              <Instagram size={24} className="text-clari-gold" />
              <div>
                <h3 className="text-lg font-medium">Instagram Campaigns</h3>
                <p className="text-sm text-clari-muted">Run targeted Instagram campaigns</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="pt-6">
            <Link to={`/ai-insights/${business.id}`} className="flex items-center gap-3">
              <Lightbulb size={24} className="text-clari-gold" />
              <div>
                <h3 className="text-lg font-medium">AI Insights</h3>
                <p className="text-sm text-clari-muted">Get AI-powered business insights</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-clari-darkCard">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4 space-y-6">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Business Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-clari-darkBg p-4 rounded-md">
                  <div className="text-clari-muted mb-1">Website</div>
                  <div className="text-lg font-medium">
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-clari-gold hover:underline">
                      {business.website || "Not specified"}
                    </a>
                  </div>
                </div>
                <div className="bg-clari-darkBg p-4 rounded-md">
                  <div className="text-clari-muted mb-1">Total Surveys</div>
                  <div className="text-lg font-medium">{business.surveyCount || 0}</div>
                </div>
                <div className="bg-clari-darkBg p-4 rounded-md">
                  <div className="text-clari-muted mb-1">Total Responses</div>
                  <div className="text-lg font-medium">
                    {/* This would come from actual data in a real implementation */}
                    {Math.floor(Math.random() * 100) + 5}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-clari-darkCard border-clari-darkAccent">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-md">Response Distribution</CardTitle>
                  <PieChart size={18} className="text-clari-gold" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 border border-dashed border-clari-darkAccent rounded-md flex items-center justify-center">
                  <p className="text-clari-muted">Pie chart visualization will appear here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-clari-darkCard border-clari-darkAccent">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-md">Response Trends</CardTitle>
                  <LineChart size={18} className="text-clari-gold" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 border border-dashed border-clari-darkAccent rounded-md flex items-center justify-center">
                  <p className="text-clari-muted">Line chart visualization will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="surveys" className="mt-4">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Surveys</CardTitle>
                <CardDescription>Manage surveys for {business.name}</CardDescription>
              </div>
              <Button asChild>
                <Link to={`/survey/create/${business.id}`} className="gap-2">
                  <Plus size={16} />
                  Create Survey
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {business.surveyCount && business.surveyCount > 0 ? (
                <div className="space-y-4">
                  {[...Array(business.surveyCount)].map((_, index) => (
                    <Card key={index} className="bg-clari-darkBg border-clari-darkAccent">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <FileText size={18} className="text-clari-gold" />
                            <div>
                              <div className="font-medium">Customer Satisfaction Survey {index + 1}</div>
                              <div className="text-xs text-clari-muted">Created on 2023-06-{10 + index}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/survey/${business.id}-${index + 1}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-clari-muted">
                  No surveys created yet. Create your first survey for this business.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-4">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Business Analytics</CardTitle>
              <CardDescription>Analytics and insights for {business.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-clari-darkBg border-clari-darkAccent">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Satisfaction Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 border border-dashed border-clari-darkAccent rounded-md flex items-center justify-center">
                      <p className="text-clari-muted">Bar chart visualization will appear here</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-clari-darkBg border-clari-darkAccent">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Demographic Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 border border-dashed border-clari-darkAccent rounded-md flex items-center justify-center">
                      <p className="text-clari-muted">Demographic pie chart will appear here</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-clari-darkBg border-clari-darkAccent lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">AI Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-clari-darkCard rounded-md border border-clari-darkAccent">
                      <h3 className="font-medium mb-2 text-clari-gold">Key Findings</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>85% of respondents rated the product ease-of-use as "excellent" or "very good"</li>
                        <li>Customer service satisfaction dropped 12% compared to last quarter</li>
                        <li>Price sensitivity is highest among 25-34 age demographic</li>
                        <li>Feature requests focused primarily on mobile integration capabilities</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default BusinessDetail;
