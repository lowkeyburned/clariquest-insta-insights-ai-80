
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import SurveyQuestion from "./SurveyQuestion";
import SurveyProgress from "./SurveyProgress";
import SurveyNavigation from "./SurveyNavigation";

interface SurveyFullViewProps {
  surveyData: {
    businessName: string;
    title: string;
    description: string;
    questions: any[];
  };
  currentQuestion: number;
  answers: Record<number, string | number>;
  onAnswerChange: (value: string | number) => void;
  onGoBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleUI: () => void;
  isLastQuestion: boolean;
}

const SurveyFullView = ({
  surveyData,
  currentQuestion,
  answers,
  onAnswerChange,
  onGoBack,
  onPrevious,
  onNext,
  onToggleUI,
  isLastQuestion
}: SurveyFullViewProps) => {
  const currentQuestionData = surveyData.questions[currentQuestion];
  
  return (
    <div className="min-h-screen bg-clari-darkBg text-clari-text p-6">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="outline" 
          className="mb-4" 
          onClick={onGoBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardHeader>
            <div className="text-sm text-clari-muted mb-2">{surveyData.businessName}</div>
            <CardTitle>{surveyData.title}</CardTitle>
            <p className="text-sm text-clari-muted mt-2">{surveyData.description}</p>
          </CardHeader>
          <CardContent>
            <SurveyProgress 
              currentQuestion={currentQuestion} 
              totalQuestions={surveyData.questions.length} 
            />
            
            <SurveyQuestion 
              question={currentQuestionData} 
              value={answers[currentQuestion] || ""} 
              onChange={onAnswerChange}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Button 
              onClick={onToggleUI}
              variant="outline"
            >
              Questions only
            </Button>
            <Button onClick={onNext}>
              {isLastQuestion ? "Submit" : "Next"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SurveyFullView;
