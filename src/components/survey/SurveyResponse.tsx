
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { initializeSampleSurvey, getSurveyById, SurveyData } from "@/utils/sampleSurveyData";
import { saveSurveyResponse } from "@/utils/surveyResponseUtils";
import SurveyMinimalView from "./SurveyMinimalView";
import SurveyFullView from "./SurveyFullView";
import SurveyCompleted from "./SurveyCompleted";

interface SurveyResponseProps {
  surveyId: string;
}

const SurveyResponse = ({ surveyId }: SurveyResponseProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMinimalUI, setIsMinimalUI] = useState(true);

  // Call the initialization function
  initializeSampleSurvey();

  const surveyData = getSurveyById(surveyId);

  const handleGoBack = () => {
    navigate(-1);
  };

  // Toggle between minimal UI (questions only) and full UI
  const toggleUI = () => {
    setIsMinimalUI(!isMinimalUI);
  };

  const handleAnswerChange = (value: string | number) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (currentQuestion < (surveyData?.questions.length ?? 0) - 1) {
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
    // Save the response and get the response ID
    const responseId = saveSurveyResponse(surveyId, answers);
    
    toast({
      title: "Survey submitted successfully",
      description: "Thank you for your feedback!",
    });
    
    setIsCompleted(true);
  };

  // If survey not found
  if (!surveyData) {
    return (
      <div className="min-h-screen bg-clari-darkBg text-clari-text p-6">
        <div className="max-w-3xl mx-auto">
          <SurveyCompleted onGoBack={handleGoBack} />
          <p className="text-center">Survey not found</p>
        </div>
      </div>
    );
  }

  // If survey is completed, show thank you message
  if (isCompleted) {
    return <SurveyCompleted onGoBack={handleGoBack} />;
  }

  const isLastQuestion = currentQuestion === surveyData.questions.length - 1;
  const currentQuestionData = surveyData.questions[currentQuestion];

  // Use the appropriate view component based on the UI mode
  return isMinimalUI ? (
    <SurveyMinimalView
      surveyQuestion={currentQuestionData}
      currentQuestion={currentQuestion}
      answers={answers}
      onAnswerChange={handleAnswerChange}
      onGoBack={handleGoBack}
      onPrevious={handlePrevious}
      onNext={handleNext}
      onToggleUI={toggleUI}
      isLastQuestion={isLastQuestion}
    />
  ) : (
    <SurveyFullView
      surveyData={surveyData}
      currentQuestion={currentQuestion}
      answers={answers}
      onAnswerChange={handleAnswerChange}
      onGoBack={handleGoBack}
      onPrevious={handlePrevious}
      onNext={handleNext}
      onToggleUI={toggleUI}
      isLastQuestion={isLastQuestion}
    />
  );
};

export default SurveyResponse;
