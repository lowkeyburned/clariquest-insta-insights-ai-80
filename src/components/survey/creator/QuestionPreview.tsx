
import { Button } from "@/components/ui/button";
import { SurveyQuestion } from "@/utils/sampleSurveyData";

interface QuestionPreviewProps {
  questions: SurveyQuestion[];
  onRemoveQuestion: (index: number) => void;
}

const QuestionPreview = ({ questions, onRemoveQuestion }: QuestionPreviewProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Preview Questions</h3>
      {questions.map((question, index) => (
        <div key={index} className="p-4 border border-clari-darkAccent rounded-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{question.text}</p>
              <p className="text-sm text-clari-muted">Type: {question.type}</p>
              
              {question.type === "multiple_choice" && question.options && (
                <div className="ml-4 mt-2">
                  <p className="text-xs text-clari-muted">Options:</p>
                  <ul className="list-disc list-inside text-sm">
                    {question.options.map((option, idx) => (
                      <li key={idx}>{option}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {question.type === "slider" && (
                <p className="text-xs text-clari-muted mt-1">
                  Range: {question.min || 0} to {question.max || 10}
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onRemoveQuestion(index)}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
      
      {questions.length === 0 && (
        <div className="p-6 text-center text-clari-muted border border-dashed border-clari-darkAccent rounded-md">
          No questions added yet
        </div>
      )}
    </div>
  );
};

export default QuestionPreview;
