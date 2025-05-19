
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface SurveyCompletedProps {
  onGoBack?: () => void;
}

const SurveyCompleted = ({ onGoBack }: SurveyCompletedProps) => {
  return (
    <div className="min-h-screen bg-clari-darkBg text-clari-text p-6">
      <Card className="max-w-3xl mx-auto bg-clari-darkCard border-clari-darkAccent">
        <CardContent className="p-6 text-center">
          {onGoBack && (
            <Button 
              variant="outline" 
              className="mb-4" 
              onClick={onGoBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
          <p>Your survey response has been submitted successfully.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyCompleted;
