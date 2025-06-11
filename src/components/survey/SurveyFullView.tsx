
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SurveyQuestion from './SurveyQuestion';
import SurveyNavigation from './SurveyNavigation';
import SurveyProgress from './SurveyProgress';
import SurveyCompleted from './SurveyCompleted';
import { fetchSurveyById } from '@/utils/supabase/surveyHelpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SurveyFullView = () => {
  const { id } = useParams<{ id: string }>();
  const [survey, setSurvey] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<any>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSurvey = async () => {
      if (!id) {
        setError('No survey ID provided');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Loading survey with ID:', id);
        const result = await fetchSurveyById(id);
        
        if (result.success && result.data) {
          console.log('Survey loaded successfully:', result.data);
          setSurvey(result.data);
        } else {
          console.error('Failed to load survey:', result.error);
          setError(result.error || 'Failed to load survey');
        }
      } catch (error) {
        console.error("Failed to load survey:", error);
        setError('An unexpected error occurred while loading the survey');
      } finally {
        setIsLoading(false);
      }
    };

    loadSurvey();
  }, [id]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setResponses(prevResponses => ({
      ...prevResponses,
      [questionId]: value,
    }));
  };

  const goToNextQuestion = () => {
    if (survey && currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitSurvey = async () => {
    console.log("Survey Responses:", responses);
    setIsCompleted(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clari-darkBg to-clari-darkCard">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-clari-gold mx-auto mb-4"></div>
          <p className="text-clari-muted text-lg">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clari-darkBg to-clari-darkCard">
        <Card className="w-full max-w-md bg-clari-darkCard border-clari-darkAccent">
          <CardHeader className="text-center">
            <CardTitle className="text-clari-text">Error Loading Survey</CardTitle>
            <CardDescription className="text-clari-muted">
              {error}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clari-darkBg to-clari-darkCard">
        <Card className="w-full max-w-md bg-clari-darkCard border-clari-darkAccent">
          <CardHeader className="text-center">
            <CardTitle className="text-clari-text">Survey Not Found</CardTitle>
            <CardDescription className="text-clari-muted">
              The requested survey could not be found.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!survey.questions || survey.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clari-darkBg to-clari-darkCard">
        <Card className="w-full max-w-md bg-clari-darkCard border-clari-darkAccent">
          <CardHeader className="text-center">
            <CardTitle className="text-clari-text">No Questions Available</CardTitle>
            <CardDescription className="text-clari-muted">
              This survey doesn't have any questions yet.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentQuestion = survey.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-clari-darkBg to-clari-darkCard">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto bg-clari-darkCard border-clari-darkAccent">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{survey.title}</CardTitle>
            {survey.description && (
              <CardDescription className="text-clari-muted">
                {survey.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {!isCompleted ? (
              <>
                <SurveyProgress
                  currentQuestion={currentQuestionIndex + 1} 
                  totalQuestions={survey.questions.length} 
                />
                <SurveyQuestion
                  question={currentQuestion}
                  value={responses[currentQuestion.id]}
                  onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                />
                <SurveyNavigation
                  isFirstQuestion={currentQuestionIndex === 0}
                  isLastQuestion={currentQuestionIndex === survey.questions.length - 1}
                  onPrevious={goToPreviousQuestion}
                  onNext={goToNextQuestion}
                  onSubmit={handleSubmitSurvey}
                />
              </>
            ) : (
              <SurveyCompleted />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SurveyFullView;
