
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, BarChart3 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

interface SurveyCompletedProps {
  onGoBack?: () => void;
}

const SurveyCompleted = ({ onGoBack }: SurveyCompletedProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleViewResults = () => {
    if (id) {
      navigate(`/survey/results/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-clari-darkBg text-clari-text p-6">
      <Card className="max-w-3xl mx-auto bg-clari-darkCard border-clari-darkAccent">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="mx-auto h-16 w-16 text-clari-gold mb-4" />
            <h2 className="text-3xl font-bold mb-4 text-clari-text">Thank You!</h2>
            <p className="text-clari-muted text-lg">Your survey response has been submitted successfully.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {onGoBack && (
              <Button 
                variant="outline" 
                className="border-clari-gold text-clari-gold hover:bg-clari-gold hover:text-black" 
                onClick={onGoBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            
            {id && (
              <Button 
                onClick={handleViewResults}
                className="bg-clari-gold text-black hover:bg-clari-gold/90"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyCompleted;
