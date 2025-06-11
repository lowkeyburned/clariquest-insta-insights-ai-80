
-- Create a table for storing survey submissions with embeddings
CREATE TABLE IF NOT EXISTS public.survey_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  survey_title TEXT NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  submission_data JSONB NOT NULL, -- Stores questions and answers
  raw_answers JSONB NOT NULL, -- Stores just the answers for easy access
  embedding VECTOR(1536), -- OpenAI embedding for the responses
  embedding_metadata JSONB DEFAULT '{}',
  webhook_session_id TEXT, -- To track webhook sessions
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on survey submissions
ALTER TABLE public.survey_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for survey submissions - users can view submissions for surveys they own
CREATE POLICY "Users can view submissions for their surveys" 
  ON public.survey_submissions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE surveys.id = survey_submissions.survey_id 
      AND surveys.created_by = auth.uid()
    )
  );

-- Create policy for inserting submissions (allow webhook to insert)
CREATE POLICY "Allow inserting survey submissions" 
  ON public.survey_submissions 
  FOR INSERT 
  WITH CHECK (true); -- Allow webhook insertions

-- Create policy for updating submissions
CREATE POLICY "Users can update submissions for their surveys" 
  ON public.survey_submissions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE surveys.id = survey_submissions.survey_id 
      AND surveys.created_by = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_survey_submissions_survey_id ON public.survey_submissions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_submissions_business_id ON public.survey_submissions(business_id);
CREATE INDEX IF NOT EXISTS idx_survey_submissions_processed_at ON public.survey_submissions(processed_at);
CREATE INDEX IF NOT EXISTS idx_survey_submissions_session_id ON public.survey_submissions(webhook_session_id);

-- Create a function to get survey analysis data
CREATE OR REPLACE FUNCTION public.get_survey_analysis_data(p_survey_id UUID)
RETURNS TABLE (
  id UUID,
  submission_data JSONB,
  raw_answers JSONB,
  embedding VECTOR,
  processed_at TIMESTAMP WITH TIME ZONE,
  similarity_score FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.submission_data,
    s.raw_answers,
    s.embedding,
    s.processed_at,
    NULL::FLOAT as similarity_score
  FROM public.survey_submissions s
  WHERE s.survey_id = p_survey_id
  ORDER BY s.processed_at DESC;
END;
$$;

-- Create a function to find similar survey responses using embeddings
CREATE OR REPLACE FUNCTION public.find_similar_survey_responses(
  p_survey_id UUID,
  p_query_embedding VECTOR(1536),
  p_match_threshold FLOAT DEFAULT 0.8,
  p_match_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  submission_data JSONB,
  raw_answers JSONB,
  similarity FLOAT,
  processed_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.submission_data,
    s.raw_answers,
    (1 - (s.embedding <=> p_query_embedding)) as similarity,
    s.processed_at
  FROM public.survey_submissions s
  WHERE s.survey_id = p_survey_id
    AND s.embedding IS NOT NULL
    AND (1 - (s.embedding <=> p_query_embedding)) > p_match_threshold
  ORDER BY s.embedding <=> p_query_embedding
  LIMIT p_match_count;
END;
$$;
