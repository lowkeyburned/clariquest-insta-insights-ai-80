
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { getSurveyShareURL } from "@/utils/supabaseHelpers";
import { Copy, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SurveyShareProps {
  surveyId: string;
}

const SurveyShare = ({ surveyId }: SurveyShareProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Get the share URL for this survey
  const { data: shareUrl, isLoading, error } = useQuery({
    queryKey: ['surveyShareUrl', surveyId],
    queryFn: () => getSurveyShareURL(surveyId),
    enabled: !!surveyId
  });

  const handleCopyLink = () => {
    if (!shareUrl) return;
    
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    
    toast({
      title: "Link copied!",
      description: "Survey link has been copied to clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading share link...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-destructive">Failed to generate share link</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Survey</CardTitle>
        <CardDescription>
          Share this link with others to collect responses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Input 
            value={shareUrl} 
            readOnly 
            className="flex-1"
          />
          <Button 
            size="icon"
            onClick={handleCopyLink}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </Button>
        </div>
        
        <div className="mt-4 text-sm text-center text-muted-foreground">
          <p>Anyone with this link can submit responses to your survey</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SurveyShare;
