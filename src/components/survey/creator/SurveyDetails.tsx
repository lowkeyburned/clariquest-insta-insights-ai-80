
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SurveyDetailsProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
}

const SurveyDetails = ({ title, setTitle, description, setDescription }: SurveyDetailsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Survey Title</Label>
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter survey title"
          className="bg-clari-darkBg border-clari-darkAccent"
        />
      </div>
      
      <div>
        <Label>Description</Label>
        <Textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter survey description"
          className="bg-clari-darkBg border-clari-darkAccent"
        />
      </div>
    </div>
  );
};

export default SurveyDetails;
