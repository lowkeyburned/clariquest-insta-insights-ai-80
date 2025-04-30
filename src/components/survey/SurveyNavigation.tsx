
import { Button } from "@/components/ui/button";

interface SurveyNavigationProps {
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToggleUI: () => void;
  isMinimalUI: boolean;
}

const SurveyNavigation = ({ 
  isFirstQuestion, 
  isLastQuestion, 
  onPrevious, 
  onNext, 
  onToggleUI,
  isMinimalUI
}: SurveyNavigationProps) => {
  return (
    <div className="flex justify-between mt-8">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstQuestion}
      >
        Previous
      </Button>
      <Button 
        onClick={onToggleUI}
        variant="outline"
      >
        {isMinimalUI ? "Show full view" : "Questions only"}
      </Button>
      <Button onClick={onNext}>
        {isLastQuestion ? "Submit" : "Next"}
      </Button>
    </div>
  );
};

export default SurveyNavigation;
