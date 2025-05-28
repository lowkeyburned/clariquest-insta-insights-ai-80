
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SurveyQuestion } from "@/utils/types/database";
import SurveyDetails from "./creator/SurveyDetails";
import QuestionForm from "./creator/QuestionForm";
import QuestionPreview from "./creator/QuestionPreview";
import { useSurveyCreate } from "./creator/useSurveyCreate";
import { useParams } from "react-router-dom";

const SurveyCreator = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  
  const { businessId } = useParams<{ businessId: string }>();
  const { createSurveyWithQuestions, isSubmitting, error } = useSurveyCreate();

  const handleAddQuestion = (question: Omit<SurveyQuestion, "id" | "survey_id" | "created_at" | "updated_at">) => {
    // Generate a temporary ID for the question
    const newQuestion: SurveyQuestion = {
      ...question,
      id: `temp-${Date.now()}`,
      survey_id: "", // Will be set when survey is created
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (indexToRemove: number) => {
    setQuestions(questions.filter((_, index) => index !== indexToRemove));
  };

  const handleCreateSurvey = async () => {
    if (!businessId) {
      console.error("Business ID is required");
      return;
    }

    await createSurveyWithQuestions({
      title,
      description,
      businessId,
      questions
    });
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

            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleCreateSurvey}
              className="w-full" 
              disabled={isSubmitting || !title.trim() || !businessId}
            >
              {isSubmitting ? "Creating Survey..." : "Create Survey"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SurveyCreator;
