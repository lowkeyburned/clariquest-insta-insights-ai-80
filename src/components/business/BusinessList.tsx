
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Link } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

const mockBusinesses = [
  {
    id: 1,
    name: "Acme Corp",
    description: "Leading provider of innovative solutions",
    website: "https://acme.com",
    surveyCount: 3,
  },
  {
    id: 2,
    name: "TechStart Inc",
    description: "Technology solutions for startups",
    website: "https://techstart.com",
    surveyCount: 2,
  },
];

const BusinessList = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {mockBusinesses.map((business) => (
        <Card key={business.id} className="bg-clari-darkCard border-clari-darkAccent">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="text-clari-gold" size={24} />
                <CardTitle>{business.name}</CardTitle>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={business.website} target="_blank" rel="noopener noreferrer" className="gap-2">
                  <Link size={14} />
                  Website
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-clari-muted">{business.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-clari-muted">
                <FileText size={16} />
                <span>{business.surveyCount} Surveys</span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <RouterLink to={`/survey/${business.id}`} className="gap-2">
                  View Surveys
                </RouterLink>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BusinessList;
