import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BrainCircuit, 
  Lightbulb, 
  TrendingUp, 
  MessageSquare,
  User as UserIcon,
  FileText,
  Settings
} from "lucide-react";
import { useState } from "react";

const AIInsights = () => {
  const [query, setQuery] = useState("");

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">AI Insights</h1>
          <p className="text-clari-muted mt-1">Unlock deeper insights with AI-driven analysis</p>
        </div>
        <Button className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90">
          <Lightbulb size={16} />
          Generate New Insight
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Insight Generator</CardTitle>
              <CardDescription>Generate custom insights using AI analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-5 w-5 text-clari-muted" />
                <Input 
                  placeholder="Enter your query or topic" 
                  className="pl-10 border-clari-darkAccent bg-clari-darkBg"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data-source">Data Source</Label>
                  <Input 
                    id="data-source" 
                    placeholder="Surveys, Social Media, etc." 
                    className="border-clari-darkAccent bg-clari-darkBg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="analysis-type">Analysis Type</Label>
                  <Input 
                    id="analysis-type" 
                    placeholder="Sentiment, Trend, etc." 
                    className="border-clari-darkAccent bg-clari-darkBg"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Button className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90">
                  <BrainCircuit size={16} />
                  Generate Insight
                </Button>
                <Button variant="outline" className="gap-2">
                  <Settings size={16} />
                  Advanced Options
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Recent Insights</CardTitle>
              <CardDescription>Explore recently generated AI insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <h3 className="font-medium text-sm text-clari-gold mb-1">Survey Sentiment Analysis</h3>
                  <p className="text-xs">AI analysis reveals a 30% increase in positive sentiment towards new product features.</p>
                </div>
                
                <div className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <h3 className="font-medium text-sm text-clari-gold mb-1">Social Media Trend Detection</h3>
                  <p className="text-xs">AI detected a rising trend in user interest towards sustainable practices in the fashion industry.</p>
                </div>
                
                <div className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <h3 className="font-medium text-sm text-clari-gold mb-1">Customer Feedback Analysis</h3>
                  <p className="text-xs">AI identified key areas for improvement in customer service based on recent feedback data.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Trending Topics</CardTitle>
              <CardDescription>Discover what's trending in your data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { topic: "Sustainability", trend: "+15%", engagement: "High" },
                  { topic: "Remote Work", trend: "+12%", engagement: "Medium" },
                  { topic: "AI Integration", trend: "+18%", engagement: "High" },
                  { topic: "Digital Health", trend: "+9%", engagement: "Medium" },
                  { topic: "E-commerce Growth", trend: "+14%", engagement: "High" }
                ].map((item, index) => (
                  <div key={index} className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-1">
                          <TrendingUp size={14} className="text-clari-gold" />
                          <p className="font-medium text-sm">{item.topic}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs">{item.trend}</p>
                        <p className="text-xs text-clari-muted">Engagement: {item.engagement}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>User Engagement Analysis</CardTitle>
              <CardDescription>Analyze user engagement patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <h3 className="font-medium text-sm text-clari-gold mb-1">Active Users</h3>
                  <div className="flex items-center gap-2">
                    <UserIcon size={20} className="text-clari-muted" />
                    <p className="text-xs">1,245 active users</p>
                  </div>
                </div>
                
                <div className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <h3 className="font-medium text-sm text-clari-gold mb-1">Most Engaged Content</h3>
                  <div className="flex items-center gap-2">
                    <MessageSquare size={20} className="text-clari-muted" />
                    <p className="text-xs">Surveys related to product feedback</p>
                  </div>
                </div>
                
                <div className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <h3 className="font-medium text-sm text-clari-gold mb-1">Average Session Time</h3>
                  <div className="flex items-center gap-2">
                    <BrainCircuit size={20} className="text-clari-muted" />
                    <p className="text-xs">5 minutes 30 seconds</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AIInsights;
