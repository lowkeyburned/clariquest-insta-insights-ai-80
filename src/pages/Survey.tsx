
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Survey = () => {
  const { id } = useParams();

  // Mock survey data (replace with actual data fetching)
  const survey = {
    businessName: "Acme Corp",
    title: "Customer Satisfaction Survey",
    description: "Help us improve our services by providing your feedback.",
  };

  return (
    <div className="min-h-screen bg-clari-darkBg text-clari-text p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardHeader>
            <div className="text-sm text-clari-muted mb-2">{survey.businessName}</div>
            <CardTitle>{survey.title}</CardTitle>
            <p className="text-sm text-clari-muted mt-2">{survey.description}</p>
          </CardHeader>
          <CardContent>
            <div className="text-center text-clari-muted">
              Survey form will be implemented here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Survey;
