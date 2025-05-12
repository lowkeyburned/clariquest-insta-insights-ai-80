
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Instagram } from "lucide-react";

// Update the interface to match the actual data structure from Supabase
interface Business {
  id: string; // Changed from number to string to match Supabase data
  name: string;
  description?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

interface BusinessSelectorProps {
  businesses: Business[];
}

const BusinessSelector = ({ businesses }: BusinessSelectorProps) => {
  const navigate = useNavigate();
  
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Select a Business</h1>
        <p className="text-clari-muted mt-1">
          Choose a business to manage Instagram campaigns
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((business) => (
          <Card 
            key={business.id} 
            className="cursor-pointer bg-clari-darkCard border-clari-darkAccent hover:border-clari-gold transition-colors"
            onClick={() => navigate(`/instagram-campaigns/${business.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Instagram className="text-clari-gold" />
                <h3 className="text-xl font-medium">{business.name}</h3>
              </div>
              <p className="text-sm text-clari-muted">
                Manage Instagram campaigns for {business.name}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default BusinessSelector;
