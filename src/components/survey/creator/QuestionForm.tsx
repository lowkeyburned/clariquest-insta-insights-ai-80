
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { SurveyQuestion } from "@/utils/sampleSurveyData";

interface QuestionFormProps {
  addQuestion: (question: Omit<SurveyQuestion, "id">) => void;
}

const QuestionForm = ({ addQuestion }: QuestionFormProps) => {
  const { toast } = useToast();
  const [newQuestion, setNewQuestion] = useState<{
    text: string;
    type: "multiple_choice" | "open_ended" | "slider";
    options: string[];
    min?: number;
    max?: number;
  }>({
    text: "",
    type: "multiple_choice",
    options: [""]
  });

  const handleAddQuestion = () => {
    // Validate that the question is not empty
    if (!newQuestion.text.trim()) {
      toast({
        title: "Error",
        description: "Question text cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    // For multiple choice, ensure we have at least one non-empty option
    if (newQuestion.type === "multiple_choice" && 
        (!newQuestion.options.length || !newQuestion.options.some(opt => opt.trim()))) {
      toast({
        title: "Error",
        description: "Please add at least one option for multiple choice questions",
        variant: "destructive",
      });
      return;
    }
    
    addQuestion(newQuestion);
    
    // Reset the new question form
    setNewQuestion({
      text: "",
      type: "multiple_choice",
      options: [""]
    });
  };

  return (
    <div className="border border-clari-darkAccent rounded-md p-4">
      <h3 className="text-lg font-medium mb-4">Add Question</h3>
      <div className="space-y-4">
        <div>
          <Label>Question Text</Label>
          <Input 
            value={newQuestion.text}
            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
            placeholder="Enter question"
            className="bg-clari-darkBg border-clari-darkAccent"
          />
        </div>
        
        <div>
          <Label>Question Type</Label>
          <RadioGroup
            value={newQuestion.type}
            onValueChange={(value: "multiple_choice" | "open_ended" | "slider") => 
              setNewQuestion({ ...newQuestion, type: value })}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="multiple_choice" id="multiple_choice" />
              <Label htmlFor="multiple_choice">Multiple Choice</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="open_ended" id="open_ended" />
              <Label htmlFor="open_ended">Open Ended</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="slider" id="slider" />
              <Label htmlFor="slider">Slider</Label>
            </div>
          </RadioGroup>
        </div>

        {newQuestion.type === "multiple_choice" && (
          <div>
            <Label>Options</Label>
            {newQuestion.options.map((option, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...newQuestion.options];
                    newOptions[index] = e.target.value;
                    setNewQuestion({ ...newQuestion, options: newOptions });
                  }}
                  placeholder={`Option ${index + 1}`}
                  className="bg-clari-darkBg border-clari-darkAccent"
                />
                {index === newQuestion.options.length - 1 && (
                  <Button 
                    onClick={() => setNewQuestion({ 
                      ...newQuestion, 
                      options: [...newQuestion.options, ""] 
                    })}
                  >
                    Add Option
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {newQuestion.type === "slider" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Minimum Value</Label>
              <Input
                type="number"
                value={newQuestion.min || 0}
                onChange={(e) => setNewQuestion({ 
                  ...newQuestion, 
                  min: parseInt(e.target.value) 
                })}
                className="bg-clari-darkBg border-clari-darkAccent"
              />
            </div>
            <div>
              <Label>Maximum Value</Label>
              <Input
                type="number"
                value={newQuestion.max || 10}
                onChange={(e) => setNewQuestion({ 
                  ...newQuestion, 
                  max: parseInt(e.target.value) 
                })}
                className="bg-clari-darkBg border-clari-darkAccent"
              />
            </div>
          </div>
        )}

        <Button onClick={handleAddQuestion} className="w-full">
          Add Question
        </Button>
      </div>
    </div>
  );
};

export default QuestionForm;
