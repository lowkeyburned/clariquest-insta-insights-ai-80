import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart
} from 'recharts';
import { fetchSurveyById, fetchSurveyResponsesByQuestionId } from '@/utils/supabase';
import { useQuery } from '@tanstack/react-query';

const SurveyResults = () => {
  const { id } = useParams<{ id: string }>();
  
  // Fetch survey data
  const { data: survey, isLoading } = useQuery({
    queryKey: ['survey', id],
    queryFn: () => fetchSurveyById(id as string),
    enabled: !!id
  });

  const [questionResponses, setQuestionResponses] = useState<{
    [questionId: string]: any[];
  }>({});

  useEffect(() => {
    const loadResponses = async () => {
      if (survey && survey.questions) {
        const responses: { [questionId: string]: any[] } = {};
        for (const question of survey.questions) {
          const questionId = question.id;
          const { data } = await fetchSurveyResponsesByQuestionId(questionId);
          responses[questionId] = data || [];
        }
        setQuestionResponses(responses);
      }
    };

    loadResponses();
  }, [survey]);

  const processMultipleChoiceData = (responses: any[]) => {
    const counts: { [key: string]: number } = {};
    responses.forEach(response => {
      const value = response.value;
      counts[value] = (counts[value] || 0) + 1;
    });

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key],
    }));
  };
  
  const generateColors = (numColors: number) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
      // Generate a hue value between 0 and 360
      const hue = Math.round((360 / numColors) * i);
      // Convert HSL to RGB (or hex if you prefer)
      const color = `hsl(${hue}, 70%, 50%)`; // Adjust saturation and lightness as needed
      colors.push(color);
    }
    return colors;
  };

  // If survey is still loading, show loading state
  if (isLoading) {
    return <div className="p-8">Loading survey results...</div>;
  }

  // If survey data is not available, show error state
  if (!survey) {
    return (
      <div className="p-8">
        <p>Survey not found or you don't have access to view these results.</p>
        <Button asChild className="mt-4">
          <Link to="/businesses">Return to Businesses</Link>
        </Button>
      </div>
    );
  }

  const getScoreData = (responses: any[]) => {
    // Assuming responses is an array of objects and each object has a value property
    return responses.map(response => {
      return {
        score: typeof response.value === 'string' ? parseInt(response.value, 10) : response.value,
        count: 1
      };
    });
  };

  return (
    <div className="p-8">
      <Card className="mb-8 bg-clari-darkCard border-clari-darkAccent">
        <CardHeader>
          <CardTitle>{survey.name} Results</CardTitle>
          <CardDescription>Here are the results for the survey: {survey.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {survey.questions && survey.questions.map((question) => {
            const responses = questionResponses[question.id] || [];

            let data;
            let chartType;
            let chartTitle;

            switch (question.type) {
              case 'multiple_choice':
                data = processMultipleChoiceData(responses);
                chartType = 'pie';
                chartTitle = 'Response Distribution';
                break;
              case 'score':
                data = getScoreData(responses);
                chartType = 'bar';
                chartTitle = 'Score Distribution';
                break;
              default:
                return (
                  <div key={question.id} className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">{question.text}</h3>
                    <p>Unsupported question type.</p>
                  </div>
                );
            }

            if (!data || data.length === 0) {
              return (
                <div key={question.id} className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">{question.text}</h3>
                  <p>No responses yet for this question.</p>
                </div>
              );
            }

            return (
              <div key={question.id} className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{question.text}</h3>
                {chartType === 'pie' && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        isAnimationActive={false}
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {
                          data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={generateColors(data.length)[index % data.length]} />
                          ))
                        }
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {chartType === 'bar' && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="score" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            );
          })}
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link to={`/survey/${id}`}>View Survey</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SurveyResults;
