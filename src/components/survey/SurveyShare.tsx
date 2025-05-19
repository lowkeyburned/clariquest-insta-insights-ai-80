import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Survey } from "@/utils/sampleSurveyData";

interface SurveyShareProps {
  survey: Survey;
}

const SurveyShare: React.FC<SurveyShareProps> = ({ survey }) => {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const surveyLink = `${window.location.origin}/survey/${survey.slug || survey.id}`;

  const handleCopyClick = () => {
    navigator.clipboard.writeText(surveyLink)
      .then(() => {
        setIsCopied(true);
        toast({
          title: "Copied!",
          description: "Survey link copied to clipboard.",
        });
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast({
          title: "Error",
          description: "Failed to copy survey link.",
          variant: "destructive",
        });
      });
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: survey.title,
        text: survey.description,
        url: surveyLink,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
    } else {
      toast({
        title: "Share Error",
        description: "Web Share API not supported.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <Button variant="outline" onClick={handleCopyClick} disabled={isCopied}>
        {isCopied ? <Copy className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
        {isCopied ? "Copied!" : "Copy Link"}
      </Button>
      <Button onClick={handleShareClick}>
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </Button>
    </div>
  );
};

export default SurveyShare;
