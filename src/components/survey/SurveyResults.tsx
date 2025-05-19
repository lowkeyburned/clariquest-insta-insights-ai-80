
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { fetchSurveyById } from '@/utils/supabase';
import { fetchSurveyResponsesByQuestionId } from '@/utils/supabase/surveyResponseHelpers';
import { useQuery } from '@tanstack/react-query';

interface SurveyResultsProps {
  surveyId: string;
}

// Define a union type of all possible question types
type QuestionType = "multiple_choice" | "open_ended" | "slider" | "likert" | "single_choice";

const SurveyResults = ({ surveyId }: SurveyResultsProps) => {
  // Fetch survey data
  const { data: survey, isLoading } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: () => fetchSurveyById(surveyId),
    enabled: !!surveyId
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
          // Using toString() to ensure we're passing a string to the function
          const { data } = await fetchSurveyResponsesByQuestionId(questionId.toString());
          responses[questionId] = data || [];
        }
        setQuestionResponses(responses);
      }
    };

    loadResponses();
  }, [survey]);

  // Process data for single choice and multiple choice questions
  const processChoiceQuestionData = (responses: any[]) => {
    const counts: { [key: string]: number } = {};
    responses.forEach(response => {
      const answer = response.answer_value;
      
      // Handle both single values and arrays
      if (answer && answer.values && Array.isArray(answer.values)) {
        // For multiple choice, each option gets a separate count
        answer.values.forEach((value: string) => {
          counts[value] = (counts[value] || 0) + 1;
        });
      } else if (answer && answer.value) {
        // For single choice
        counts[answer.value] = (counts[answer.value] || 0) + 1;
      }
    });

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key],
    }));
  };
  
  // Process data for Likert scale questions
  const processLikertData = (responses: any[]) => {
    // Map to track counts for each score (1-5)
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    responses.forEach(response => {
      const value = response.answer_value?.value;
      if (value && !isNaN(parseInt(value))) {
        const score = parseInt(value);
        if (score >= 1 && score <= 5) {
          counts[score as keyof typeof counts] += 1;
        }
      }
    });
    
    return Object.entries(counts).map(([score, count]) => ({
      name: score === '1' ? 'Strongly Disagree' :
            score === '2' ? 'Disagree' :
            score === '3' ? 'Neutral' :
            score === '4' ? 'Agree' : 'Strongly Agree',
      value: count,
      score: parseInt(score)
    }));
  };
  
  // Process data for slider questions
  const processSliderData = (responses: any[]) => {
    const counts: { [key: string]: number } = {};
    
    responses.forEach(response => {
      const value = response.answer_value?.value;
      if (value && !isNaN(parseInt(value))) {
        const score = parseInt(value);
        counts[score] = (counts[score] || 0) + 1;
      }
    });
    
    return Object.entries(counts).map(([score, count]) => ({
      score: parseInt(score),
      count
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

  // Display open-ended responses
  const renderOpenEndedResponses = (responses: any[]) => {
    if (!responses.length) return <p>No responses yet</p>;
    
    return (
      <div className="space-y-3 mt-4">
        {responses.map((response, index) => (
          <div key={index} className="p-3 bg-clari-darkBg rounded-md">
            <p className="text-sm text-clari-text">
              "{response.answer_value?.value || "No answer provided"}"
            </p>
          </div>
        ))}
      </div>
    );
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

  return (
    <div className="p-8">
      <Card className="mb-8 bg-clari-darkCard border-clari-darkAccent">
        <CardHeader>
          <CardTitle>{survey.title} Results</CardTitle>
          <CardDescription>Here are the results for the survey: {survey.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {survey.questions && survey.questions.map((question) => {
            const responses = questionResponses[question.id] || [];
            if (responses.length === 0) {
              return (
                <div key={question.id} className="mb-6 p-4 border border-clari-darkAccent rounded-md">
                  <h3 className="text-xl font-semibold mb-2">{question.text}</h3>
                  <p className="text-clari-muted">No responses yet for this question.</p>
                </div>
              );
            }

            let data;
            let chartType;
            let chartTitle;
            let content;

            const questionType = question.type as QuestionType;

            switch (questionType) {
              case "single_choice":
                data = processChoiceQuestionData(responses);
                chartType = 'pie';
                chartTitle = 'Response Distribution';
                break;
                
              case "multiple_choice":
                data = processChoiceQuestionData(responses);
                chartType = 'bar';
                chartTitle = 'Response Distribution';
                break;
                
              case "likert":
                data = processLikertData(responses);
                chartType = 'bar';
                chartTitle = 'Agreement Distribution';
                data.sort((a, b) => a.score - b.score); // Sort by score for proper display
                break;
                
              case "slider":
                data = processSliderData(responses);
                chartType = 'bar';
                chartTitle = 'Score Distribution';
                data.sort((a, b) => a.score - b.score); // Sort by score
                break;
                
              case "open_ended":
                chartType = 'none';
                content = renderOpenEndedResponses(responses);
                break;
                
              default:
                return (
                  <div key={question.id} className="mb-6 p-4 border border-clari-darkAccent rounded-md">
                    <h3 className="text-xl font-semibold mb-2">{question.text}</h3>
                    <p className="text-clari-muted">Unsupported question type: {questionType}</p>
                  </div>
                );
            }

            return (
              <div key={question.id} className="mb-6 p-4 border border-clari-darkAccent rounded-md">
                <h3 className="text-xl font-semibold mb-2">{question.text}</h3>
                <p className="text-sm text-clari-muted mb-4">{chartTitle || "Responses"}</p>
                
                {chartType === 'pie' && data && data.length > 0 && (
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
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
                
                {chartType === 'bar' && data && data.length > 0 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={questionType === "likert" ? "name" : "score"} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey={questionType === "multiple_choice" ? "value" : "count"} 
                        fill="#82ca9d"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                
                {chartType === 'none' && content}
              </div>
            );
          })}
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link to={`/survey/${surveyId}`}>View Survey</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SurveyResults;
