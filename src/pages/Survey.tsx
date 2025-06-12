
import { useParams, useNavigate } from "react-router-dom";
import SurveyCreator from "@/components/survey/SurveyCreator";
import SurveyResponse from "@/components/survey/SurveyResponse";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
      <div className="p-6 bg-clari-darkBg min-h-screen">
        <Button 
          variant="outline" 
          className="mb-4 border-clari-gold text-clari-gold hover:bg-clari-gold hover:text-black" 
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
    toast.error("No survey ID provided");
    return (
      <div className="p-6 bg-clari-darkBg min-h-screen">
        <Button 
          variant="outline" 
          className="mb-4 border-clari-gold text-clari-gold hover:bg-clari-gold hover:text-black" 
          onClick={handleGoBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-clari-text">No survey ID provided</div>
      </div>
    );
  }

  // Pass the slug detection info to SurveyResponse
  return <SurveyResponse surveyId={id} isSlug={!isUuid} />;
};

export default Survey;
