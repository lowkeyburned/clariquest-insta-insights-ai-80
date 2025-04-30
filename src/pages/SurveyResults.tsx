
import { useParams } from "react-router-dom";
import SurveyResults from "@/components/survey/SurveyResults";

const SurveyResultsPage = () => {
  const { id } = useParams();

  if (!id) {
    return <div>No survey ID provided</div>;
  }

  return <SurveyResults surveyId={id} />;
};

export default SurveyResultsPage;
