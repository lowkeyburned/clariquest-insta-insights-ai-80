
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
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

interface SurveyResponseProps {
  surveyId: string;
}

const SurveyResponse = ({ surveyId }: SurveyResponseProps) => {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});

  // Initialize a sample survey if none exists
  const initializeSampleSurvey = () => {
    const surveys = JSON.parse(localStorage.getItem('surveys') || '[]');
    if (!surveys.some((s: SurveyData) => s.id === "1")) {
      const sampleSurvey: SurveyData = {
        id: "1",
        businessName: "Sample Business",
        title: "Customer Satisfaction Survey",
        description: "Please help us improve our services by answering a few questions.",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            text: "How satisfied are you with our service?",
            options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]
          },
          {
            id: 2,
            type: "open_ended",
            text: "What suggestions do you have for improving our service?",
          },
          {
            id: 3,
            type: "slider",
            text: "On a scale of 0-10, how likely are you to recommend us to a friend?",
            min: 0,
            max: 10
          }
        ],
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('surveys', JSON.stringify([...surveys, sampleSurvey]));
    }
  };

  // Call the initialization function
  initializeSampleSurvey();

  const surveyData = (() => {
    const surveys = JSON.parse(localStorage.getItem('surveys') || '[]');
    return surveys.find((s: SurveyData) => s.id === surveyId);
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

  const handleSubmitResponse = () => {
    console.log("Survey responses:", { surveyId, answers });
    
    toast({
      title: "Survey submitted successfully",
      description: "Thank you for your feedback!",
    });
    
    setCurrentQuestion(0);
    setAnswers({});
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

export default SurveyResponse;
