
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { SurveyQuestion } from "@/utils/sampleSurveyData";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface QuestionFormProps {
  addQuestion: (question: Omit<SurveyQuestion, "id">) => void;
}

const QuestionForm = ({ addQuestion }: QuestionFormProps) => {
  const { toast } = useToast();
  const [newQuestion, setNewQuestion] = useState<{
    text: string;
    type: "multiple_choice" | "open_ended" | "slider" | "likert" | "single_choice";
    options: string[];
    min?: number;
    max?: number;
  }>({
    text: "",
    type: "single_choice",
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
    
    // For choice-based questions, ensure we have at least one non-empty option
    if ((newQuestion.type === "multiple_choice" || newQuestion.type === "single_choice") && 
        (!newQuestion.options.length || !newQuestion.options.some(opt => opt.trim()))) {
      toast({
        title: "Error",
        description: `Please add at least one option for ${newQuestion.type === "multiple_choice" ? "multiple" : "single"} choice questions`,
        variant: "destructive",
      });
      return;
    }
    
    addQuestion(newQuestion);
    
    // Reset the new question form
    setNewQuestion({
      text: "",
      type: "single_choice",
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
          <div className="flex items-center gap-2 mb-2">
            <Label>Question Type</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle size={16} className="text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Single Choice: One selectable option<br />
                     Multiple Choice: Multiple selectable options<br />
                     Likert: Agreement scale<br />
                     Open Ended: Free text<br />
                     Slider: Range selection</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <RadioGroup
            value={newQuestion.type}
            onValueChange={(value: "multiple_choice" | "open_ended" | "slider" | "likert" | "single_choice") => 
              setNewQuestion({ ...newQuestion, type: value })}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="single_choice" id="single_choice" />
              <Label htmlFor="single_choice">Single Choice</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="multiple_choice" id="multiple_choice" />
              <Label htmlFor="multiple_choice">Multiple Choice</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="likert" id="likert" />
              <Label htmlFor="likert">Likert Scale</Label>
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

        {(newQuestion.type === "multiple_choice" || newQuestion.type === "single_choice") && (
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

        {newQuestion.type === "likert" && (
          <div className="space-y-2">
            <Label>Likert Scale Options</Label>
            <div className="text-sm text-muted-foreground mb-2">
              Standard 5-point scale: Strongly Disagree to Strongly Agree
            </div>
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

        <Separator className="my-4" />

        <Button onClick={handleAddQuestion} className="w-full">
          Add Question
        </Button>
      </div>
    </div>
  );
};

export default QuestionForm;
