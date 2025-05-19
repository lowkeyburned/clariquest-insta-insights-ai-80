
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

  // Check if the question text contains embedded options like "a) Option 1 - b) Option 2"
  const extractOptionsFromText = (): string[] | null => {
    // Only try to extract if we're in multiple_choice mode
    if (question.type !== "multiple_choice") return null;
    
    // Look for patterns like "- a) Option1 - b) Option2" or "a) Option1 b) Option2"
    const optionPattern = /(?:^|\s*[-–]?\s*)([a-f]\))\s*([^a-f\)]+?)(?=\s+[a-f]\)|$)/gi;
    const matches = [...question.text.matchAll(optionPattern)];
    
    if (matches && matches.length > 0) {
      return matches.map(match => match[2].trim());
    }
    
    return null;
  };

  // Get options either from embedded text or from the provided options array
  const getDisplayOptions = (): string[] => {
    const extractedOptions = extractOptionsFromText();
    
    if (extractedOptions && extractedOptions.length > 0) {
      return extractedOptions;
    }
    
    return question.options || [];
  };

  // Clean the question text by removing the embedded options if they exist
  const cleanQuestionText = (): string => {
    if (question.type !== "multiple_choice") return question.text;
    
    // If we successfully extracted options, remove them from the display question
    const extractedOptions = extractOptionsFromText();
    if (extractedOptions && extractedOptions.length > 0) {
      // Find the position of the first option marker to split the text
      const optionStartMatch = question.text.match(/\s*[-–]?\s*[a-f]\)/i);
      if (optionStartMatch && optionStartMatch.index) {
        return question.text.substring(0, optionStartMatch.index).trim();
      }
    }
    
    return question.text;
  };

  // Only use the clean question text for display
  const displayText = cleanQuestionText();
  // Use extracted or provided options
  const displayOptions = getDisplayOptions();

  return (
    <div>
      <h3 className="text-xl font-medium mb-4">{displayText}</h3>
      
      {question.type === "multiple_choice" && (
        <RadioGroup 
          value={value?.toString() || ""}
          onValueChange={handleChange}
          className="space-y-3"
          disabled={preview}
        >
          {displayOptions.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${question.id}-${index}`} />
              <Label htmlFor={`option-${question.id}-${index}`}>{option}</Label>
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
