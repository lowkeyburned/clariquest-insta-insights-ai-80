
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { fetchSurveyById, getSurveyResponses } from "@/utils/supabaseHelpers";
import { SurveyData } from "@/utils/sampleSurveyData";
import { formatResponseForDisplay } from "@/utils/surveyResponseUtils";
import { useQuery } from "@tanstack/react-query";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

interface SurveyResultsProps {
  surveyId: string;
}

const SurveyResults = ({ surveyId }: SurveyResultsProps) => {
  const [activeTab, setActiveTab] = useState("summary");
  
  // Fetch survey data
  const { data: survey, isLoading: surveyLoading } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: () => fetchSurveyById(surveyId)
  });
  
  // Fetch survey responses
  const { data: responses = [], isLoading: responsesLoading } = useQuery({
    queryKey: ['surveyResponses', surveyId],
    queryFn: () => getSurveyResponses(surveyId),
    enabled: !!survey
  });

  const isLoading = surveyLoading || responsesLoading;

  if (isLoading) {
    return <div>Loading survey results...</div>;
  }

  if (!survey) {
    return <div>Survey not found</div>;
  }

  const formatResults = () => {
    const results: Record<string, {
      questionText: string;
      questionType: string;
      responses: Record<string | number, number>;
      total: number;
    }> = {};

    survey.questions.forEach((question: any) => {
      results[question.id] = {
        questionText: question.text,
        questionType: question.type,
        responses: {},
        total: 0
      };
    });

    responses.forEach((response) => {
      Object.entries(response.answers).forEach(([questionId, answer]) => {
        const qId = questionId.toString();
        
        if (!results[qId]) return;

        const answerStr = answer.toString();
        
        if (!results[qId].responses[answerStr]) {
          results[qId].responses[answerStr] = 0;
        }
        
        results[qId].responses[answerStr]++;
        results[qId].total++;
      });
    });

    return results;
  };

  const results = formatResults();

  const chartData = (questionId: string) => {
    const question = results[questionId];
    if (!question) return [];
    
    return Object.entries(question.responses).map(([label, count]) => ({
      name: label,
      value: count
    }));
  };

  return (
    <div className="container max-w-6xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{survey.title} - Results</CardTitle>
          <CardDescription>
            Total Responses: {responses.length}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="individual">Individual Responses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {survey.questions.map((question: any, index: number) => (
              <Card key={question.id} className="overflow-hidden">
                <CardHeader className="bg-secondary/20">
                  <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                  <CardDescription className="text-base font-medium text-foreground">
                    {question.text}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {question.type === "multiple_choice" && (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={chartData(question.id.toString())}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData(question.id.toString()).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  
                  {question.type === "slider" && (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData(question.id.toString())}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  
                  {question.type === "open_ended" && (
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {responses.map((response, i) => {
                        const answer = response.answers[question.id];
                        if (!answer) return null;
                        return (
                          <div key={i} className="bg-secondary/10 p-3 rounded-md">
                            <p className="text-sm">{answer.toString()}</p>
                          </div>
                        );
                      })}
                      {responses.length === 0 && (
                        <p className="text-muted-foreground">No responses yet</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="individual">
          <div className="space-y-6">
            {responses.map((response, index) => {
              const formattedResponse = survey ? formatResponseForDisplay(response, survey as SurveyData) : {};
              
              return (
                <Card key={response.id} className="overflow-hidden">
                  <CardHeader className="bg-secondary/20">
                    <CardTitle className="text-lg">Response #{index + 1}</CardTitle>
                    <CardDescription>
                      Submitted: {new Date(response.submittedAt).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {Object.entries(formattedResponse).map(([questionIndex, { question, answer }]) => (
                        <div key={questionIndex} className="border-b pb-3">
                          <p className="font-medium">{question}</p>
                          <p className="mt-2 text-sm">{answer.toString()}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {responses.length === 0 && (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">No responses yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SurveyResults;
