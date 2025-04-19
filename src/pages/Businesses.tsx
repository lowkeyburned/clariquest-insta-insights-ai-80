
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, FileText } from "lucide-react";
import { useState } from "react";
import BusinessForm from "@/components/business/BusinessForm";
import BusinessList from "@/components/business/BusinessList";

const Businesses = () => {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Businesses</h1>
          <p className="text-clari-muted mt-1">Manage your business profiles and surveys</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus size={16} />
          Add Business
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-6 bg-clari-darkCard border-clari-darkAccent">
          <CardHeader>
            <CardTitle>Add New Business</CardTitle>
          </CardHeader>
          <CardContent>
            <BusinessForm onCancel={() => setShowAddForm(false)} />
          </CardContent>
        </Card>
      )}

      <BusinessList />
    </MainLayout>
  );
};

export default Businesses;
