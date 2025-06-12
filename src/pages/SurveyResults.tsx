
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SurveyResult {
  title: string;
  questions: string[];
  responses: Array<{
    id: string;
    answers: string[];
    submitted_at: string;
  }>;
  responseCount: number;
}

const SurveyResultsPage = () => {
  const { code } = useParams<{ code: string }>();
  const { toast } = useToast();
  
  const [results, setResults] = useState<SurveyResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [code]);

  const loadResults = async () => {
    if (!code) return;

    try {
      // Load survey data
      const { data: surveyData, error: surveyError } = await supabase
        .from('instagram_surveys')
        .select('*')
        .eq('unique_code', code)
        .single();

      if (surveyError || !surveyData) {
        toast({
          title: "Survey Not Found",
          description: "This survey may have been removed",
          variant: "destructive",
        });
        return;
      }

      // Load responses
      const { data: responses, error: responsesError } = await supabase
        .from('instagram_survey_responses')
        .select('*')
        .eq('survey_code', code)
        .order('submitted_at', { ascending: false });

      if (responsesError) throw responsesError;

      setResults({
        title: surveyData.title,
        questions: surveyData.questions,
        responses: responses || [],
        responseCount: responses?.length || 0
      });
    } catch (error) {
      console.error('Error loading results:', error);
      toast({
        title: "Error",
        description: "Failed to load survey results",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!results) return;

    const headers = ['Response ID', 'Submitted At', ...results.questions];
    const rows = results.responses.map(response => [
      response.id,
      new Date(response.submitted_at).toLocaleString(),
      ...response.answers
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${results.title}-results.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Results exported to CSV file",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>Survey results not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{results.title}</h1>
          <p className="text-muted-foreground">{results.responseCount} responses</p>
        </div>
        <Button onClick={exportToCSV} disabled={results.responseCount === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {results.responseCount === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No responses yet. Share your survey link to start collecting data!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {results.questions.map((question, qIndex) => (
            <Card key={qIndex}>
              <CardHeader>
                <CardTitle className="text-lg">Question {qIndex + 1}: {question}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.responses.map((response, rIndex) => (
                    <div key={response.id} className="border-l-4 border-blue-200 pl-4 py-2">
                      <p className="text-sm text-muted-foreground mb-1">
                        Response {rIndex + 1} • {new Date(response.submitted_at).toLocaleString()}
                      </p>
                      <p className="text-sm">{response.answers[qIndex] || 'No answer'}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SurveyResultsPage;
