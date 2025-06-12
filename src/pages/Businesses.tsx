
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Sparkles } from "lucide-react";
import { useState } from "react";
import BusinessForm from "@/components/business/BusinessForm";
import BusinessList from "@/components/business/BusinessList";
import { useQueryClient } from "@tanstack/react-query";

const Businesses = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const queryClient = useQueryClient();

  const handleBusinessSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['businesses'] });
    setShowAddForm(false);
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Modern Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-clari-gold/5 to-transparent"></div>
          <div className="relative flex flex-col md:flex-row md:justify-between md:items-center gap-6 p-6 bg-clari-darkCard/50 border border-clari-darkAccent/30 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-clari-gold/20 to-clari-gold/10 rounded-xl border border-clari-gold/20">
                <Building2 className="text-clari-gold" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-clari-text to-clari-text/80 bg-clip-text text-transparent">
                  Business Dashboard
                </h1>
                <p className="text-clari-muted mt-2 text-lg">
                  Manage your business profiles and survey analytics
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowAddForm(true)} 
              className="bg-gradient-to-r from-clari-gold to-clari-gold/80 hover:from-clari-gold/90 hover:to-clari-gold/70 text-clari-darkBg font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-clari-gold/20 transition-all duration-200"
            >
              <Plus size={18} className="mr-2" />
              Add Business
            </Button>
          </div>
        </div>

        {/* Add Business Form */}
        {showAddForm && (
          <Card className="bg-gradient-to-br from-clari-darkCard to-clari-darkBg border-clari-darkAccent/30 shadow-xl">
            <CardHeader className="border-b border-clari-darkAccent/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-clari-gold/20 rounded-lg">
                  <Sparkles className="text-clari-gold" size={20} />
                </div>
                <CardTitle className="text-xl text-clari-text">Add New Business</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <BusinessForm 
                onCancel={() => setShowAddForm(false)} 
                onSubmit={handleBusinessSaved}
              />
            </CardContent>
          </Card>
        )}

        {/* Business List */}
        <BusinessList />
      </div>
    </MainLayout>
  );
};

export default Businesses;
