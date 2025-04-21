
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Database } from "lucide-react";
import { BusinessData } from "@/components/business/BusinessForm";

const DatabasePage = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  
  useEffect(() => {
    const loadBusinesses = () => {
      try {
        const storedBusinesses = localStorage.getItem('businesses');
        if (storedBusinesses) {
          const parsedBusinesses = JSON.parse(storedBusinesses);
          setBusinesses(parsedBusinesses);
          
          if (businessId) {
            const foundBusiness = parsedBusinesses.find((b: BusinessData) => b.id === Number(businessId));
            if (foundBusiness) {
              setBusiness(foundBusiness);
            }
          }
        }
      } catch (error) {
        console.error("Error loading businesses:", error);
      }
    };

    loadBusinesses();
  }, [businessId]);

  // If no businessId is provided, show a business selector
  if (!businessId && businesses.length > 0) {
    return (
      <MainLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Select a Business</h1>
          <p className="text-clari-muted mt-1">
            Choose a business to access its database
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <div 
              key={business.id} 
              className="p-6 rounded-lg bg-clari-darkCard border border-clari-darkAccent hover:border-clari-gold cursor-pointer"
              onClick={() => navigate(`/database/${business.id}`)}
            >
              <div className="flex items-center gap-3 mb-2">
                <Database className="text-clari-gold" />
                <h3 className="text-xl font-medium">{business.name}</h3>
              </div>
              <p className="text-sm text-clari-muted">
                Access database for {business.name}
              </p>
            </div>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link to={businessId ? `/business/${businessId}` : "/businesses"} className="gap-2">
            <ArrowLeft size={16} />
            {businessId ? "Back to Business" : "Back to Businesses"}
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Database</h1>
          <p className="text-clari-muted mt-1">
            {business ? `Manage database for ${business.name}` : 'Manage your database'}
          </p>
        </div>
      </div>

      <div className="p-8 bg-clari-darkCard border border-clari-darkAccent rounded-lg text-center">
        <Database className="w-16 h-16 mx-auto mb-4 text-clari-gold" />
        <h2 className="text-2xl font-bold mb-2">Database Connection</h2>
        <p className="text-clari-muted max-w-md mx-auto mb-6">
          Connect to your PostgreSQL database to store and manage survey responses and other business data.
        </p>
        <div className="max-w-md mx-auto">
          <Button className="w-full bg-clari-gold text-black hover:bg-clari-gold/90">
            Connect to PostgreSQL
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default DatabasePage;
