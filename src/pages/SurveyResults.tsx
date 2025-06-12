
import { useParams } from "react-router-dom";
import SurveyResultsComponent from "@/components/survey/SurveyResults";

const SurveyResultsPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>No survey ID provided</div>;
  }

  return <SurveyResultsComponent surveyId={id} />;
};

export default SurveyResultsPage;
