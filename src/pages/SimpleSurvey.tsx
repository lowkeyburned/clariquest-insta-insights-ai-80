
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SurveyData {
  title: string;
  questions: string[];
}

const SimpleSurvey = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSurvey();
  }, [code]);

  const loadSurvey = async () => {
    if (!code) {
      toast({
        title: "Error",
        description: "Invalid survey link",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('instagram_surveys')
        .select('*')
        .eq('unique_code', code)
        .single();

      if (error || !data) {
        toast({
          title: "Survey Not Found",
          description: "This survey link may have expired or been removed",
          variant: "destructive",
        });
        return;
      }

      setSurveyData({
        title: data.title,
        questions: data.questions
      });
      setAnswers(new Array(data.questions.length).fill(''));
    } catch (error) {
      console.error('Error loading survey:', error);
      toast({
        title: "Error",
        description: "Failed to load survey",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < (surveyData?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitSurvey = async () => {
    if (!code || !surveyData) return;

    setIsSubmitting(true);
    try {
      // Save the response
      const { error: responseError } = await supabase
        .from('instagram_survey_responses')
        .insert([{
          survey_code: code,
          answers: answers,
          submitted_at: new Date().toISOString()
        }]);

      if (responseError) throw responseError;

      // Update response count
      const { error: updateError } = await supabase.rpc('increment_response_count', {
        survey_code: code
      });

      if (updateError) console.warn('Failed to update count:', updateError);

      setIsCompleted(true);
      toast({
        title: "Thank You!",
        description: "Your response has been submitted successfully",
      });
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!surveyData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Survey not found or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-4">Your response has been submitted successfully.</p>
            <Button onClick={() => window.close()}>Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLastQuestion = currentQuestion === (surveyData.questions.length - 1);
  const currentAnswer = answers[currentQuestion] || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{surveyData.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {surveyData.questions.length}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / surveyData.questions.length) * 100}%` }}
              ></div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                {surveyData.questions[currentQuestion]}
              </h3>
              <Textarea
                value={currentAnswer}
                onChange={(e) => updateAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={4}
                className="w-full"
              />
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={submitSurvey}
                  disabled={!currentAnswer.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Survey'}
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  disabled={!currentAnswer.trim()}
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleSurvey;
