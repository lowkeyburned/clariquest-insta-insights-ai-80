import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchSurveyById, fetchSurveyResponses } from '@/utils/supabase/database';
import { SurveyWithQuestions, SurveyQuestion } from '@/utils/types/database';

interface SurveyResultsProps {
  surveyId: string;
}

const SurveyResultsComponent: React.FC<SurveyResultsProps> = ({ surveyId }) => {
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<SurveyWithQuestions | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const surveyResult = await fetchSurveyById(surveyId);
        if (surveyResult && surveyResult.questions) {
          // Sort questions by order_index
          surveyResult.questions.sort((a: SurveyQuestion, b: SurveyQuestion) => (a.order_index || 0) - (b.order_index || 0));
          setSurvey(surveyResult as SurveyWithQuestions);
        } else {
          setError("Survey not found");
        }

        const responsesResult = await fetchSurveyResponses(surveyId);
        if (responsesResult && responsesResult.success && responsesResult.data) {
          setResponses(responsesResult.data);
        } else {
          setError("Failed to load responses");
        }
      } catch (e: any) {
        setError(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [surveyId]);

  const aggregateResponses = (question: SurveyQuestion, allResponses: any[]) => {
    const questionResponses = allResponses
      .map(response => response.responses[question.id])
      .filter(answer => answer !== undefined && answer !== null);

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
      if (typeof answer === 'object' && answer.value) {
        value = answer.value;
      } else if (typeof answer === 'object' && answer.values) {
        // Handle multiple choice
        answer.values.forEach((v: string) => {
          counts[v] = (counts[v] || 0) + 1;
        });
        return;
      }
      
      if (typeof value === 'string') {
        counts[value] = (counts[value] || 0) + 1;
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

  if (!survey) {
    return (
      <div className="min-h-screen bg-clari-darkBg p-6">
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="text-clari-text">Survey not found.</div>
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

  return (
    <div className="min-h-screen bg-clari-darkBg p-6">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)} 
          className="mb-6 border-clari-gold text-clari-gold hover:bg-clari-gold hover:text-black"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="bg-clari-darkCard border-t-4 border-t-clari-gold">
          <CardHeader>
            <CardTitle className="text-clari-text">Survey Results: {survey.title}</CardTitle>
            <p className="text-clari-muted">Total Responses: {responses.length}</p>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-300 mb-4">No responses yet.</div>
                <Button 
                  onClick={() => navigate("/ai-insights")}
                  className="bg-clari-gold text-black hover:bg-clari-gold/90"
                >
                  Return to AI Insights
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {survey.questions.map((question: SurveyQuestion) => {
                  const aggregated = aggregateResponses(question, responses);
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
