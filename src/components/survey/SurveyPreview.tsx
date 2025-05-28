
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SurveyQuestion from "./SurveyQuestion";
import { SurveyQuestion as DatabaseSurveyQuestion } from "@/utils/types/database";
import { Button } from "@/components/ui/button";

interface SurveyPreviewProps {
  survey: {
    title: string;
    description: string;
    questions: Array<{
      text: string;
      type: string;
      options?: string[];
      min?: number;
      max?: number;
    }>;
  };
  onCreateSurvey?: () => void;
}

const SurveyPreview = ({ survey, onCreateSurvey }: SurveyPreviewProps) => {
  return (
    <Card className="bg-clari-darkCard border-clari-darkAccent">
      <CardHeader>
        <CardTitle className="text-xl">Survey Preview: {survey.title}</CardTitle>
        <CardDescription>{survey.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {survey.questions.map((question, index) => {
          // Convert the question to match the SurveyQuestion component props
          const formattedQuestion: DatabaseSurveyQuestion = {
            id: `preview-${index}`,
            survey_id: 'preview',
            question_text: question.text,
            question_type: question.type as any,
            options: question.options,
            required: true,
            order_index: index,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          return (
            <div key={index} className="pb-6 border-b border-clari-darkAccent last:border-0">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-clari-muted">Question {index + 1}</span>
                <span className="text-xs bg-clari-darkBg px-2 py-1 rounded-full">
                  {question.type === 'multiple_choice' ? 'Multiple Choice' : 
                   question.type === 'likert' ? 'Likert Scale' : 
                   question.type === 'open_ended' ? 'Open Ended' : 
                   question.type === 'slider' ? 'Slider' : 'Single Choice'}
                </span>
              </div>
              <SurveyQuestion
                question={formattedQuestion}
                preview={true}
              />
            </div>
          );
        })}

        {onCreateSurvey && (
          <div className="flex justify-end mt-6">
            <Button 
              onClick={onCreateSurvey}
              className="bg-clari-gold text-black hover:bg-clari-gold/90"
            >
              Create Survey →
            </Button>
          </div>
        )}

        {!onCreateSurvey && (
          <div className="bg-clari-darkBg/50 p-4 rounded-lg mt-4">
            <p className="text-sm text-clari-muted">
              This is a preview of how the survey will appear to respondents. Click "Create Survey" to save this survey to your account.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SurveyPreview;
