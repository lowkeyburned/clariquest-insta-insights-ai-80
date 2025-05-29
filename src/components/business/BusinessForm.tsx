
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createBusiness, updateBusiness } from "@/utils/supabase/businessHelpers";

export interface BusinessData {
  id?: string;
  name: string;
  description: string;
  website: string;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
}

// Separate interface for when we need to include survey counts
export interface BusinessWithSurveyCount extends BusinessData {
  surveyCount?: number;
}

interface BusinessFormProps {
  onSubmit: (business: BusinessData) => void;
  onCancel: () => void;
  initialValues?: BusinessData;
}

const BusinessForm = ({ onSubmit, onCancel, initialValues }: BusinessFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<BusinessData>({
    defaultValues: initialValues || {
      name: "",
      description: "",
      website: "",
      owner_id: ""
    }
  });

  const onFormSubmit = async (data: BusinessData) => {
    setIsSubmitting(true);
    try {
      let result;
      if (initialValues?.id) {
        // Update existing business
        const updateResult = await updateBusiness(initialValues.id, {
          name: data.name,
          description: data.description,
          website: data.website
        });
        
        if (!updateResult.success) {
          throw new Error(updateResult.error);
        }
        result = updateResult.data;
      } else {
        // Create new business
        const createResult = await createBusiness({
          name: data.name,
          description: data.description,
          website: data.website
        });
        
        if (!createResult.success) {
          throw new Error(createResult.error);
        }
        result = createResult.data;
      }
      
      onSubmit(result);
      toast.success(`Business ${initialValues ? 'updated' : 'created'} successfully`);
    } catch (error: any) {
      console.error("Error saving business:", error);
      toast.error(`Error ${initialValues ? 'updating' : 'creating'} business: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Business Name</Label>
          <Input 
            id="name" 
            {...register("name", { required: "Business name is required" })} 
            placeholder="Enter business name"
            className="bg-clari-darkBg border-clari-darkAccent"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            {...register("description")} 
            placeholder="Enter business description"
            className="bg-clari-darkBg border-clari-darkAccent"
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="website">Website</Label>
          <Input 
            id="website" 
            {...register("website")} 
            placeholder="https://example.com"
            type="url"
            className="bg-clari-darkBg border-clari-darkAccent"
          />
        </div>
        
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialValues ? 'Update Business' : 'Add Business'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default BusinessForm;
