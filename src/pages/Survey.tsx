
import { useParams } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const Survey = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // Mock survey data (replace with actual data fetching from PostgreSQL later)
  const survey = {
    businessName: "Acme Corp",
    title: "Customer Satisfaction Survey",
    description: "Help us improve our services by providing your feedback.",
    questions: [
      {
        id: 1,
        type: "multiple_choice",
        text: "How satisfied are you with our product?",
        options: ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very dissatisfied"]
      },
      {
        id: 2,
        type: "multiple_choice",
        text: "How likely are you to recommend our product to others?",
        options: ["Extremely likely", "Likely", "Neutral", "Unlikely", "Extremely unlikely"]
      },
      {
        id: 3,
        type: "open_ended",
        text: "What improvements would you suggest for our product?"
      },
      {
        id: 4,
        type: "multiple_choice",
        text: "How would you rate the customer service?",
        options: ["Excellent", "Good", "Fair", "Poor", "Very poor"]
      },
      {
        id: 5,
        type: "open_ended",
        text: "Any additional comments or feedback?"
      }
    ]
  };

  const handleAnswerChange = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (currentQuestion < survey.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Store survey responses - will be connected to PostgreSQL later
    console.log("Survey responses:", { surveyId: id, answers });
    
    toast({
      title: "Survey submitted successfully",
      description: "Thank you for your feedback!",
    });
    
    // Reset the survey
    setCurrentQuestion(0);
    setAnswers({});
  };

  const currentQuestionData = survey.questions[currentQuestion];
  const isLastQuestion = currentQuestion === survey.questions.length - 1;

  return (
    <div className="min-h-screen bg-clari-darkBg text-clari-text p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardHeader>
            <div className="text-sm text-clari-muted mb-2">{survey.businessName}</div>
            <CardTitle>{survey.title}</CardTitle>
            <p className="text-sm text-clari-muted mt-2">{survey.description}</p>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-clari-muted">Question {currentQuestion + 1} of {survey.questions.length}</span>
                <span className="text-sm text-clari-muted">{Math.round(((currentQuestion + 1) / survey.questions.length) * 100)}% complete</span>
              </div>
              <div className="w-full bg-clari-darkBg rounded-full h-2.5">
                <div 
                  className="bg-clari-gold h-2.5 rounded-full" 
                  style={{ width: `${((currentQuestion + 1) / survey.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <h3 className="text-xl font-medium mb-4">{currentQuestionData.text}</h3>
            
            {currentQuestionData.type === "multiple_choice" && (
              <RadioGroup 
                value={answers[currentQuestion] || ""}
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
                value={answers[currentQuestion] || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="min-h-[120px] bg-clari-darkBg border-clari-darkAccent"
              />
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
            <Button
              onClick={handleNext}
            >
              {isLastQuestion ? "Submit" : "Next"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Survey;
