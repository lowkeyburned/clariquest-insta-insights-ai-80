
import { useParams, useNavigate } from "react-router-dom";
import SurveyCreator from "@/components/survey/SurveyCreator";
import SurveyResponse from "@/components/survey/SurveyResponse";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

const Survey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isUuid, setIsUuid] = useState(false);
  const isCreateMode = id?.startsWith('create');
  
  // Check if the ID is a UUID (for survey ID) or a slug
  useEffect(() => {
    if (!id || isCreateMode) return;
    
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    setIsUuid(uuidPattern.test(id));
  }, [id, isCreateMode]);

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

  return <SurveyResponse surveyId={id} isSlug={!isUuid} />;
};

export default Survey;
