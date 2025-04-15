
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  BrainCircuit, 
  BarChart2, 
  Search, 
  Download, 
  Clock, 
  MessageSquare, 
  Send,
  Share2,
  Star,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Lightbulb,
  BookText
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const AIInsights = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = () => {
    if (!query.trim()) {
      toast({
        title: "Query cannot be empty",
        description: "Please enter a question or topic to generate insights.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Insights Generated",
        description: "AI insights have been generated based on your query.",
      });
    }, 2000);
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">AI Insights</h1>
          <p className="text-clari-muted mt-1">AI-powered analysis and insights from your data</p>
        </div>
        <Button className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90">
          <BrainCircuit size={16} />
          AI Assistant
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Generate AI Insights</CardTitle>
              <CardDescription>Ask questions or request analysis of your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Textarea 
                  placeholder="e.g., What are the key trends in user responses from New York compared to Los Angeles?" 
                  className="min-h-[100px] border-clari-darkAccent bg-clari-darkBg"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {[
                  "Identify key market trends", 
                  "Compare response rates by location", 
                  "Summarize customer sentiment", 
                  "Recommend targeting strategy"
                ].map((suggestion, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuery(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
              
              <Button 
                className="w-full gap-2 bg-clari-gold text-black hover:bg-clari-gold/90"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin mr-1">
                      <Clock size={16} />
                    </div>
                    Generating Insights...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Insights
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>AI Analysis Results</CardTitle>
              <CardDescription>Generated insights based on your query</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-clari-darkBg p-4 rounded-md border border-clari-darkAccent mb-4">
                <div className="flex items-start gap-2 mb-3">
                  <BrainCircuit size={20} className="text-clari-gold mt-1" />
                  <div>
                    <p className="font-medium">User Response Analysis: New York vs Los Angeles</p>
                    <p className="text-xs text-clari-muted mt-1">Generated on 2023-09-15 • Based on 1,245 responses</p>
                  </div>
                </div>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <h3 className="font-medium text-sm mb-2 text-clari-gold">Key Findings</h3>
                    <p className="text-sm">
                      Based on the survey data analysis, users from New York show a 28% higher response rate
                      to survey requests compared to Los Angeles users. New York respondents also provided
                      more detailed qualitative feedback, with an average of 42 words per open-ended question
                      compared to 27 words from Los Angeles respondents.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm mb-2 text-clari-gold">Demographic Insights</h3>
                    <p className="text-sm">
                      The New York respondent pool is predominantly in the 25-34 age range (48%), while
                      Los Angeles has a more evenly distributed age demographic. This suggests that marketing
                      campaigns in New York might benefit from targeting this specific age group.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm mb-2 text-clari-gold">Product Preferences</h3>
                    <p className="text-sm">
                      New York users showed stronger preference for convenience features (62%) over aesthetic
                      design (38%), whereas Los Angeles users had opposite preferences with 57% prioritizing
                      aesthetic design. This has significant implications for marketing messaging in these regions.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm mb-2 text-clari-gold">Recommended Action</h3>
                    <p className="text-sm">
                      Consider creating location-specific marketing campaigns that emphasize convenience
                      features for New York and design aesthetics for Los Angeles. Additionally, the engagement
                      strategy for New York should leverage the higher response rates by implementing more
                      frequent but targeted communications.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="gap-1">
                    <ThumbsUp size={14} />
                    Helpful
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ThumbsDown size={14} />
                    Not Helpful
                  </Button>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Copy size={14} />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download size={14} />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Share2 size={14} />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Ask AI Assistant</CardTitle>
              <CardDescription>Chat with your AI research assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-clari-darkBg p-3 rounded-md border border-clari-darkAccent h-[350px] overflow-y-auto mb-3">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="p-1.5 h-fit rounded-full bg-clari-darkAccent">
                      <MessageSquare size={14} className="text-clari-gold" />
                    </div>
                    <div className="bg-clari-darkAccent p-2 rounded-md text-sm max-w-[85%]">
                      Hello! I'm your AI research assistant. How can I help with your market research today?
                    </div>
                  </div>
                  
                  <div className="flex flex-row-reverse gap-2">
                    <div className="p-1.5 h-fit rounded-full bg-clari-gold">
                      <User size={14} className="text-black" />
                    </div>
                    <div className="bg-clari-darkAccent p-2 rounded-md text-sm max-w-[85%]">
                      Can you explain why our response rates are higher in Miami compared to other locations?
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="p-1.5 h-fit rounded-full bg-clari-darkAccent">
                      <BrainCircuit size={14} className="text-clari-gold" />
                    </div>
                    <div className="bg-clari-darkAccent p-2 rounded-md text-sm max-w-[85%]">
                      Based on your data, Miami shows a 27% response rate compared to the average of 21% across other locations. This could be attributed to several factors:
                      <br /><br />
                      1. Your messaging tone and content may resonate better with the Miami demographic<br />
                      2. The timing of messages (Miami users show higher engagement during evening hours)<br />
                      3. Higher concentration of your target demographic in that region<br />
                      <br />
                      Would you like me to analyze any specific aspect in more detail?
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Input 
                  placeholder="Ask a question..." 
                  className="border-clari-darkAccent bg-clari-darkBg"
                />
                <Button size="icon" className="bg-clari-gold text-black hover:bg-clari-gold/90">
                  <Send size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Saved Insights</CardTitle>
              <CardDescription>Your previously generated insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: "Customer Satisfaction Analysis", date: "2023-09-10", type: "Sentiment Analysis" },
                  { title: "Product Feature Preferences", date: "2023-09-08", type: "Preference Analysis" },
                  { title: "Regional Response Comparison", date: "2023-09-05", type: "Comparative Analysis" },
                  { title: "Demographic Insights Report", date: "2023-09-01", type: "Demographic Analysis" }
                ].map((insight, index) => (
                  <div key={index} className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-2">
                        {insight.type === "Sentiment Analysis" ? (
                          <Lightbulb size={16} className="text-clari-gold mt-0.5" />
                        ) : insight.type === "Preference Analysis" ? (
                          <Star size={16} className="text-clari-gold mt-0.5" />
                        ) : insight.type === "Comparative Analysis" ? (
                          <BarChart2 size={16} className="text-clari-gold mt-0.5" />
                        ) : (
                          <BookText size={16} className="text-clari-gold mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{insight.title}</p>
                          <p className="text-xs text-clari-muted mt-0.5">{insight.date}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 px-2">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="ghost" className="w-full text-clari-gold">View All Insights</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AIInsights;
