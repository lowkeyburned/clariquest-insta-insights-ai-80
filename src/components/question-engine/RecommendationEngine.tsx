
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Image as ImageIcon } from "lucide-react";

const RecommendationEngine = () => {
  const [imageUrl, setImageUrl] = useState<string>("");
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
    setIsLoading(true);
    // Mock AI response for now - this would be replaced with actual AI integration
    const mockSuggestions = [
      "What specific features of this product resonate most with your target audience?",
      "How does this visual element influence customer purchasing decisions?",
      "What improvements would make this more appealing to your demographic?",
      "How does this compare to similar products in the market?"
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
        <CardDescription>Upload an image reference to get AI-generated question suggestions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="border-clari-darkAccent bg-clari-darkBg"
              />
            </div>
            <Button
              onClick={generateQuestions}
              disabled={!imageUrl || isLoading}
              className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90"
            >
              <Sparkles size={16} />
              Generate Questions
            </Button>
          </div>

          {imageUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-clari-darkAccent">
              <img
                src={imageUrl}
                alt="Reference"
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {isLoading && (
            <div className="text-center text-clari-muted">
              Analyzing image and generating questions...
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
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationEngine;
