
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { fetchSurveyById, saveSurveyResponse } from "@/utils/supabaseHelpers";
import { SurveyQuestion } from "@/utils/sampleSurveyData";
import SurveyCompleted from "./SurveyCompleted";
import { useQuery } from "@tanstack/react-query";

interface SurveyResponseProps {
  surveyId: string;
}

const SurveyResponse = ({ surveyId }: SurveyResponseProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  
  // Fetch survey data
  const { data: survey, isLoading, error } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: () => fetchSurveyById(surveyId)
  });

  const handleSubmit = async () => {
    if (!survey) return;
    
    // Basic validation - ensure all required questions are answered
    const requiredQuestions = survey.questions;
    let missingAnswers = false;

    requiredQuestions.forEach((question: SurveyQuestion) => {
      if (answers[question.id] === undefined) {
        missingAnswers = true;
      }
    });

    if (missingAnswers) {
      toast({
        title: "Incomplete Responses",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await saveSurveyResponse(surveyId, answers);
      setIsCompleted(true);
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your responses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (questionId: number, value: string | number) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto p-4">
        <Card>
          <CardContent className="p-8">
            <div className="flex justify-center items-center h-40">
              <p>Loading survey...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="container max-w-3xl mx-auto p-4">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col justify-center items-center h-40 space-y-4">
              <p className="text-destructive">Survey not found or error loading survey.</p>
              <Button onClick={() => navigate("/")}>Return Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return <SurveyCompleted />;
  }

  return (
    <div className="container max-w-3xl mx-auto p-4">
      <Card className="shadow-lg border-t-4 border-t-primary">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">{survey.title}</CardTitle>
          <CardDescription className="text-base">{survey.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <Separator className="my-4" />
          
          <div className="space-y-6">
            {survey.questions.map((question: SurveyQuestion) => (
              <div key={question.id} className="border rounded-md p-4">
                <p className="text-lg font-medium mb-2">{question.text}</p>
                
                {question.type === "multiple_choice" && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, idx) => (
                      <label key={idx} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-secondary/20 rounded-md">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={() => handleInputChange(question.id, option)}
                          className="h-4 w-4"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}
                
                {question.type === "open_ended" && (
                  <textarea
                    className="w-full min-h-[100px] p-2 border rounded-md"
                    placeholder="Enter your answer..."
                    value={answers[question.id] as string || ""}
                    onChange={(e) => handleInputChange(question.id, e.target.value)}
                  />
                )}
                
                {question.type === "slider" && question.min !== undefined && question.max !== undefined && (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={question.min}
                      max={question.max}
                      value={answers[question.id] as number || 0}
                      onChange={(e) => handleInputChange(question.id, parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs">
                      <span>{question.min}</span>
                      <span>{question.max}</span>
                    </div>
                    <div className="text-center">
                      Selected value: {answers[question.id] !== undefined ? answers[question.id] : "-"}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : "Submit Survey"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyResponse;
