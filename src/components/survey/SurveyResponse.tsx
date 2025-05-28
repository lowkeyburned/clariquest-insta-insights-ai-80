
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { fetchSurveyById, fetchSurveyBySlug } from "@/utils/supabase/database";
import { saveSurveyResponse } from "@/utils/supabase/surveyResponseHelpers";
import { SurveyQuestion } from "@/utils/types/database";
import SurveyCompleted from "./SurveyCompleted";
import { useQuery } from "@tanstack/react-query";
import SurveyQuestionComponent from "./SurveyQuestion";

interface SurveyResponseProps {
  surveyId: string;
  isSlug?: boolean;
  responses?: any;
}

const SurveyResponse = ({ surveyId, isSlug = false, responses }: SurveyResponseProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  
  useEffect(() => {
    if (responses) {
      setAnswers(responses);
    }
  }, [responses]);
  
  const { data: survey, isLoading, error } = useQuery({
    queryKey: ['survey', surveyId, isSlug],
    queryFn: async () => {
      if (!surveyId) {
        throw new Error('Survey ID or slug is required');
      }
      
      try {
        const result = isSlug ? await fetchSurveyBySlug(surveyId) : await fetchSurveyById(surveyId);
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch survey');
        }
        return result.data;
      } catch (error) {
        console.error('Error fetching survey:', error);
        throw error;
      }
    },
    enabled: !!surveyId,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const handleSubmit = async () => {
    if (!survey) {
      toast({
        title: "Error",
        description: "Survey data not available. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }
    
    const requiredQuestions = survey.questions.filter((q: SurveyQuestion) => q.required);
    const missingAnswers = requiredQuestions.filter((q: SurveyQuestion) => 
      !answers[q.id] || 
      (Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).length === 0 : !answers[q.id])
    );

    if (missingAnswers.length > 0) {
      toast({
        title: "Incomplete Responses",
        description: `Please answer all required questions. ${missingAnswers.length} question(s) remaining.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting survey response:', { surveyId: survey.id, answers });
      const result = await saveSurveyResponse(survey.id, answers);
      
      if (result.success) {
        setIsCompleted(true);
        toast({
          title: "Success",
          description: "Your survey response has been submitted successfully!",
        });
      } else {
        throw new Error(result.error || 'Failed to submit survey');
      }
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit survey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (questionId: string, value: string | string[]) => {
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
      <div className="container max-w-3xl mx-auto p-4">
        <Card className="bg-clari-darkBg border-clari-darkAccent">
          <CardContent className="p-8">
            <div className="flex justify-center items-center h-40">
              <p className="text-clari-gold">Loading survey...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="container max-w-3xl mx-auto p-4">
        <Card className="bg-clari-darkBg border-clari-darkAccent">
          <CardContent className="p-8">
            <div className="flex flex-col justify-center items-center h-40 space-y-4">
              <p className="text-red-500">
                {error instanceof Error ? error.message : "Survey not found or error loading survey."}
              </p>
              <Button 
                onClick={() => navigate("/ai-insights")} 
                className="bg-clari-gold text-black hover:bg-clari-gold/90"
              >
                Return to Insights
              </Button>
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
      <Card className="shadow-lg border-t-4 border-t-clari-gold bg-clari-darkBg">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl text-clari-gold">{survey.title}</CardTitle>
          {survey.description && (
            <CardDescription className="text-base text-gray-300">{survey.description}</CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          <Separator className="my-4 bg-clari-darkAccent" />
          
          <div className="space-y-6">
            {(survey.questions || []).map((question: SurveyQuestion) => (
              <div key={question.id} className="border border-clari-darkAccent rounded-md p-4">
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
