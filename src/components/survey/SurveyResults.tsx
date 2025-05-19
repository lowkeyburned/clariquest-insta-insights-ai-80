import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { fetchSurveyById, fetchSurveyResponses } from '@/utils/supabase';
import { Survey } from '@/utils/sampleSurveyData';

interface SurveyResultsProps {
  surveyId: string;
}

const SurveyResultsComponent: React.FC<SurveyResultsProps> = ({ surveyId }) => {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const surveyData = await fetchSurveyById(surveyId);
        if (surveyData) {
          setSurvey(surveyData);
        } else {
          setError("Survey not found");
        }

        const surveyResponses = await fetchSurveyResponses(surveyId);
        setResponses(surveyResponses);
      } catch (e: any) {
        setError(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [surveyId]);

  if (loading) {
    return <Card><CardContent>Loading survey results...</CardContent></Card>;
  }

  if (error) {
    return <Card><CardContent>Error: {error}</CardContent></Card>;
  }

  if (!survey) {
    return <Card><CardContent>Survey not found.</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Survey Results: {survey.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {responses.length === 0 ? (
          <div>No responses yet.</div>
        ) : (
          <ul>
            {responses.map((response, index) => (
              <li key={index}>
                Response {index + 1}:
                <pre>{JSON.stringify(response.answers, null, 2)}</pre>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default SurveyResultsComponent;

