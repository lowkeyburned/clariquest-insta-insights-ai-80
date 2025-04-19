
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Link, BarChart2 } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { BusinessData } from "./BusinessForm";

const BusinessList = () => {
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);

  // Load businesses from localStorage
  useEffect(() => {
    const loadBusinesses = () => {
      const storedBusinesses = localStorage.getItem('businesses');
      if (storedBusinesses) {
        setBusinesses(JSON.parse(storedBusinesses));
      } else {
        // Set mock data as fallback if nothing in localStorage yet
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
        localStorage.setItem('businesses', JSON.stringify(mockBusinesses));
        setBusinesses(mockBusinesses);
      }
    };

    loadBusinesses();
    
    // Add event listener for storage changes (in case businesses are updated in another component)
    window.addEventListener('storage', loadBusinesses);
    
    return () => {
      window.removeEventListener('storage', loadBusinesses);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {businesses.map((business) => (
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
                <span>{business.surveyCount || 0} Surveys</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <RouterLink to={`/survey/${business.id}`} className="gap-2">
                    <FileText size={14} />
                    Surveys
                  </RouterLink>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <RouterLink to={`/business/${business.id}`} className="gap-2">
                    <BarChart2 size={14} />
                    Analysis
                  </RouterLink>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {businesses.length === 0 && (
        <div className="col-span-2 text-center py-12 text-clari-muted">
          No businesses found. Add your first business using the form above.
        </div>
      )}
    </div>
  );
};

export default BusinessList;
