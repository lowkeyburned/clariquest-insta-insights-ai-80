
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

interface SurveyQuestionProps {
  question: {
    id: number;
    type: "multiple_choice" | "open_ended" | "slider";
    text: string;
    options?: string[];
    min?: number;
    max?: number;
  };
  value: string | number;
  onChange: (value: string | number) => void;
}

const SurveyQuestion = ({ question, value, onChange }: SurveyQuestionProps) => {
  return (
    <div>
      <h3 className="text-xl font-medium mb-4">{question.text}</h3>
      
      {question.type === "multiple_choice" && (
        <RadioGroup 
          value={value?.toString() || ""}
          onValueChange={onChange}
          className="space-y-3"
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
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[120px]"
        />
      )}

      {question.type === "slider" && (
        <div className="space-y-4">
          <Slider
            min={0}
            max={10}
            step={1}
            value={[Number(value || 0)]}
            onValueChange={(values) => onChange(values[0])}
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
