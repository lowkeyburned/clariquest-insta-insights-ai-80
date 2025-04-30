
import { useParams, useNavigate } from "react-router-dom";
import SurveyCreator from "@/components/survey/SurveyCreator";
import SurveyResponse from "@/components/survey/SurveyResponse";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Survey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreateMode = id?.startsWith('create');

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isCreateMode) {
    return (
      <div className="p-6">
        <Button 
          variant="outline" 
          className="mb-4" 
          onClick={handleGoBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <SurveyCreator />
      </div>
    );
  }

  if (!id) {
    return (
      <div className="p-6">
        <Button 
          variant="outline" 
          className="mb-4" 
          onClick={handleGoBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>No survey ID provided</div>
      </div>
    );
  }

  return <SurveyResponse surveyId={id} />;
};

export default Survey;
