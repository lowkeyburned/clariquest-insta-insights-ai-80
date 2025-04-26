
import { useParams } from "react-router-dom";
import SurveyCreator from "@/components/survey/SurveyCreator";
import SurveyResponse from "@/components/survey/SurveyResponse";

const Survey = () => {
  const { id } = useParams();
  const isCreateMode = id?.startsWith('create');

  if (isCreateMode) {
    return <SurveyCreator />;
  }

  if (!id) {
    return null;
  }

  return <SurveyResponse surveyId={id} />;
};

export default Survey;
