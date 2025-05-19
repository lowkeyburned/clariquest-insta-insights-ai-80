
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SurveyQuestion } from "@/utils/sampleSurveyData";
import SurveyDetails from "./creator/SurveyDetails";
import QuestionForm from "./creator/QuestionForm";
import QuestionPreview from "./creator/QuestionPreview";
import { useSurveyCreate } from "./creator/useSurveyCreate";

const SurveyCreator = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  
  // Business ID is needed for creating surveys in Supabase
  // For demo purposes, we'll use a default ID or from URL params
  const params = new URLSearchParams(window.location.search);
  const businessId = params.get('businessId') || "00000000-0000-0000-0000-000000000000";

  const { handleSaveSurvey, isCreating } = useSurveyCreate(businessId);

  const handleAddQuestion = (question: Omit<SurveyQuestion, "id">) => {
    // Generate a temporary ID for the question
    const questionId = Date.now();
    setQuestions([...questions, { ...question, id: questionId }]);
  };

  const handleRemoveQuestion = (indexToRemove: number) => {
    setQuestions(questions.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="min-h-screen bg-clari-darkBg text-clari-text p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardHeader>
            <CardTitle>Create New Survey</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SurveyDetails
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
            />

            <QuestionForm addQuestion={handleAddQuestion} />

            <QuestionPreview 
              questions={questions}
              onRemoveQuestion={handleRemoveQuestion}
            />
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handleSaveSurvey(title, description, questions)} 
              className="w-full" 
              disabled={isCreating}
            >
              {isCreating ? "Creating Survey..." : "Create Survey"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SurveyCreator;
