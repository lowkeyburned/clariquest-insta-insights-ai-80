
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface BusinessFormProps {
  onCancel: () => void;
  onSubmit?: (data: BusinessData) => void;
}

interface BusinessData {
  name: string;
  description: string;
  website: string;
}

const BusinessForm = ({ onCancel, onSubmit }: BusinessFormProps) => {
  const [formData, setFormData] = useState<BusinessData>({
    name: "",
    description: "",
    website: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Business</Button>
      </div>
    </form>
  );
};

export default BusinessForm;
