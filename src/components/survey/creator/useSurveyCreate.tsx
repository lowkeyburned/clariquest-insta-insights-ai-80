
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSurvey } from '@/utils/supabase';
import { SurveyQuestion } from '@/utils/types/database';
import { supabase } from '@/integrations/supabase/client';

export interface SurveyFormData {
  title: string;
  description: string;
  businessId: string;
  questions: SurveyQuestion[];
}

export const useSurveyCreate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const createSurveyWithQuestions = async (formData: SurveyFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // Create the survey
      const surveyResult = await createSurvey({
        title: formData.title,
        description: formData.description,
        business_id: formData.businessId,
        created_by: user.user.id,
        is_active: true,
        slug: formData.title.toLowerCase().replace(/\s+/g, '-')
      });

      if (!surveyResult.success || !surveyResult.data) {
        throw new Error(surveyResult.error || 'Failed to create survey');
      }

      const survey = surveyResult.data;

      // Create questions
      if (formData.questions.length > 0) {
        const questionsData = formData.questions.map((question, index) => ({
          survey_id: survey.id,
          question_text: question.question_text,
          question_type: question.question_type,
          options: question.options,
          required: question.required || true,
          order_index: index
        }));

        const { error: questionsError } = await supabase
          .from('survey_questions')
          .insert(questionsData);

        if (questionsError) {
          throw new Error(`Failed to create questions: ${questionsError.message}`);
        }
      }

      // Navigate to the survey details page
      navigate(`/survey/${survey.id}`);
      
      return { success: true, data: survey };
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Survey creation error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createSurveyWithQuestions,
    isSubmitting,
    error,
    clearError: () => setError(null)
  };
};
