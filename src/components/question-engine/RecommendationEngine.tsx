
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Image as ImageIcon } from "lucide-react";

const RecommendationEngine = () => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const generateQuestions = async () => {
    if (!imageUrl && !details) return;
    
    setIsLoading(true);
    // Mock AI response for now - this would be replaced with actual AI integration
    const mockSuggestions = [
      "What specific features of this content resonate most with your target audience?",
      "How does this influence customer purchasing decisions?",
      "What improvements would make this more appealing to your demographic?",
      "How does this compare to similar items in the market?"
    ];
    
    setTimeout(() => {
      setSuggestions(mockSuggestions);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Card className="bg-clari-darkCard border-clari-darkAccent">
      <CardHeader>
        <CardTitle>Question Recommendation Engine</CardTitle>
        <CardDescription>Provide an image and details to get AI-generated question suggestions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">Image Reference (Optional)</label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="border-clari-darkAccent bg-clari-darkBg"
              />
            </div>
            {imageUrl && (
              <div className="relative aspect-video w-full mt-4 overflow-hidden rounded-lg border border-clari-darkAccent">
                <img
                  src={imageUrl}
                  alt="Reference"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Content Details (Optional)</label>
            <Textarea
              placeholder="Enter your content details here..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[150px] border-clari-darkAccent bg-clari-darkBg"
            />
          </div>

          <Button
            onClick={generateQuestions}
            disabled={(!details && !imageUrl) || isLoading}
            className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90"
          >
            <Sparkles size={16} />
            Generate Questions
          </Button>
        </div>

        {isLoading && (
          <div className="text-center text-clari-muted">
            Analyzing content and generating questions...
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Suggested Questions:</h3>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="rounded-lg border border-clari-darkAccent bg-clari-darkBg p-3"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationEngine;
