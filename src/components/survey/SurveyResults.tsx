
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchSurveyById, getSurveySubmissions, getSurveySubmissionStats } from '@/utils/supabase/database';
import { SurveyWithQuestions } from '@/utils/types/database';
import { SurveyQuestion as DatabaseSurveyQuestion } from '@/utils/types/database';

interface SurveyResultsProps {
  surveyId: string;
}

const SurveyResultsComponent: React.FC<SurveyResultsProps> = ({ surveyId }) => {
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionStats, setSubmissionStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Loading survey data for results:', surveyId);
        
        const surveyResult = await fetchSurveyById(surveyId);
        if (surveyResult && surveyResult.success && surveyResult.data) {
          // Sort questions by order_index
          if (surveyResult.data.questions) {
            surveyResult.data.questions.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));
          }
          setSurvey(surveyResult.data as SurveyWithQuestions);
          console.log('Survey loaded for results:', surveyResult.data);
        } else {
          setError("Survey not found");
        }

        // Load survey submissions
        const submissionsResult = await getSurveySubmissions(surveyId);
        if (submissionsResult && submissionsResult.success && submissionsResult.data) {
          setSubmissions(submissionsResult.data);
          console.log('Loaded submissions:', submissionsResult.data.length);
          
          // Get submission stats
          const statsResult = await getSurveySubmissionStats(surveyId);
          if (statsResult && statsResult.success) {
            setSubmissionStats(statsResult.data);
            console.log('Loaded submission stats:', statsResult.data);
          }
        }

      } catch (e: any) {
        console.error('Error loading survey results:', e);
        setError(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [surveyId]);

  const aggregateResponses = (question: DatabaseSurveyQuestion, allSubmissions: any[]) => {
    console.log('Aggregating responses for question:', question.id, 'from submissions:', allSubmissions.length);
    
    const questionResponses = allSubmissions
      .map(submission => {
        // Handle both old and new response formats
        const answers = submission.submission_data?.raw_answers || submission.raw_answers || submission.submission_data || submission.responses;
        const answer = answers?.[question.id];
        console.log('Question', question.id, 'answer from submission:', answer);
        return answer;
      })
      .filter(answer => answer !== undefined && answer !== null && answer !== '');

    console.log('Filtered responses for question', question.id, ':', questionResponses);

    if (questionResponses.length === 0) {
      return { type: 'empty', data: [] };
    }

    const questionType = question.question_type;

    if (questionType === 'text' || questionType === 'open_ended') {
      return {
        type: 'text',
        data: questionResponses.map(answer => 
          typeof answer === 'object' && answer.value ? answer.value : answer
        )
      };
    }

    // For choice-based questions, aggregate counts
    const counts: Record<string, number> = {};
    questionResponses.forEach(answer => {
      let value = answer;
      
      // Handle different answer formats
      if (typeof answer === 'object') {
        if (answer.value) {
          value = answer.value;
        } else if (answer.values && Array.isArray(answer.values)) {
          // Handle multiple choice with values array
          answer.values.forEach((v: string) => {
            counts[v] = (counts[v] || 0) + 1;
          });
          return;
        } else if (Array.isArray(answer)) {
          // Handle direct array format
          answer.forEach((v: string) => {
            counts[v] = (counts[v] || 0) + 1;
          });
          return;
        }
      }
      
      // Handle single value or string
      if (typeof value === 'string' || typeof value === 'number') {
        const stringValue = String(value);
        counts[stringValue] = (counts[stringValue] || 0) + 1;
      }
    });

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const data = Object.entries(counts).map(([option, count]) => ({
      option,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));

    return { type: 'chart', data };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-clari-darkBg p-6">
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-8">
            <div className="text-center text-clari-text">Loading survey results...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-clari-darkBg p-6">
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="text-red-400">Error: {error}</div>
              <Button 
                onClick={() => navigate("/")}
                className="bg-clari-gold text-black hover:bg-clari-gold/90"
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-clari-darkBg p-6">
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="text-clari-text">Survey not found.</div>
              <Button 
                onClick={() => navigate("/")}
                className="bg-clari-gold text-black hover:bg-clari-gold/90"
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalSubmissions = submissions.length;

  return (
    <div className="min-h-screen bg-clari-darkBg p-6">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')} 
          className="mb-6 border-clari-gold text-clari-gold hover:bg-clari-gold hover:text-black"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="bg-clari-darkCard border-t-4 border-t-clari-gold">
          <CardHeader>
            <CardTitle className="text-clari-text">Survey Results: {survey?.title}</CardTitle>
            <div className="flex items-center justify-between">
              <p className="text-clari-muted">Total Responses: {totalSubmissions}</p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-clari-gold text-clari-gold"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Submissions ({totalSubmissions})
                </Button>
              </div>
            </div>
            
            {/* Submission stats */}
            {submissionStats && (
              <div className="mt-4 p-4 bg-clari-darkBg/50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-clari-muted">Total Submissions:</span>
                    <span className="ml-2 text-clari-gold font-semibold">{submissionStats.totalSubmissions || 0}</span>
                  </div>
                  <div>
                    <span className="text-clari-muted">Latest Submission:</span>
                    <span className="ml-2 text-clari-gold font-semibold">
                      {submissionStats.latestSubmissionDate ? new Date(submissionStats.latestSubmissionDate).toLocaleDateString() : 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-clari-muted">Database Status:</span>
                    <span className="ml-2 text-green-500 font-semibold">Connected</span>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {totalSubmissions === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-300 mb-4">
                  No responses yet. Be the first to submit this survey!
                </div>
                <Button 
                  onClick={() => navigate(`/survey/${surveyId}`)}
                  className="bg-clari-gold text-black hover:bg-clari-gold/90"
                >
                  Take Survey
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {survey?.questions?.map((question: DatabaseSurveyQuestion) => {
                  const aggregated = aggregateResponses(question, submissions);
                  const questionText = question.question_text || "";
                  
                  return (
                    <div key={question.id} className="border border-clari-darkAccent rounded-lg p-4">
                      <h3 className="text-lg font-medium text-clari-text mb-4">{questionText}</h3>
                      
                      {aggregated.type === 'empty' && (
                        <p className="text-gray-400">No responses for this question</p>
                      )}
                      
                      {aggregated.type === 'text' && (
                        <div className="space-y-2">
                          {aggregated.data.map((response: string, index: number) => (
                            <div key={index} className="bg-clari-darkBg/50 p-3 rounded border-l-4 border-l-clari-gold">
                              <p className="text-gray-300">{response}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {aggregated.type === 'chart' && (
                        <div className="space-y-3">
                          {aggregated.data.map((item: any) => (
                            <div key={item.option} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-300">{item.option}</span>
                                <span className="text-clari-gold">{item.count} ({item.percentage}%)</span>
                              </div>
                              <div className="w-full bg-clari-darkAccent rounded-full h-2">
                                <div 
                                  className="bg-clari-gold h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${item.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SurveyResultsComponent;
