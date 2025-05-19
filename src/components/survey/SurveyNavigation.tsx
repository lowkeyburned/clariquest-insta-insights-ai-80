
import { Button } from "@/components/ui/button";

interface SurveyNavigationProps {
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToggleUI?: () => void;
  isMinimalUI?: boolean;
  // For backward compatibility
  current?: number;
  total?: number;
  onSubmit?: () => Promise<void> | void;
}

const SurveyNavigation = ({ 
  isFirstQuestion, 
  isLastQuestion, 
  onPrevious, 
  onNext, 
  onToggleUI,
  isMinimalUI,
  current,
  total,
  onSubmit
}: SurveyNavigationProps) => {
  // Handle backward compatibility
  const handleNext = () => {
    if (isLastQuestion && onSubmit) {
      onSubmit();
    } else {
      onNext();
    }
  };

  return (
    <div className="flex justify-between mt-8">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstQuestion}
      >
        Previous
      </Button>
      {onToggleUI && (
        <Button 
          onClick={onToggleUI}
          variant="outline"
        >
          {isMinimalUI ? "Show full view" : "Questions only"}
        </Button>
      )}
      <Button onClick={handleNext}>
        {isLastQuestion ? "Submit" : "Next"}
      </Button>
    </div>
  );
};

export default SurveyNavigation;
