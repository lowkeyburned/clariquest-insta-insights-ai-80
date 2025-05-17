
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BusinessData {
  id?: string;
  name: string;
  description: string;
  website: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
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
      website: ""
    }
  });

  const onFormSubmit = async (data: BusinessData) => {
    setIsSubmitting(true);
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to add a business");
        return;
      }
      
      // Add user_id to the business data
      const businessData: BusinessData = {
        ...data,
        user_id: user.id
      };
      
      // Create or update the business in the database
      let result;
      if (initialValues?.id) {
        // Update existing business
        const { data: updatedBusiness, error } = await supabase
          .from('businesses')
          .update(businessData)
          .eq('id', initialValues.id)
          .select()
          .single();
          
        if (error) throw error;
        result = updatedBusiness;
      } else {
        // Insert new business
        const { data: newBusiness, error } = await supabase
          .from('businesses')
          .insert(businessData)
          .select()
          .single();
          
        if (error) throw error;
        result = newBusiness;
      }
      
      onSubmit(result);
      toast.success(`Business ${initialValues ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error("Error saving business:", error);
      toast.error(`Error ${initialValues ? 'updating' : 'creating'} business. Please try again.`);
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
