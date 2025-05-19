
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SurveyQuestion from "./SurveyQuestion";
import { SurveyQuestion as SurveyQuestionType } from "@/utils/sampleSurveyData";

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
}

const SurveyPreview = ({ survey }: SurveyPreviewProps) => {
  return (
    <Card className="bg-clari-darkCard border-clari-darkAccent">
      <CardHeader>
        <CardTitle className="text-xl">Survey Preview: {survey.title}</CardTitle>
        <CardDescription>{survey.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {survey.questions.map((question, index) => {
          // Convert the question to match the SurveyQuestion component props
          const formattedQuestion: SurveyQuestionType = {
            id: `preview-${index}`,
            text: question.text,
            type: question.type as any,
            options: question.options,
            min: question.min,
            max: question.max,
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

        <div className="bg-clari-darkBg/50 p-4 rounded-lg mt-4">
          <p className="text-sm text-clari-muted">
            This is a preview of how the survey will appear to respondents. Click "Create Survey" to save this survey to your account.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SurveyPreview;
