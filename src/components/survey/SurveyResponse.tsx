
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import SurveyQuestion from './SurveyQuestion';
import SurveyCompleted from './SurveyCompleted';
import SurveyProgress from './SurveyProgress';
import { fetchSurveyBySlug, saveSurveyResponse } from '@/utils/supabase';
import { SurveyQuestion as DatabaseSurveyQuestion } from '@/utils/types/database';

interface Survey {
  id: string;
  title: string;
  description?: string;
  questions: DatabaseSurveyQuestion[];
}

const SurveyResponse = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSurvey = async () => {
      if (!slug) {
        setError('Survey not found');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Loading survey by slug:', slug);
        const result = await fetchSurveyBySlug(slug);
        
        if (result.success && result.data) {
          console.log('Survey loaded successfully:', result.data);
          setSurvey(result.data);
          setError(null);
        } else {
          console.error('Failed to load survey:', result.error);
          setError(result.error || 'Failed to load survey');
        }
      } catch (err) {
        console.error('Error loading survey:', err);
        setError('Failed to load survey');
      } finally {
        setIsLoading(false);
      }
    };

    loadSurvey();
  }, [slug]);

  const handleAnswerChange = (questionId: string, answer: string | string[] | number) => {
    console.log('Answer changed:', { questionId, answer });
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: typeof answer === 'number' ? answer.toString() : answer
    }));
  };

  const handleNext = () => {
    if (survey && currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!survey) return;

    setIsSubmitting(true);
    
    try {
      console.log('Submitting survey response:', { surveyId: survey.id, answers });
      
      const result = await saveSurveyResponse(survey.id, answers);
      
      if (result.success) {
        console.log('Survey response submitted successfully');
        setIsCompleted(true);
        toast({
          title: "Survey submitted!",
          description: "Thank you for your feedback.",
        });
      } else {
        console.error('Failed to submit survey response:', result.error);
        toast({
          title: "Error",
          description: result.error || "Failed to submit survey response. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting survey response:', error);
      toast({
        title: "Error",
        description: "Failed to submit survey response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-clari-gold mx-auto"></div>
          <p className="mt-4 text-clari-muted">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Survey Not Found</CardTitle>
            <CardDescription className="text-center">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/')}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Survey Not Found</CardTitle>
            <CardDescription className="text-center">
              The survey you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/')}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return <SurveyCompleted survey={survey} />;
  }

  const currentQuestion = survey.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / survey.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;
  const currentAnswer = answers[currentQuestion.id];
  const canProceed = currentAnswer !== undefined && currentAnswer !== '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-clari-darkBg to-clari-darkCard">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
            {survey.description && (
              <p className="text-clari-muted">{survey.description}</p>
            )}
          </div>

          <SurveyProgress 
            current={currentQuestionIndex + 1} 
            total={survey.questions.length} 
            progress={progress}
          />

          <Card className="mb-8 bg-clari-darkCard border-clari-darkAccent">
            <CardContent className="p-8">
              <SurveyQuestion
                question={currentQuestion}
                value={currentAnswer}
                onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>

            {isLastQuestion ? (
              <Button 
                onClick={handleSubmit}
                disabled={!canProceed || isSubmitting}
                className="bg-clari-gold text-black hover:bg-clari-gold/90"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Survey'}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={!canProceed}
                className="bg-clari-gold text-black hover:bg-clari-gold/90"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyResponse;
