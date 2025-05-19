
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SurveyShare from "./SurveyShare";
import SurveyResults from "./SurveyResults";
import SurveyQuestion from "./SurveyQuestion";
import { useQuery } from "@tanstack/react-query";
import { fetchSurveyById } from "@/utils/supabaseHelpers";
import { SurveyQuestion as SurveyQuestionType } from "@/utils/sampleSurveyData";

interface SurveyFullViewProps {
  surveyId: string;
}

const SurveyFullView = ({ surveyId }: SurveyFullViewProps) => {
  // Fetch survey data
  const { data: survey, isLoading, error } = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: () => fetchSurveyById(surveyId)
  });

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto p-4">
        <Card>
          <CardContent className="p-8">
            <div className="flex justify-center items-center h-40">
              <p>Loading survey...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="container max-w-6xl mx-auto p-4">
        <Card>
          <CardContent className="p-8">
            <div className="flex justify-center items-center h-40">
              <p className="text-destructive">Error loading survey</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{survey.title}</CardTitle>
            <CardDescription>{survey.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(survey.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className={`px-2 py-1 rounded text-xs ${
                  survey.is_active 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {survey.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="share">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="share">Share</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="share">
          <SurveyShare surveyId={surveyId} />
        </TabsContent>
        
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Survey Preview</CardTitle>
              <CardDescription>
                Preview how your survey looks to respondents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {survey.questions.map((question: SurveyQuestionType) => (
                  <SurveyQuestion 
                    key={question.id}
                    question={question}
                    onAnswerChange={() => {}}
                    preview={true}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results">
          <SurveyResults surveyId={surveyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SurveyFullView;
