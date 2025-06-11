
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ExternalLink, Edit } from 'lucide-react';
import SurveyQuestion from './SurveyQuestion';
import SurveyCompleted from './SurveyCompleted';
import SurveyProgress from './SurveyProgress';
import { fetchSurveyById, fetchSurveyBySlug } from '@/utils/supabase/database';
import { SurveyQuestion as DatabaseSurveyQuestion } from '@/utils/types/database';

interface Survey {
  id: string;
  title: string;
  description?: string;
  questions: DatabaseSurveyQuestion[];
  business_id?: string;
}

interface SurveyResponseProps {
  surveyId?: string;
  isSlug?: boolean;
}

const SurveyResponse = ({ surveyId, isSlug }: SurveyResponseProps) => {
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
      const targetId = surveyId || slug;
      
      if (!targetId) {
        setError('Survey not found');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Loading survey with ID:', targetId, 'isSlug:', isSlug);
        
        let result;
        if (isSlug || !targetId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
          console.log('Fetching by slug');
          result = await fetchSurveyBySlug(targetId);
        } else {
          console.log('Fetching by ID');
          result = await fetchSurveyById(targetId);
        }
        
        console.log('Survey fetch result:', result);
        
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
  }, [slug, surveyId, isSlug]);

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
      console.log('Triggering webhook with survey data:', { surveyId: survey.id, answers });
      
      // Trigger the specific webhook
      const webhookUrl = 'https://clariquest.app.n8n.cloud/webhook-test/e14fdeac-f48b-44e6-96cd-2d946bb6d47d';
      
      const webhookPayload = {
        surveyId: survey.id,
        surveyTitle: survey.title,
        businessId: survey.business_id,
        responses: answers,
        metadata: {
          timestamp: new Date().toISOString(),
          sessionId: 'session_' + Date.now(),
          userAgent: navigator.userAgent
        }
      };

      console.log('Sending webhook payload:', webhookPayload);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload)
      });

      if (response.ok) {
        console.log('Webhook triggered successfully');
        toast({
          title: "Survey submitted!",
          description: "Thank you for your feedback. Your responses have been processed.",
        });
        
        // Navigate to results page
        navigate(`/survey/results/${survey.id}`);
      } else {
        console.error('Webhook failed with status:', response.status);
        toast({
          title: "Error",
          description: "Failed to submit survey. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error triggering webhook:', error);
      toast({
        title: "Error",
        description: "Failed to submit survey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSurvey = () => {
    if (survey) {
      window.open(`/survey/create/${survey.business_id || 'edit'}?surveyId=${survey.id}`, '_blank');
    }
  };

  const handleOpenInNewTab = () => {
    if (survey) {
      window.open(`/survey/${survey.id}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clari-darkBg to-clari-darkCard">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-clari-gold mx-auto"></div>
          <p className="mt-4 text-clari-muted">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clari-darkBg to-clari-darkCard">
        <Card className="w-full max-w-md bg-clari-darkCard border-clari-darkAccent">
          <CardHeader>
            <CardTitle className="text-center text-clari-text">Survey Not Found</CardTitle>
            <CardDescription className="text-center text-clari-muted">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate('/')} className="bg-clari-gold text-black hover:bg-clari-gold/90">
                Go Home
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="border-clari-gold text-clari-gold hover:bg-clari-gold hover:text-black"
              >
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clari-darkBg to-clari-darkCard">
        <Card className="w-full max-w-md bg-clari-darkCard border-clari-darkAccent">
          <CardHeader>
            <CardTitle className="text-center text-clari-text">Survey Not Found</CardTitle>
            <CardDescription className="text-center text-clari-muted">
              The survey you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate('/')} className="bg-clari-gold text-black hover:bg-clari-gold/90">
                Go Home
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="border-clari-gold text-clari-gold hover:bg-clari-gold hover:text-black"
              >
                Reload Page
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

  const currentQuestion = survey.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;
  const currentAnswer = answers[currentQuestion.id];
  const canProceed = currentAnswer !== undefined && currentAnswer !== '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-clari-darkBg to-clari-darkCard">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Survey Header with Actions */}
          <div className="mb-8 text-center relative">
            <div className="absolute top-0 right-0 flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleOpenInNewTab}
                className="border-clari-gold text-clari-gold hover:bg-clari-gold hover:text-black"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleEditSurvey}
                className="border-clari-gold text-clari-gold hover:bg-clari-gold hover:text-black"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-clari-text">{survey.title}</h1>
            {survey.description && (
              <p className="text-clari-muted">{survey.description}</p>
            )}
          </div>

          <SurveyProgress 
            currentQuestion={currentQuestionIndex + 1} 
            totalQuestions={survey.questions.length}
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
              className="border-clari-darkAccent text-clari-text hover:bg-clari-darkAccent"
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
