
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, Filter, BarChart2, PieChart, LineChart, Download, Share2 } from "lucide-react";

const SurveyAnalysis = () => {
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Survey Analysis</h1>
          <p className="text-clari-muted mt-1">Analyze survey responses and extract insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter size={16} />
            Filter
          </Button>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export
          </Button>
          <Button className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90">
            <Share2 size={16} />
            Share Results
          </Button>
        </div>
      </div>

      <Card className="mb-6 bg-clari-darkCard border-clari-darkAccent">
        <CardHeader>
          <CardTitle>Survey Selection</CardTitle>
          <CardDescription>Choose a survey to analyze</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="survey-select">Select Survey</Label>
              <div className="relative">
                <select 
                  id="survey-select"
                  className="w-full rounded-md border border-clari-darkAccent bg-clari-darkBg px-3 py-2 text-sm appearance-none"
                >
                  <option value="customer-satisfaction-2023">Customer Satisfaction Survey 2023</option>
                  <option value="product-feedback-q1">Product Feedback Q1</option>
                  <option value="market-trends-analysis">Market Trends Analysis</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
              </div>
            </div>
            <div>
              <Label htmlFor="date-range">Date Range</Label>
              <Input 
                id="date-range" 
                type="text" 
                placeholder="Last 30 days" 
                className="w-full border-clari-darkAccent bg-clari-darkBg"
              />
            </div>
            <div>
              <Label htmlFor="response-count">Responses</Label>
              <Input 
                id="response-count" 
                type="text" 
                value="348 responses" 
                readOnly 
                className="w-full border-clari-darkAccent bg-clari-darkBg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="bg-clari-darkCard">
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-clari-darkCard border-clari-darkAccent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-md">Response Distribution</CardTitle>
                  <CardDescription>By demographic segments</CardDescription>
                </div>
                <PieChart size={18} className="text-clari-gold" />
              </CardHeader>
              <CardContent>
                <div className="h-64 border border-dashed border-clari-darkAccent rounded-md flex items-center justify-center">
                  <p className="text-clari-muted">Pie chart visualization will appear here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-clari-darkCard border-clari-darkAccent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-md">Satisfaction Scores</CardTitle>
                  <CardDescription>Average ratings by category</CardDescription>
                </div>
                <BarChart2 size={18} className="text-clari-gold" />
              </CardHeader>
              <CardContent>
                <div className="h-64 border border-dashed border-clari-darkAccent rounded-md flex items-center justify-center">
                  <p className="text-clari-muted">Bar chart visualization will appear here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-clari-darkCard border-clari-darkAccent lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-md">Response Trends</CardTitle>
                  <CardDescription>Monthly trends of key metrics</CardDescription>
                </div>
                <LineChart size={18} className="text-clari-gold" />
              </CardHeader>
              <CardContent>
                <div className="h-72 border border-dashed border-clari-darkAccent rounded-md flex items-center justify-center">
                  <p className="text-clari-muted">Line chart visualization will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="responses" className="mt-4">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Survey Responses</CardTitle>
              <CardDescription>Raw response data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border border-clari-darkAccent rounded-md overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-clari-darkAccent">
                      <th className="px-4 py-2 text-left text-sm">Respondent</th>
                      <th className="px-4 py-2 text-left text-sm">Date</th>
                      <th className="px-4 py-2 text-left text-sm">Location</th>
                      <th className="px-4 py-2 text-left text-sm">Satisfaction</th>
                      <th className="px-4 py-2 text-left text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((item) => (
                      <tr key={item} className="border-t border-clari-darkAccent">
                        <td className="px-4 py-3 text-sm">Respondent #{item + 100}</td>
                        <td className="px-4 py-3 text-sm">2023-09-{10 + item}</td>
                        <td className="px-4 py-3 text-sm">New York, NY</td>
                        <td className="px-4 py-3 text-sm">{Math.floor(Math.random() * 5) + 1}/5</td>
                        <td className="px-4 py-3 text-sm">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights" className="mt-4">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>Automated analysis of survey responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <h3 className="font-medium mb-2 text-clari-gold">Key Findings</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>85% of respondents rated the product ease-of-use as "excellent" or "very good"</li>
                    <li>Customer service satisfaction dropped 12% compared to last quarter</li>
                    <li>Price sensitivity is highest among 25-34 age demographic</li>
                    <li>Feature requests focused primarily on mobile integration capabilities</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <h3 className="font-medium mb-2 text-clari-gold">Market Trends</h3>
                  <p className="text-sm">
                    Analysis shows increasing demand for integrated solutions across all demographics.
                    Competitors are focusing on similar features but lack the pricing advantage in the
                    18-24 segment. Recommend increasing marketing efforts for this demographic.
                  </p>
                </div>
                
                <div className="p-4 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <h3 className="font-medium mb-2 text-clari-gold">Improvement Opportunities</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Enhance customer service response times based on frequent complaints</li>
                    <li>Consider price adjustment for premium tier to match competitor offerings</li>
                    <li>Implement requested mobile features to address user feedback</li>
                    <li>Develop more educational content for complex features</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default SurveyAnalysis;
