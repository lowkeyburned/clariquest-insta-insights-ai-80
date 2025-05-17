
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit, FileText, Settings, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BusinessWithSurveyCount } from "@/components/business/BusinessForm";
import { Textarea } from "@/components/ui/textarea";

interface InsightGeneratorProps {
  business: BusinessWithSurveyCount;
}

const InsightGenerator = ({ business }: InsightGeneratorProps) => {
  const [query, setQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [insightText, setInsightText] = useState("");
  const [showSurveyButton, setShowSurveyButton] = useState(false);

  const handleGenerateInsight = () => {
    if (!query.trim()) {
      toast.error("Please enter a query first");
      return;
    }

    setIsGenerating(true);
    
    // Simulate generating insights (in a real app, this would be an API call)
    setTimeout(() => {
      // Generate a mock response based on the query
      let response = "";
      
      if (query.toLowerCase().includes("survey") || 
          query.toLowerCase().includes("question") || 
          Math.random() > 0.5) {
        // Generate a response with survey mentions
        response = `Based on your analysis of customer feedback for ${business.name}, I recommend creating a survey to gather more detailed insights. 

Here are some suggested questions:
1. How satisfied are you with our recent product updates?
2. What features would you like to see improved?
3. How likely are you to recommend our services to others?

This survey will help you understand customer sentiment and identify areas for improvement.`;
        setShowSurveyButton(true);
      } else {
        // Generate a response without survey mentions
        response = `Analysis of social media engagement for ${business.name} shows a 23% increase in user interaction over the last month. Key trends include:

- Higher engagement on posts about sustainability
- Increased comments on product tutorials
- Growing interest from the 25-34 demographic

Recommendation: Focus content strategy on educational material and sustainability initiatives to capitalize on current audience interests.`;
        setShowSurveyButton(false);
      }
      
      setInsightText(response);
      toast.success("Insight generated successfully");
      setIsGenerating(false);
    }, 1500);
  };

  const createSurveyForBusiness = (content: string, businessId: string) => {
    toast.success(`Creating survey for business ID: ${businessId}`);
    // In a real app, this would navigate to the survey creation page
    // or call an API to create a survey
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <FileText className="absolute left-3 top-2.5 h-5 w-5 text-clari-muted" />
          <Input 
            placeholder="Enter your query or topic (e.g., 'Analyze customer feedback')" 
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
          <Button 
            className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90"
            disabled={isGenerating}
            onClick={handleGenerateInsight}
          >
            <BrainCircuit size={16} />
            {isGenerating ? "Generating..." : "Generate Insight"}
          </Button>
          <Button variant="outline" className="gap-2">
            <Settings size={16} />
            Advanced Options
          </Button>
        </div>
      </div>
      
      {insightText && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            {showSurveyButton && (
              <span className="bg-clari-gold/20 text-clari-gold text-xs font-medium px-2 py-1 rounded">
                #Survey
              </span>
            )}
            {!showSurveyButton && (
              <span className="bg-blue-500/20 text-blue-400 text-xs font-medium px-2 py-1 rounded">
                #Insight
              </span>
            )}
            <h3 className="text-lg font-medium">AI Response</h3>
          </div>
          
          <Card className="border-clari-darkAccent">
            <CardContent className="pt-6">
              <div className="whitespace-pre-wrap text-sm">
                {insightText}
              </div>
              
              {showSurveyButton && (
                <div className="mt-6 animate-fade-in">
                  <Button 
                    className="bg-clari-gold text-black hover:bg-clari-gold/90 gap-2"
                    onClick={() => createSurveyForBusiness(insightText, business.id || '')}
                  >
                    Create Survey
                    <ArrowRight size={16} />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InsightGenerator;
