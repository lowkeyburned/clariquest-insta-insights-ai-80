
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

export interface SurveyQuestionProps {
  question: {
    id: number;
    type: "multiple_choice" | "open_ended" | "slider";
    text: string;
    options?: string[];
    min?: number;
    max?: number;
  };
  value?: string | number;
  onChange?: (value: string | number) => void;
  preview?: boolean;
}

const SurveyQuestion = ({ question, value, onChange, preview = false }: SurveyQuestionProps) => {
  // Create a default onChange handler that does nothing if preview mode is enabled
  const handleChange = (newValue: string | number) => {
    if (!preview && onChange) {
      onChange(newValue);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-medium mb-4">{question.text}</h3>
      
      {question.type === "multiple_choice" && (
        <RadioGroup 
          value={value?.toString() || ""}
          onValueChange={handleChange}
          className="space-y-3"
          disabled={preview}
        >
          {question.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      )}
      
      {question.type === "open_ended" && (
        <Textarea
          placeholder="Type your answer here..."
          value={value?.toString() || ""}
          onChange={(e) => handleChange(e.target.value)}
          className="min-h-[120px]"
          disabled={preview}
        />
      )}

      {question.type === "slider" && (
        <div className="space-y-4">
          <Slider
            min={question.min || 0}
            max={question.max || 10}
            step={1}
            value={[Number(value || 0)]}
            onValueChange={(values) => handleChange(values[0])}
            disabled={preview}
          />
          <div className="text-center">
            Selected value: {value || 0}
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyQuestion;
