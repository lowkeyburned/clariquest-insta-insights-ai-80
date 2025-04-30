
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

interface SurveyQuestion {
  id: number;
  type: "multiple_choice" | "open_ended" | "slider";
  text: string;
  options?: string[];
  min?: number;
  max?: number;
}

interface SurveyData {
  id: string;
  businessName: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  createdAt: string;
}

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
  const [createdSurveyId, setCreatedSurveyId] = useState<string | null>(null);

  const handleAddQuestion = () => {
    const questionId = questions.length + 1;
    setQuestions([...questions, { ...newQuestion, id: questionId }]);
    setNewQuestion({
      text: "",
      type: "multiple_choice",
      options: [""]
    });
  };

  const handleSaveSurvey = () => {
    const survey: SurveyData = {
      id: `survey-${Date.now()}`,
      businessName: "Your Business",
      title,
      description,
      questions,
      createdAt: new Date().toISOString()
    };

    const surveys = JSON.parse(localStorage.getItem('surveys') || '[]');
    localStorage.setItem('surveys', JSON.stringify([...surveys, survey]));

    // Store the created survey ID
    setCreatedSurveyId(survey.id);

    const surveyLink = `${window.location.origin}/survey/${survey.id}`;
    
    toast({
      title: "Survey Created Successfully",
      description: (
        <div className="mt-2 space-y-2">
          <p>Share this link with respondents:</p>
          <code className="bg-clari-darkBg p-2 rounded block break-all">
            {surveyLink}
          </code>
          <p className="text-sm text-clari-muted">
            Note: This link will show a clean, questions-only interface.
          </p>
        </div>
      ),
      duration: 10000, // Show for 10 seconds since there's more content
    });
  };

  const handleViewResults = () => {
    if (createdSurveyId) {
      navigate(`/survey/results/${createdSurveyId}`);
    }
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

                <Button onClick={handleAddQuestion} className="w-full">
                  Add Question
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preview Questions</h3>
              {questions.map((question, index) => (
                <div key={index} className="p-4 border border-clari-darkAccent rounded-md">
                  <p className="font-medium">{question.text}</p>
                  <p className="text-sm text-clari-muted">Type: {question.type}</p>
                </div>
              ))}
            </div>

            {createdSurveyId && (
              <div className="mt-4 p-4 border border-clari-gold bg-clari-darkBg/30 rounded-md">
                <p className="font-medium text-clari-gold">Survey created successfully!</p>
                <Button 
                  onClick={handleViewResults}
                  variant="outline"
                  className="mt-2 border-clari-gold text-clari-gold hover:bg-clari-gold/10"
                >
                  View Survey Results
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSurvey} className="w-full">
              Create Survey
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SurveyCreator;
