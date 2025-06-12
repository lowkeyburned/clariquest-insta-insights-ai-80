
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ExternalLink, Edit, CheckCircle, Clock, BarChart3, AlertCircle } from 'lucide-react';
import SurveyQuestion from './SurveyQuestion';
import SurveyCompleted from './SurveyCompleted';
import SurveyProgress from './SurveyProgress';
import { fetchSurveyById, fetchSurveyBySlug } from '@/utils/supabase/database';
import { saveSurveySubmission } from '@/utils/supabase/surveySubmissionHelpers';
import { fetchSurveysForBusiness } from '@/utils/supabase/businessHelpers';
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

type SubmissionStep = 'form' | 'submitted' | 'processing' | 'review' | 'saving' | 'completed';

const SurveyResponse = ({ surveyId, isSlug }: SurveyResponseProps) => {
  const { id, slug } = useParams<{ id: string; slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [submissionStep, setSubmissionStep] = useState<SubmissionStep>('form');
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const findAlternativeSurvey = async (businessId: string, originalTitle: string) => {
    try {
      console.log('🔍 Looking for alternative survey for business:', businessId, 'with title:', originalTitle);
      const result = await fetchSurveysForBusiness(businessId);
      
      if (result.success && result.data && result.data.length > 0) {
        console.log('📋 Found surveys for business:', result.data.map(s => ({ id: s.id, title: s.title, responses: s.response_count })));
        
        // Find a survey with the same title that has questions
        const alternativeSurvey = result.data.find(s => 
          s.title === originalTitle && s.response_count > 0
        );
        
        if (alternativeSurvey) {
          console.log('✅ Found exact title match with responses:', alternativeSurvey.id);
          return alternativeSurvey.id;
        }
        
        // If no exact match, get the first survey with responses
        const surveyWithResponses = result.data.find(s => s.response_count > 0);
        if (surveyWithResponses) {
          console.log('✅ Found alternative survey with responses:', surveyWithResponses.id);
          return surveyWithResponses.id;
        }
        
        console.log('⚠️ No surveys found with responses, trying first available survey');
        if (result.data.length > 0) {
          return result.data[0].id;
        }
      } else {
        console.log('❌ No surveys found for business or fetch failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Error finding alternative survey:', error);
    }
    
    return null;
  };

  useEffect(() => {
    const loadSurvey = async () => {
      const targetId = surveyId || id || slug;
      
      if (!targetId) {
        console.error('❌ No survey identifier provided');
        setError('No survey identifier provided');
        setDebugInfo('No survey ID found in URL parameters');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setDebugInfo(`Attempting to load survey: ${targetId}`);
        console.log('🚀 Starting to load survey with identifier:', targetId);
        
        let result;
        // Check if it's a UUID format (survey ID) or a slug
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const isUuid = uuidPattern.test(targetId);
        
        console.log('🔍 Identifier type:', isUuid ? 'UUID' : 'Slug', '| isSlug prop:', isSlug);
        setDebugInfo(prev => prev + `\nIdentifier type: ${isUuid ? 'UUID' : 'Slug'}`);
        
        // Try UUID first since most links use UUIDs
        if (isUuid) {
          console.log('📡 Attempting to fetch by ID:', targetId);
          setDebugInfo(prev => prev + `\nTrying to fetch by ID: ${targetId}`);
          result = await fetchSurveyById(targetId);
          
          // If ID fetch fails, don't try slug since UUIDs aren't slugs
          if (!result.success) {
            console.log('❌ Survey ID not found in database:', targetId);
            setDebugInfo(prev => prev + `\nSurvey ID ${targetId} not found in database`);
            
            // Check if there are any surveys in the database at all
            console.log('🔍 Checking for any existing surveys...');
            setDebugInfo(prev => prev + `\nChecking for existing surveys...`);
            
            // This will help debug if the database is empty or has connection issues
            throw new Error(`Survey with ID "${targetId}" does not exist in the database. Please check if the survey was created or use a valid survey ID.`);
          }
        } else {
          console.log('📡 Attempting to fetch by slug:', targetId);
          setDebugInfo(prev => prev + `\nTrying to fetch by slug: ${targetId}`);
          result = await fetchSurveyBySlug(targetId);
          
          // If slug fetch fails, try as ID
          if (!result.success) {
            console.log('📡 Slug fetch failed, trying as ID:', targetId);
            setDebugInfo(prev => prev + `\nSlug fetch failed, trying as ID`);
            result = await fetchSurveyById(targetId);
          }
        }
        
        console.log('📊 Survey fetch result:', result);
        setDebugInfo(prev => prev + `\nFetch result: ${result.success ? 'Success' : 'Failed'}`);
        
        if (result.success && result.data) {
          console.log('📋 Survey data received:', {
            id: result.data.id,
            title: result.data.title,
            businessId: result.data.business_id,
            questionsCount: result.data.questions ? result.data.questions.length : 0
          });
          
          setDebugInfo(prev => prev + `\nSurvey found: ${result.data.title} (${result.data.questions?.length || 0} questions)`);
          
          // Check if the survey has questions
          if (!result.data.questions || result.data.questions.length === 0) {
            console.log('⚠️ Survey has no questions, looking for alternative...');
            setDebugInfo(prev => prev + `\nSurvey has no questions, looking for alternatives...`);
            
            if (result.data.business_id) {
              const alternativeId = await findAlternativeSurvey(result.data.business_id, result.data.title);
              
              if (alternativeId && alternativeId !== targetId) {
                console.log('🔄 Redirecting to alternative survey:', alternativeId);
                setDebugInfo(prev => prev + `\nRedirecting to alternative survey: ${alternativeId}`);
                navigate(`/survey/${alternativeId}`, { replace: true });
                return;
              }
            }
            
            console.log('❌ No alternative survey found');
            setDebugInfo(prev => prev + `\nNo alternative survey found`);
            setError('This survey doesn\'t have any questions yet or may be incomplete.');
          } else {
            console.log('✅ Survey loaded successfully with', result.data.questions.length, 'questions');
            setDebugInfo(prev => prev + `\nSurvey loaded successfully!`);
            setSurvey(result.data);
            setError(null);
          }
        } else {
          console.error('❌ Failed to load survey:', result.error);
          const errorMsg = `Survey not found: "${targetId}". ${result.error || 'This survey may have been deleted or the ID is incorrect.'}`;
          setDebugInfo(prev => prev + `\nError: ${errorMsg}`);
          setError(errorMsg);
        }
      } catch (err: any) {
        console.error('💥 Error loading survey:', err);
        const errorMsg = err.message || 'Network error or survey does not exist';
        setDebugInfo(prev => prev + `\nException: ${errorMsg}`);
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    loadSurvey();
  }, [slug, id, surveyId, isSlug, navigate]);

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

    // Step 1: Show "Survey submitted"
    setSubmissionStep('submitted');
    
    // Step 2: After 1.5 seconds, show "Survey is in process and reviewing"
    setTimeout(() => {
      setSubmissionStep('processing');
    }, 1500);

    // Step 3: After another 2 seconds, show the review with answers
    setTimeout(() => {
      setSubmissionStep('review');
    }, 3500);
  };

  const saveToDatabase = async () => {
    if (!survey) return false;

    try {
      setSubmissionStep('saving');
      
      console.log('Saving survey response to database:', { surveyId: survey.id, answers });
      
      // Structure data for better SQL analysis
      const structuredSubmissionData = {
        survey_id: survey.id,
        survey_title: survey.title,
        business_id: survey.business_id,
        questions_and_answers: survey.questions.map(question => ({
          question_id: question.id,
          question_text: question.question_text,
          question_type: question.question_type,
          question_order: question.order_index || 0,
          answer: answers[question.id] || null,
          options: question.options || null
        })),
        submission_metadata: {
          total_questions: survey.questions.length,
          answered_questions: Object.keys(answers).length,
          completion_rate: Math.round((Object.keys(answers).length / survey.questions.length) * 100),
          submitted_at: new Date().toISOString(),
          session_id: 'session_' + Date.now(),
          user_agent: navigator.userAgent
        }
      };
      
      // Save to the survey submissions table (simplified)
      const result = await saveSurveySubmission(survey.id, structuredSubmissionData, {
        sessionId: 'session_' + Date.now(),
        userAgent: navigator.userAgent
      });
      
      if (result.success) {
        console.log('Survey response saved successfully:', result.responseId);
        toast({
          title: "Survey Saved!",
          description: "Your responses have been saved to the database.",
        });

        // Also save to survey_responses table for backward compatibility
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          await supabase
            .from('survey_responses')
            .insert([{
              survey_id: survey.id,
              responses: structuredSubmissionData,
              user_id: null // Allow anonymous responses
            }]);
        } catch (backupError) {
          console.warn('Backup save failed:', backupError);
        }
        
        return true;
      } else {
        console.error('Failed to save survey response:', result.error);
        toast({
          title: "Save Error",
          description: result.error || "Failed to save survey response.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error saving survey response:', error);
      toast({
        title: "Save Error",
        description: "Failed to save survey response. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const triggerWebhook = async () => {
    if (!survey) return;

    // First save to database
    const saveSuccess = await saveToDatabase();
    if (!saveSuccess) {
      setSubmissionStep('review'); // Go back to review step on save failure
      return;
    }

    try {
      console.log('Triggering webhook with survey data:', { surveyId: survey.id, answers });
      
      const webhookUrl = 'https://clariquest.app.n8n.cloud/webhook-test/e14fdeac-f48b-44e6-96cd-2d946bb6d47d';
      
      // Prepare data with questions and answers combined
      const submissionData = {
        surveyId: survey.id,
        surveyTitle: survey.title,
        businessId: survey.business_id,
        questionsAndAnswers: survey.questions.map(question => ({
          questionId: question.id,
          questionText: question.question_text,
          questionType: question.question_type,
          answer: answers[question.id] || 'No answer provided'
        })),
        timestamp: new Date().toISOString(),
        sessionId: 'session_' + Date.now()
      };

      const params = new URLSearchParams();
      params.append('surveyData', JSON.stringify(submissionData));

      const finalUrl = `${webhookUrl}?${params.toString()}`;
      console.log('Sending GET request to webhook:', finalUrl);

      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        console.log('Webhook triggered successfully');
        toast({
          title: "Survey Processed!",
          description: "Thank you for your feedback. Your responses have been processed and saved.",
        });
        
        setSubmissionStep('completed');
        
        // Navigate to results page after a short delay
        setTimeout(() => {
          navigate(`/survey/results/${survey.id}`);
        }, 2000);
      } else {
        console.error('Webhook failed with status:', response.status);
        toast({
          title: "Processing Error",
          description: "Survey was saved but processing failed. You can still view results.",
          variant: "destructive",
        });
        
        // Still navigate to results since we saved the data
        setTimeout(() => {
          navigate(`/survey/results/${survey.id}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error triggering webhook:', error);
      toast({
        title: "Processing Error",
        description: "Survey was saved but processing failed. You can still view results.",
        variant: "destructive",
      });
      
      // Still navigate to results since we saved the data
      setTimeout(() => {
        navigate(`/survey/results/${survey.id}`);
      }, 2000);
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-clari-gold mx-auto mb-4"></div>
          <p className="text-clari-muted text-lg">Loading survey...</p>
          <p className="text-clari-muted text-sm mt-2">Please wait while we fetch your survey</p>
          {debugInfo && (
            <div className="mt-4 p-3 bg-clari-darkCard rounded-lg text-left text-xs text-clari-muted max-w-md">
              <p className="font-medium mb-2">Debug Info:</p>
              <pre className="whitespace-pre-line">{debugInfo}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clari-darkBg to-clari-darkCard">
        <Card className="w-full max-w-2xl bg-clari-darkCard border-clari-darkAccent">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-400" />
            </div>
            <CardTitle className="text-clari-text">Survey Not Found</CardTitle>
            <CardDescription className="text-clari-muted">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {debugInfo && (
              <div className="p-4 bg-clari-darkBg/50 rounded-lg text-left text-sm text-clari-muted border">
                <p className="font-medium mb-2">Technical Details:</p>
                <pre className="whitespace-pre-line">{debugInfo}</pre>
              </div>
            )}
            <div className="bg-yellow-900/20 border border-yellow-600/20 rounded-lg p-4 text-left">
              <h3 className="font-medium text-yellow-400 mb-2">💡 Possible Solutions:</h3>
              <ul className="text-yellow-300 text-sm space-y-1">
                <li>• Check if the survey ID is correct</li>
                <li>• Verify the survey exists in your database</li>
                <li>• Make sure you're using the correct URL</li>
                <li>• Try creating a new survey if this one was deleted</li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-clari-gold text-black hover:bg-clari-gold/90"
              >
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="border-clari-gold text-clari-gold hover:bg-clari-gold hover:text-black"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!survey || !survey.questions || survey.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clari-darkBg to-clari-darkCard">
        <Card className="w-full max-w-md bg-clari-darkCard border-clari-darkAccent">
          <CardHeader className="text-center">
            <CardTitle className="text-clari-text">Survey Empty</CardTitle>
            <CardDescription className="text-clari-muted">
              This survey doesn't have any questions yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => navigate('/')} 
                className="bg-clari-gold text-black hover:bg-clari-gold/90"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Submission flow states
  if (submissionStep === 'submitted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-clari-darkBg to-clari-darkCard flex items-center justify-center">
        <Card className="w-full max-w-md bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-clari-gold mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-clari-text">Survey Submitted!</h2>
            <p className="text-clari-muted">Thank you for your responses.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submissionStep === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-clari-darkBg to-clari-darkCard flex items-center justify-center">
        <Card className="w-full max-w-md bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-8 text-center">
            <Clock className="mx-auto h-16 w-16 text-clari-gold mb-4 animate-spin" />
            <h2 className="text-2xl font-bold mb-2 text-clari-text">Survey is in Process</h2>
            <p className="text-clari-muted">We are reviewing your responses...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submissionStep === 'review') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-clari-darkBg to-clari-darkCard">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="mb-8 bg-clari-darkCard border-clari-darkAccent">
              <CardHeader className="text-center">
                <CardTitle className="text-clari-text">Review Your Responses</CardTitle>
                <CardDescription className="text-clari-muted">
                  Please review your answers before final submission
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {survey?.questions.map((question, index) => (
                  <div key={question.id} className="border border-clari-darkAccent rounded-lg p-4">
                    <h3 className="text-lg font-medium text-clari-text mb-2">
                      Question {index + 1}: {question.question_text}
                    </h3>
                    <div className="bg-clari-darkBg/50 p-3 rounded border-l-4 border-l-clari-gold">
                      <p className="text-clari-muted">
                        <strong>Your answer:</strong> {answers[question.id] || 'No answer provided'}
                      </p>
                    </div>
                  </div>
                ))}
                
                <div className="text-center pt-6">
                  <Button 
                    onClick={triggerWebhook}
                    className="bg-clari-gold text-black hover:bg-clari-gold/90"
                  >
                    Submit Final Answers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (submissionStep === 'saving') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-clari-darkBg to-clari-darkCard flex items-center justify-center">
        <Card className="w-full max-w-md bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-clari-gold mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2 text-clari-text">Saving Your Responses</h2>
            <p className="text-clari-muted">Please wait while we save your answers...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submissionStep === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-clari-darkBg to-clari-darkCard flex items-center justify-center">
        <Card className="w-full max-w-md bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-clari-gold mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-clari-text">All Done!</h2>
            <p className="text-clari-muted mb-4">Your survey has been successfully saved and processed.</p>
            <Button 
              onClick={() => navigate(`/survey/results/${survey?.id}`)}
              className="bg-clari-gold text-black hover:bg-clari-gold/90"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              View Results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Regular form display
  const currentQuestion = survey?.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === survey?.questions.length - 1;
  const currentAnswer = answers[currentQuestion?.id];
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
            <h1 className="text-3xl font-bold mb-2 text-clari-text">{survey?.title}</h1>
            {survey?.description && (
              <p className="text-clari-muted">{survey.description}</p>
            )}
          </div>

          <SurveyProgress 
            currentQuestion={currentQuestionIndex + 1} 
            totalQuestions={survey?.questions.length || 0}
          />

          <Card className="mb-8 bg-clari-darkCard border-clari-darkAccent">
            <CardContent className="p-8">
              {currentQuestion && (
                <SurveyQuestion
                  question={currentQuestion}
                  value={currentAnswer}
                  onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                />
              )}
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
                disabled={!canProceed}
                className="bg-clari-gold text-black hover:bg-clari-gold/90"
              >
                Submit Survey
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
