
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit, FileText, Settings, ArrowRight, Eye, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BusinessWithSurveyCount } from "@/components/business/BusinessForm";
import { Textarea } from "@/components/ui/textarea";
import SurveyPreview from "@/components/survey/SurveyPreview";
import { extractQuestionsFromContent, extractSurveyTitle, createSurveyFromChat } from "@/components/ai-insights/api/services/webhookService";
import { useNavigate } from "react-router-dom";

interface InsightGeneratorProps {
  business: BusinessWithSurveyCount;
}

const InsightGenerator = ({ business }: InsightGeneratorProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [insightText, setInsightText] = useState("");
  const [showSurveyButton, setShowSurveyButton] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [surveyPreview, setSurveyPreview] = useState<{
    title: string;
    description: string;
    questions: Array<{
      text: string;
      type: string;
      options?: string[];
    }>;
  } | null>(null);

  const handleGenerateInsight = () => {
    if (!query.trim()) {
      toast.error("Please enter a query first");
      return;
    }

    setIsGenerating(true);
    setShowPreview(false);
    setSurveyPreview(null);
    
    // Simulate generating insights (in a real app, this would be an API call)
    setTimeout(() => {
      // Generate a mock response based on the query
      let response = "";
      
      if (query.toLowerCase().includes('survey') || 
          query.toLowerCase().includes('question') || 
          Math.random() > 0.5) {
        // Generate a response with survey mentions
        response = `Based on your analysis of customer feedback for ${business.name}, I recommend creating a survey to gather more detailed insights. 

Here are some suggested questions:
1. How satisfied are you with our boba tea flavors?
2. What toppings do you prefer in your boba drink?
3. How important is the sweetness level to your enjoyment?
4. How often do you visit our boba shop?

This survey will help you understand customer preferences and identify areas for improvement.`;
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

  const handlePreviewSurvey = () => {
    // Extract survey title and questions from the insight text
    const title = extractSurveyTitle(insightText) || `${business.name} Feedback Survey`;
    const questions = extractQuestionsFromContent(insightText);
    
    // Format questions for preview with proper question types
    const formattedQuestions = questions.map(q => {
      // Determine if this looks like a Likert scale question
      const isLikertQuestion = 
        q.toLowerCase().includes('satisfied') || 
        q.toLowerCase().includes('agree') || 
        q.toLowerCase().includes('rate') || 
        q.toLowerCase().includes('how likely') ||
        q.toLowerCase().includes('how would you') ||
        q.toLowerCase().includes('important');
      
      return {
        text: q,
        type: isLikertQuestion ? "likert" : "multiple_choice",
        options: isLikertQuestion 
          ? ["a) Extremely important", "b) Very important", "c) Somewhat important", "d) Not very important", "e) Not important"]
          : ["Yes", "No", "Maybe", "Other"]
      };
    });
    
    setSurveyPreview({
      title,
      description: "Survey generated from AI insights",
      questions: formattedQuestions
    });
    
    setShowPreview(true);
  };

  const handleCreateSurvey = async () => {
    if (!business.id) {
      toast.error("Missing business ID");
      return;
    }

    setIsSaving(true);
    try {
      // Combine insight text and business ID for the createSurveyFromChat function
      const combinedData = `${insightText}:::${business.id}`;
      
      const surveyId = await createSurveyFromChat(combinedData);
      
      toast.success("Survey created successfully!");
      
      // Navigate to the survey results page
      navigate(`/survey/results/${surveyId}`);
    } catch (error) {
      console.error("Error creating survey:", error);
      toast.error(`Failed to create survey: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
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
                <div className="mt-6 flex gap-2 animate-fade-in">
                  <Button 
                    className="bg-clari-gold/20 text-clari-gold hover:bg-clari-gold/30 gap-2"
                    onClick={handlePreviewSurvey}
                  >
                    <Eye size={16} />
                    Preview Survey
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {showPreview && surveyPreview && (
            <div className="mt-4">
              <SurveyPreview 
                survey={surveyPreview} 
                onCreateSurvey={handleCreateSurvey}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InsightGenerator;
