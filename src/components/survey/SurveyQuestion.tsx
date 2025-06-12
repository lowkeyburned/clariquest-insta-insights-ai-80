
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { SurveyQuestion } from "@/utils/types/database";

export interface SurveyQuestionProps {
  question: SurveyQuestion;
  value?: string | number | string[];
  response?: any; // Added for backward compatibility
  onChange?: (value: string | number | string[]) => void;
  onAnswerChange?: (questionId: string, value: any) => void; // Added for backward compatibility
  preview?: boolean;
}

const SurveyQuestionComponent = ({ question, value, response, onChange, onAnswerChange, preview = false }: SurveyQuestionProps) => {
  const [customResponses, setCustomResponses] = useState<Record<string, string>>({});

  // Create a default onChange handler that does nothing if preview mode is enabled
  const handleChange = (newValue: string | number | string[]) => {
    if (!preview) {
      if (onChange) {
        onChange(newValue);
      } else if (onAnswerChange) {
        // For backward compatibility
        onAnswerChange(question.id.toString(), newValue);
      }
    }
  };

  // For backward compatibility, use response if value is not provided
  const currentValue = value !== undefined ? value : (response !== undefined ? response : undefined);

  // Get the question text and clean it properly
  const questionText = question.question_text || "";
  const questionType = question.question_type || "text";

  // Clean question text by removing markdown formatting and extra whitespace
  const cleanQuestionText = (): string => {
    let cleanText = questionText;
    // Remove asterisks and other markdown
    cleanText = cleanText.replace(/\*+/g, '');
    // Remove extra whitespace
    cleanText = cleanText.replace(/\s+/g, ' ');
    // Remove numbered prefixes if they exist (like "1. ")
    cleanText = cleanText.replace(/^\d+\.\s*/, '');
    return cleanText.trim();
  };

  // Check if this is a multi-select question
  const isMultiSelect = (): boolean => {
    const lowerText = questionText.toLowerCase();
    return lowerText.includes('select all that apply') || 
           lowerText.includes('(select all)') ||
           lowerText.includes('check all') ||
           questionType === 'multiple_select';
  };

  // Get options with better error handling
  const getDisplayOptions = (): string[] => {
    if (!question.options) {
      // Provide default options based on question type
      if (questionType === 'yes_no') {
        return ["Yes", "No"];
      }
      if (questionType === 'likert') {
        return [
          "Strongly Agree",
          "Agree", 
          "Neutral",
          "Disagree",
          "Strongly Disagree"
        ];
      }
      return [];
    }

    // Handle different option formats from database
    if (Array.isArray(question.options)) {
      return question.options.filter(opt => opt && typeof opt === 'string');
    }
    
    if (typeof question.options === 'object' && question.options.options) {
      const opts = question.options.options;
      return Array.isArray(opts) ? opts.filter(opt => opt && typeof opt === 'string') : [];
    }
    
    if (typeof question.options === 'object') {
      // Try to extract options from object values
      const optionValues = Object.values(question.options);
      if (optionValues.length > 0 && optionValues.every(val => typeof val === 'string')) {
        return optionValues as string[];
      }
    }
    
    return [];
  };

  // Check if an option requires a text input
  const requiresTextInput = (option: string): boolean => {
    const lowercaseOption = option.toLowerCase();
    return lowercaseOption.includes('other') || 
           lowercaseOption.includes('specify') ||
           lowercaseOption.includes('please explain') ||
           lowercaseOption.includes('custom');
  };

  // Handle custom response change
  const handleCustomResponseChange = (optionKey: string, customValue: string) => {
    setCustomResponses(prev => ({
      ...prev,
      [optionKey]: customValue
    }));
    
    const finalValue = customValue.trim() ? `${optionKey}: ${customValue}` : optionKey;
    
    if (isMultiSelect()) {
      const currentSelections = Array.isArray(currentValue) ? currentValue : [];
      const filteredSelections = currentSelections.filter(val => !val.toString().startsWith(optionKey));
      handleChange([...filteredSelections, finalValue]);
    } else {
      handleChange(finalValue);
    }
  };

  const displayText = cleanQuestionText();
  const displayOptions = getDisplayOptions();

  // Helper to check if an option is selected for multiple choice
  const isOptionSelected = (option: string): boolean => {
    if (Array.isArray(currentValue)) {
      return currentValue.some(val => val.toString().startsWith(option));
    }
    return false;
  };

  // Handle multiple choice selections
  const handleMultipleChoiceChange = (option: string, checked: boolean) => {
    if (Array.isArray(currentValue)) {
      const newValue = checked 
        ? [...currentValue.filter(val => !val.toString().startsWith(option)), option]
        : currentValue.filter(val => !val.toString().startsWith(option));
      handleChange(newValue);
    } else {
      handleChange(checked ? [option] : []);
    }
  };

  // Handle single choice with custom input
  const handleSingleChoiceChange = (option: string) => {
    if (requiresTextInput(option)) {
      return;
    }
    handleChange(option);
  };

  // Render question based on type
  const renderQuestionByType = () => {
    if (!displayText) {
      return <p className="text-red-400">Invalid question: missing question text</p>;
    }

    // Handle multi-select questions (checkboxes)
    if (isMultiSelect() && (questionType === "multiple_choice" || displayOptions.length > 0)) {
      if (displayOptions.length === 0) {
        return <p className="text-yellow-400">No options available for this multi-select question</p>;
      }
      return (
        <div className="space-y-3">
          {displayOptions.map((option, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id={`option-${question.id}-${index}`}
                  checked={isOptionSelected(option)}
                  onCheckedChange={(checked) => handleMultipleChoiceChange(option, !!checked)}
                  disabled={preview}
                  className="border-clari-gold data-[state=checked]:bg-clari-gold data-[state=checked]:text-black"
                />
                <Label 
                  htmlFor={`option-${question.id}-${index}`} 
                  className="cursor-pointer text-clari-text flex-1"
                >
                  {option}
                </Label>
              </div>
              {requiresTextInput(option) && isOptionSelected(option) && (
                <div className="ml-6">
                  <Input
                    placeholder="Please specify..."
                    value={customResponses[option] || ""}
                    onChange={(e) => handleCustomResponseChange(option, e.target.value)}
                    className="mt-2 bg-clari-darkAccent/50 border-clari-darkAccent text-clari-text focus:border-clari-gold"
                    disabled={preview}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    switch(questionType) {
      case "yes_no":
      case "single_choice":
      case "likert":
      case "multiple_choice":
        if (displayOptions.length === 0) {
          return <p className="text-yellow-400">No options available for this question</p>;
        }
        return (
          <div className="space-y-3">
            <RadioGroup 
              value={currentValue?.toString().split(':')[0] || ""}
              onValueChange={handleSingleChoiceChange}
              className="space-y-3"
              disabled={preview}
            >
              {displayOptions.map((option, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem 
                      value={option} 
                      id={`option-${question.id}-${index}`}
                      className="border-clari-gold text-clari-gold focus:ring-clari-gold"
                    />
                    <Label 
                      htmlFor={`option-${question.id}-${index}`} 
                      className="cursor-pointer text-clari-text flex-1"
                    >
                      {option}
                    </Label>
                  </div>
                  {requiresTextInput(option) && currentValue?.toString().startsWith(option) && (
                    <div className="ml-6">
                      <Input
                        placeholder="Please specify..."
                        value={customResponses[option] || ""}
                        onChange={(e) => handleCustomResponseChange(option, e.target.value)}
                        className="mt-2 bg-clari-darkAccent/50 border-clari-darkAccent text-clari-text focus:border-clari-gold"
                        disabled={preview}
                      />
                    </div>
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>
        );
        
      case "text":
      case "open_ended":
        return (
          <Textarea
            placeholder="Please share your thoughts here..."
            value={currentValue?.toString() || ""}
            onChange={(e) => handleChange(e.target.value)}
            className="min-h-[120px] bg-clari-darkAccent/50 border-clari-darkAccent text-clari-text focus:border-clari-gold resize-none"
            disabled={preview}
          />
        );
        
      case "slider":
        return (
          <div className="space-y-4">
            <Slider
              min={0}
              max={10}
              step={1}
              value={[Number(currentValue || 0)]}
              onValueChange={(values) => handleChange(values[0])}
              disabled={preview}
              className="[&_[role=slider]]:bg-clari-gold [&_[role=slider]]:border-clari-gold"
            />
            <div className="text-center text-clari-text">
              Selected value: <span className="font-medium text-clari-gold">{currentValue || 0}</span>
            </div>
          </div>
        );
        
      default:
        return <p className="text-red-400">Unsupported question type: {questionType}</p>;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-medium text-clari-text leading-relaxed">
        {displayText}
      </h3>
      <div className="mt-4">
        {renderQuestionByType()}
      </div>
    </div>
  );
};

export default SurveyQuestionComponent;
