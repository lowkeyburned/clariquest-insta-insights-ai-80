
-- Create a table for storing survey response embeddings
CREATE TABLE IF NOT EXISTS public.survey_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  response_id UUID NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  embedding VECTOR(1536), -- OpenAI embedding dimension
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on survey_embeddings table
ALTER TABLE public.survey_embeddings ENABLE ROW LEVEL SECURITY;

-- Create policy for survey embeddings - users can only access embeddings for surveys they own
CREATE POLICY "Users can view embeddings for their surveys" 
  ON public.survey_embeddings 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE surveys.id = survey_embeddings.survey_id 
      AND surveys.created_by = auth.uid()
    )
  );

-- Create policy for inserting embeddings
CREATE POLICY "Users can create embeddings for their surveys" 
  ON public.survey_embeddings 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE surveys.id = survey_embeddings.survey_id 
      AND surveys.created_by = auth.uid()
    )
  );

-- Create policy for updating embeddings
CREATE POLICY "Users can update embeddings for their surveys" 
  ON public.survey_embeddings 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE surveys.id = survey_embeddings.survey_id 
      AND surveys.created_by = auth.uid()
    )
  );

-- Create policy for deleting embeddings
CREATE POLICY "Users can delete embeddings for their surveys" 
  ON public.survey_embeddings 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE surveys.id = survey_embeddings.survey_id 
      AND surveys.created_by = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_survey_embeddings_survey_id ON public.survey_embeddings(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_embeddings_response_id ON public.survey_embeddings(response_id);

-- Add a webhook_url column to surveys table for n8n integration
ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- Add embedding status to survey_responses
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS embedding_status TEXT DEFAULT 'pending';
ALTER TABLE public.survey_responses ADD COLUMN IF NOT EXISTS embedding_processed_at TIMESTAMP WITH TIME ZONE;
