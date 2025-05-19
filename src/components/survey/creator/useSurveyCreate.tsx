
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { createSurvey } from "@/utils/supabaseHelpers";
import { SurveyQuestion } from "@/utils/sampleSurveyData";
import { useAuth } from "./useAuth";

export const useSurveyCreate = (businessId: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkAuth } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  
  const handleSaveSurvey = async (title: string, description: string, questions: SurveyQuestion[]) => {
    // Check authentication first
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      return;
    }
    
    // Validate title and at least one question
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Survey title is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!questions.length) {
      toast({
        title: "Error",
        description: "Add at least one question to your survey",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Create survey in Supabase
      const surveyData = {
        title,
        description,
        businessId
      };
      
      const createdSurvey = await createSurvey(surveyData, questions);
      
      toast({
        title: "Survey Created",
        description: "Your survey has been created successfully!",
        duration: 5000,
      });
      
      // Navigate to the survey details page
      navigate(`/survey/results/${createdSurvey.id}`);
    } catch (error) {
      console.error("Error creating survey:", error);
      toast({
        title: "Error",
        description: `Failed to create survey: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return { handleSaveSurvey, isCreating };
};
