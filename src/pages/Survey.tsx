
import { useParams } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

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

const Survey = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const isCreateMode = id?.startsWith('create');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  
  // Survey creation state
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

    // Save to localStorage for now
    const surveys = JSON.parse(localStorage.getItem('surveys') || '[]');
    localStorage.setItem('surveys', JSON.stringify([...surveys, survey]));

    const surveyLink = `${window.location.origin}/survey/${survey.id}`;
    toast({
      title: "Survey Created Successfully",
      description: `Share this link with respondents: ${surveyLink}`,
    });
  };

  const handleSubmitResponse = () => {
    // Store survey responses - will be connected to storage later
    console.log("Survey responses:", { surveyId: id, answers });
    
    toast({
      title: "Survey submitted successfully",
      description: "Thank you for your feedback!",
    });
    
    // Reset the survey
    setCurrentQuestion(0);
    setAnswers({});
  };

  if (isCreateMode) {
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
  }

  // Load survey data for response mode
  const surveyData = (() => {
    if (!id) return null;
    const surveys = JSON.parse(localStorage.getItem('surveys') || '[]');
    return surveys.find((s: SurveyData) => s.id === id);
  })();

  if (!surveyData) {
    return (
      <div className="min-h-screen bg-clari-darkBg text-clari-text p-6">
        <Card className="max-w-3xl mx-auto bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-6">
            <p className="text-center">Survey not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestionData = surveyData.questions[currentQuestion];
  const isLastQuestion = currentQuestion === surveyData.questions.length - 1;

  const handleAnswerChange = (value: string | number) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (currentQuestion < surveyData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitResponse();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <div className="min-h-screen bg-clari-darkBg text-clari-text p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardHeader>
            <div className="text-sm text-clari-muted mb-2">{surveyData.businessName}</div>
            <CardTitle>{surveyData.title}</CardTitle>
            <p className="text-sm text-clari-muted mt-2">{surveyData.description}</p>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-clari-muted">
                  Question {currentQuestion + 1} of {surveyData.questions.length}
                </span>
                <span className="text-sm text-clari-muted">
                  {Math.round(((currentQuestion + 1) / surveyData.questions.length) * 100)}% complete
                </span>
              </div>
              <div className="w-full bg-clari-darkBg rounded-full h-2.5">
                <div 
                  className="bg-clari-gold h-2.5 rounded-full" 
                  style={{ width: `${((currentQuestion + 1) / surveyData.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <h3 className="text-xl font-medium mb-4">{currentQuestionData.text}</h3>
            
            {currentQuestionData.type === "multiple_choice" && (
              <RadioGroup 
                value={answers[currentQuestion]?.toString() || ""}
                onValueChange={handleAnswerChange}
                className="space-y-3"
              >
                {currentQuestionData.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            
            {currentQuestionData.type === "open_ended" && (
              <Textarea
                placeholder="Type your answer here..."
                value={answers[currentQuestion]?.toString() || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="min-h-[120px] bg-clari-darkBg border-clari-darkAccent"
              />
            )}

            {currentQuestionData.type === "slider" && (
              <div className="space-y-4">
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[Number(answers[currentQuestion] || 0)]}
                  onValueChange={(values) => handleAnswerChange(values[0])}
                />
                <div className="text-center">
                  Selected value: {answers[currentQuestion] || 0}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Button onClick={handleNext}>
              {isLastQuestion ? "Submit" : "Next"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Survey;
