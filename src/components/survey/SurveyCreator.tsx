
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { createSurvey } from "@/utils/supabaseHelpers";
import { SurveyQuestion } from "@/utils/sampleSurveyData";

const SurveyCreator = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
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
  const [isCreating, setIsCreating] = useState(false);
  
  // Business ID is needed for creating surveys in Supabase
  // For demo purposes, we'll use a default ID or from URL params
  const params = new URLSearchParams(window.location.search);
  const businessId = params.get('businessId') || "00000000-0000-0000-0000-000000000000";

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
    
    // Generate a temporary ID for the question
    const questionId = Date.now();
    setQuestions([...questions, { ...newQuestion, id: questionId }]);
    
    // Reset the new question form
    setNewQuestion({
      text: "",
      type: "multiple_choice",
      options: [""]
    });
  };

  const handleSaveSurvey = async () => {
    // Validate title and at least one question
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Survey title is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!questions.length) {
      toast({
        title: "Error",
        description: "Add at least one question to your survey",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Create survey in Supabase
      const surveyData = {
        title,
        description,
        businessId
      };
      
      const createdSurvey = await createSurvey(surveyData, questions);
      
      toast({
        title: "Survey Created",
        description: "Your survey has been created successfully!",
        duration: 5000,
      });
      
      // Navigate to the survey details page
      navigate(`/survey/results/${createdSurvey.id}`);
    } catch (error) {
      console.error("Error creating survey:", error);
      toast({
        title: "Error",
        description: `Failed to create survey: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRemoveQuestion = (indexToRemove: number) => {
    setQuestions(questions.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="min-h-screen bg-clari-darkBg text-clari-text p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardHeader>
            <CardTitle>Create New Survey</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Survey Title</Label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter survey title"
                className="bg-clari-darkBg border-clari-darkAccent"
              />
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter survey description"
                className="bg-clari-darkBg border-clari-darkAccent"
              />
            </div>

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
                      onClick={() => handleRemoveQuestion(index)}
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
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSaveSurvey} 
              className="w-full" 
              disabled={isCreating}
            >
              {isCreating ? "Creating Survey..." : "Create Survey"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SurveyCreator;
