import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export interface SurveyQuestionProps {
  question: {
    id: number | string;
    type: "multiple_choice" | "open_ended" | "slider" | "likert" | "single_choice";
    text: string;
    options?: string[];
    min?: number;
    max?: number;
  };
  value?: string | number | string[];
  response?: any; // Added for backward compatibility
  onChange?: (value: string | number | string[]) => void;
  onAnswerChange?: (questionId: string, value: any) => void; // Added for backward compatibility
  preview?: boolean;
}

const SurveyQuestion = ({ question, value, response, onChange, onAnswerChange, preview = false }: SurveyQuestionProps) => {
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

  // Enhanced option extraction that handles both lettered and numbered patterns
  const extractOptionsFromText = (): string[] | null => {
    // Only try to extract for choice-based questions
    if (!["multiple_choice", "single_choice", "likert"].includes(question.type)) return null;
    
    // Look for patterns like:
    // - a) Option1 - b) Option2
    // - 1) Option1 2) Option2
    // - a. Option1 b. Option2
    // - 1. Option1 2. Option2
    const optionPatterns = [
      /(?:^|\s*[-–]?\s*)([a-z][\)\.])\s*([^a-z\d\)\.\n]+?)(?=\s+[a-z][\)\.]|\s*$)/gi,
      /(?:^|\s*[-–]?\s*)(\d+[\)\.])\s*([^a-z\d\)\.\n]+?)(?=\s+\d+[\)\.]|\s*$)/gi
    ];
    
    for (const pattern of optionPatterns) {
      const matches = [...(question.text.matchAll(pattern) || [])];
      if (matches && matches.length > 1) { // Need at least 2 options
        return matches.map(match => `${match[1]} ${match[2].trim()}`);
      }
    }
    
    return null;
  };

  // Clean question text by removing asterisks and extracted options
  const cleanQuestionText = (): string => {
    let cleanText = question.text;
    
    // Remove asterisks
    cleanText = cleanText.replace(/\*/g, '');
    
    if (!["multiple_choice", "single_choice", "likert"].includes(question.type)) return cleanText.trim();
    
    // If we successfully extracted options, remove them from the display question
    const extractedOptions = extractOptionsFromText();
    if (extractedOptions && extractedOptions.length > 0) {
      // Find the position of the first option marker to split the text
      const optionStartMatch = cleanText.match(/\s*[-–]?\s*[a-z\d][\)\.]/i);
      if (optionStartMatch && optionStartMatch.index !== undefined) {
        return cleanText.substring(0, optionStartMatch.index).trim();
      }
    }
    
    return cleanText.trim();
  };

  // Get options either from embedded text or from the provided options array
  const getDisplayOptions = (): string[] => {
    const extractedOptions = extractOptionsFromText();
    
    if (extractedOptions && extractedOptions.length > 0) {
      return extractedOptions;
    }
    
    // If we have explicitly provided options, use them
    if (question.options && question.options.length > 0) {
      return question.options;
    }
    
    // Default options for Likert scale if nothing else is available
    if (question.type === 'likert') {
      return [
        "a) Extremely important",
        "b) Very important",
        "c) Somewhat important", 
        "d) Not very important",
        "e) Not important"
      ];
    }
    
    return [];
  };

  // Check if an option requires a text input (contains "none", "other", "specify", etc.)
  const requiresTextInput = (option: string): boolean => {
    const lowercaseOption = option.toLowerCase();
    return lowercaseOption.includes('none') || 
           lowercaseOption.includes('other') || 
           lowercaseOption.includes('specify') ||
           lowercaseOption.includes('please explain') ||
           lowercaseOption.includes('please describe');
  };

  // Handle custom response change
  const handleCustomResponseChange = (optionKey: string, customValue: string) => {
    setCustomResponses(prev => ({
      ...prev,
      [optionKey]: customValue
    }));
    
    // Update the main value with custom response
    const finalValue = customValue.trim() ? `${optionKey}: ${customValue}` : optionKey;
    handleChange(finalValue);
  };

  // Only use the clean question text for display
  const displayText = cleanQuestionText();
  // Use extracted or provided options
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
      // Don't change the value immediately, wait for custom input
      return;
    }
    handleChange(option);
  };

  // Determine the correct component to render based on question type
  const renderQuestionByType = () => {
    switch(question.type) {
      case "single_choice":
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
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${question.id}-${index}`} />
                    <Label htmlFor={`option-${question.id}-${index}`} className="cursor-pointer">{option}</Label>
                  </div>
                  {requiresTextInput(option) && currentValue?.toString().startsWith(option) && (
                    <div className="ml-6">
                      <Input
                        placeholder="Please specify..."
                        value={customResponses[option] || ""}
                        onChange={(e) => handleCustomResponseChange(option, e.target.value)}
                        className="mt-2"
                        disabled={preview}
                      />
                    </div>
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>
        );
        
      case "multiple_choice": 
        return (
          <div className="space-y-3">
            {displayOptions.map((option, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`option-${question.id}-${index}`}
                    checked={isOptionSelected(option)}
                    onCheckedChange={(checked) => handleMultipleChoiceChange(option, !!checked)}
                    disabled={preview}
                  />
                  <Label htmlFor={`option-${question.id}-${index}`} className="cursor-pointer">{option}</Label>
                </div>
                {requiresTextInput(option) && isOptionSelected(option) && (
                  <div className="ml-6">
                    <Input
                      placeholder="Please specify..."
                      value={customResponses[option] || ""}
                      onChange={(e) => handleCustomResponseChange(option, e.target.value)}
                      className="mt-2"
                      disabled={preview}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        );
        
      case "likert":
        return (
          <div className="space-y-4">
            <RadioGroup 
              value={currentValue?.toString() || ""}
              onValueChange={handleChange}
              className="space-y-3"
              disabled={preview}
            >
              {displayOptions.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`likert-${question.id}-${index}`} />
                  <Label htmlFor={`likert-${question.id}-${index}`} className="cursor-pointer">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
        
      case "open_ended":
        return (
          <Textarea
            placeholder="Type your answer here..."
            value={currentValue?.toString() || ""}
            onChange={(e) => handleChange(e.target.value)}
            className="min-h-[120px]"
            disabled={preview}
          />
        );
        
      case "slider":
        return (
          <div className="space-y-4">
            <Slider
              min={question.min || 0}
              max={question.max || 10}
              step={1}
              value={[Number(currentValue || 0)]}
              onValueChange={(values) => handleChange(values[0])}
              disabled={preview}
            />
            <div className="text-center">
              Selected value: {currentValue || 0}
            </div>
          </div>
        );
        
      default:
        return <p className="text-red-500">Unsupported question type: {question.type}</p>;
    }
  };

  return (
    <div>
      <h3 className="text-xl font-medium mb-4">{displayText}</h3>
      {renderQuestionByType()}
    </div>
  );
};

export default SurveyQuestion;
