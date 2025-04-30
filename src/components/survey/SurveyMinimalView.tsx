
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SurveyQuestion from "./SurveyQuestion";
import SurveyNavigation from "./SurveyNavigation";

interface SurveyMinimalViewProps {
  surveyQuestion: any;
  currentQuestion: number;
  answers: Record<number, string | number>;
  onAnswerChange: (value: string | number) => void;
  onGoBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleUI: () => void;
  isLastQuestion: boolean;
}

const SurveyMinimalView = ({
  surveyQuestion,
  currentQuestion,
  answers,
  onAnswerChange,
  onGoBack,
  onPrevious,
  onNext,
  onToggleUI,
  isLastQuestion
}: SurveyMinimalViewProps) => {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="outline" 
          className="mb-4" 
          onClick={onGoBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="bg-white shadow-sm p-8 rounded-lg">
          <SurveyQuestion 
            question={surveyQuestion} 
            value={answers[currentQuestion] || ""} 
            onChange={onAnswerChange}
          />
          
          <SurveyNavigation 
            isFirstQuestion={currentQuestion === 0}
            isLastQuestion={isLastQuestion}
            onPrevious={onPrevious}
            onNext={onNext}
            onToggleUI={onToggleUI}
            isMinimalUI={true}
          />
        </div>
      </div>
    </div>
  );
};

export default SurveyMinimalView;
