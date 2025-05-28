
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { fetchSurveyById, fetchSurveyBySlug } from "@/utils/supabase";
import { saveSurveyResponse } from "@/utils/supabase/surveyResponseHelpers";
import { SurveyQuestion as SurveyQuestionType } from "@/utils/sampleSurveyData";
import SurveyCompleted from "./SurveyCompleted";
import { useQuery } from "@tanstack/react-query";
import SurveyQuestionComponent from "./SurveyQuestion";

interface SurveyResponseProps {
  surveyId: string;
  isSlug?: boolean;
  responses?: any; // For backward compatibility
}

const SurveyResponse = ({ surveyId, isSlug = false, responses }: SurveyResponseProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  
  // For backward compatibility
  useEffect(() => {
    if (responses) {
      setAnswers(responses);
    }
  }, [responses]);
  
  // Fetch survey data using either ID or slug
  const { data: survey, isLoading, error } = useQuery({
    queryKey: ['survey', surveyId, isSlug],
    queryFn: async () => {
      if (!surveyId) {
        throw new Error('Survey ID is required');
      }
      
      try {
        const result = isSlug ? await fetchSurveyBySlug(surveyId) : await fetchSurveyById(surveyId);
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch survey');
        }
        
        // Sort questions by order_index
        if (result.data?.questions) {
          result.data.questions.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
        }
        
        return result.data;
      } catch (error) {
        console.error('Error fetching survey:', error);
        throw error;
      }
    },
    enabled: !!surveyId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSubmit = async () => {
    if (!survey) {
      toast.error("Survey data not available. Please refresh the page.");
      return;
    }
    
    // Basic validation - ensure all required questions are answered
    const requiredQuestions = survey.questions || [];
    const missingAnswers = requiredQuestions.filter((question: SurveyQuestionType) => {
      const answer = answers[question.id];
      if (answer === undefined || answer === '') return true;
      // For multiple choice questions, check if array is empty
      if (Array.isArray(answer) && answer.length === 0) return true;
      return false;
    });

    if (missingAnswers.length > 0) {
      toast.error(`Please answer all questions before submitting. ${missingAnswers.length} question(s) remaining.`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the survey's internal ID, not the slug
      const result = await saveSurveyResponse(survey.id, answers);
      
      if (result.success) {
        setIsCompleted(true);
        toast.success("Survey submitted successfully!");
      } else {
        throw new Error(result.error || 'Failed to submit survey');
      }
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast.error("Failed to submit survey. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (questionId: number | string, value: string | number | string[]) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto p-4 bg-clari-darkBg min-h-screen">
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-8">
            <div className="flex justify-center items-center h-40">
              <p className="text-clari-text">Loading survey...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="container max-w-3xl mx-auto p-4 bg-clari-darkBg min-h-screen">
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-8">
            <div className="flex flex-col justify-center items-center h-40 space-y-4">
              <p className="text-red-400">
                {error instanceof Error ? error.message : "Survey not found or error loading survey."}
              </p>
              <Button 
                onClick={() => navigate("/ai-insights")}
                className="bg-clari-gold text-black hover:bg-clari-gold/90"
              >
                Return to AI Insights
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return <SurveyCompleted onGoBack={handleGoBack} />;
  }

  return (
    <div className="container max-w-3xl mx-auto p-4 bg-clari-darkBg min-h-screen">
      <Card className="shadow-lg border-t-4 border-t-clari-gold bg-clari-darkCard">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl text-clari-text">{survey.title}</CardTitle>
          {survey.description && (
            <CardDescription className="text-base text-clari-muted">{survey.description}</CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          <Separator className="my-4 bg-clari-darkAccent" />
          
          <div className="space-y-6">
            {(survey.questions || []).map((question: SurveyQuestionType) => (
              <div key={question.id} className="border border-clari-darkAccent rounded-md p-4 bg-clari-darkBg/50">
                <SurveyQuestionComponent
                  question={question}
                  value={answers[question.id]}
                  onChange={(value) => handleInputChange(question.id, value)}
                />
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="w-full bg-clari-gold text-black hover:bg-clari-gold/90"
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
