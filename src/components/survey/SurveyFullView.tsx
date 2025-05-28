
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SurveyQuestion from './SurveyQuestion';
import SurveyNavigation from './SurveyNavigation';
import SurveyProgress from './SurveyProgress';
import SurveyCompleted from './SurveyCompleted';
import { fetchSurveyById } from '@/utils/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SurveyFullView = () => {
  const { id } = useParams<{ id: string }>();
  const [survey, setSurvey] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<any>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSurvey = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const result = await fetchSurveyById(id);
        if (result.success && result.data) {
          setSurvey(result.data);
        }
      } catch (error) {
        console.error("Failed to load survey:", error);
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
    if (currentQuestionIndex < survey.questions.length - 1) {
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
    return <div className="p-8">Loading survey...</div>;
  }

  if (!survey) {
    return <div className="p-8">Survey not found.</div>;
  }

  const currentQuestion = survey.questions[currentQuestionIndex];

  return (
    <div className="container mx-auto mt-8">
      <Card className="max-w-3xl mx-auto bg-clari-darkCard border-clari-darkAccent">
        <CardHeader>
          <CardTitle>{survey.title}</CardTitle>
          <CardDescription>{survey.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
  );
};

export default SurveyFullView;
