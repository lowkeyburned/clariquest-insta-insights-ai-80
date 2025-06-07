
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

      // Transform questions to match the expected type from sampleSurveyData
      const transformedQuestions = formData.questions.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: Array.isArray(q.options) ? q.options : undefined,
        min: q.question_type === 'slider' && typeof q.options === 'object' && q.options?.min ? parseInt(q.options.min.toString()) : undefined,
        max: q.question_type === 'slider' && typeof q.options === 'object' && q.options?.max ? parseInt(q.options.max.toString()) : undefined,
      }));

      // Create the survey - using the correct function signature
      const surveyResult = await createSurvey({
        title: formData.title,
        description: formData.description,
        businessId: formData.businessId
      }, transformedQuestions);

      if (!surveyResult || !surveyResult.id) {
        throw new Error('Failed to create survey');
      }

      // Navigate to the survey details page
      navigate(`/survey/${surveyResult.id}`);
      
      return { success: true, data: surveyResult };
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
