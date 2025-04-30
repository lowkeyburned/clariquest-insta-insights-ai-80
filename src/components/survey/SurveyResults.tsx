
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { getSurveyById, SurveyData } from "@/utils/sampleSurveyData";
import { getSurveyResponses, SurveyResponse, formatResponseForDisplay } from "@/utils/surveyResponseUtils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SurveyResultsProps {
  surveyId: string;
}

const SurveyResults = ({ surveyId }: SurveyResultsProps) => {
  const navigate = useNavigate();
  const [surveyData, setSurveyData] = useState<SurveyData | undefined>(undefined);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);

  useEffect(() => {
    // Get survey data
    const survey = getSurveyById(surveyId);
    setSurveyData(survey);
    
    // Get survey responses
    const surveyResponses = getSurveyResponses(surveyId);
    setResponses(surveyResponses);
    
    // Select first response by default if available
    if (surveyResponses.length > 0) {
      setSelectedResponse(surveyResponses[0].id);
    }
  }, [surveyId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!surveyData) {
    return (
      <div className="min-h-screen bg-clari-darkBg text-clari-text p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardContent className="p-6">
              <Button 
                variant="outline" 
                className="mb-4" 
                onClick={handleGoBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <p>Survey not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const selectedResponseData = responses.find(r => r.id === selectedResponse);
  const formattedResponse = selectedResponseData 
    ? formatResponseForDisplay(selectedResponseData, surveyData) 
    : {};

  return (
    <div className="min-h-screen bg-clari-darkBg text-clari-text p-6">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="outline" 
          className="mb-4" 
          onClick={handleGoBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="bg-clari-darkCard border-clari-darkAccent mb-6">
          <CardHeader>
            <CardTitle>{surveyData.title} - Results</CardTitle>
            <p className="text-sm text-clari-muted mt-2">
              {surveyData.businessName} • {responses.length} responses received
            </p>
          </CardHeader>
        </Card>

        {responses.length === 0 ? (
          <Card className="bg-clari-darkCard border-clari-darkAccent p-6 text-center">
            <p>No responses yet for this survey.</p>
          </Card>
        ) : (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="individual">Individual Responses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4">
              <Card className="bg-clari-darkCard border-clari-darkAccent">
                <CardHeader>
                  <CardTitle>Response Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Total responses: {responses.length}</p>
                  {/* In a real app, you would add charts and statistics here */}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="individual">
              <Card className="bg-clari-darkCard border-clari-darkAccent">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Individual Responses</CardTitle>
                    <select 
                      value={selectedResponse || ""} 
                      onChange={(e) => setSelectedResponse(e.target.value)}
                      className="bg-clari-darkBg text-clari-text border border-clari-darkAccent rounded px-2 py-1"
                    >
                      {responses.map((response, index) => (
                        <option key={response.id} value={response.id}>
                          Response #{index + 1} - {new Date(response.submittedAt).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedResponseData && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Question</TableHead>
                          <TableHead>Answer</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(formattedResponse).map(([questionId, data]) => (
                          <TableRow key={questionId}>
                            <TableCell>{data.question}</TableCell>
                            <TableCell>{data.answer.toString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default SurveyResults;
