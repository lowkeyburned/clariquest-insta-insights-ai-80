
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface BusinessFormProps {
  onCancel: () => void;
  onSubmit?: (data: BusinessData) => void;
}

export interface BusinessData {
  id?: number;
  name: string;
  description: string;
  website: string;
  surveyCount?: number;
}

// Mock function to simulate data storage since we don't have a backend yet
const saveBusiness = (data: BusinessData) => {
  // Get existing businesses from localStorage
  const existingBusinesses = localStorage.getItem('businesses');
  let businesses = existingBusinesses ? JSON.parse(existingBusinesses) : [];
  
  // Generate an ID if it's a new business
  if (!data.id) {
    const maxId = businesses.length > 0 ? Math.max(...businesses.map((b: BusinessData) => b.id || 0)) : 0;
    data.id = maxId + 1;
    data.surveyCount = 0;
    businesses.push(data);
  } else {
    // Update existing business
    const index = businesses.findIndex((b: BusinessData) => b.id === data.id);
    if (index >= 0) {
      businesses[index] = { ...businesses[index], ...data };
    }
  }
  
  // Save back to localStorage
  localStorage.setItem('businesses', JSON.stringify(businesses));
  return data;
};

const BusinessForm = ({ onCancel, onSubmit }: BusinessFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BusinessData>({
    name: "",
    description: "",
    website: "",
  });
  
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const savedBusiness = saveBusiness(formData);
      toast.success("Business saved successfully");
      if (onSubmit) {
        onSubmit(savedBusiness);
      }
      // Reset form
      setFormData({ name: "", description: "", website: "" });
      // Close form
      onCancel();
    } catch (error) {
      toast.error("Failed to save business");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-2">Business Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border-clari-darkAccent bg-clari-darkBg"
          placeholder="Enter business name"
          required
        />
      </div>
      
      <div>
        <label className="text-sm font-medium block mb-2">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="border-clari-darkAccent bg-clari-darkBg"
          placeholder="Enter business description"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-2">Website</label>
        <Input
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          className="border-clari-darkAccent bg-clari-darkBg"
          placeholder="Enter website URL"
          type="url"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Business"}
        </Button>
      </div>
    </form>
  );
};

export default BusinessForm;
