
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BusinessWithSurveyCount } from "@/utils/types/database";

interface ChatInterfaceProps {
  business: BusinessWithSurveyCount;
}

// This component is deprecated - using new AIChat component instead
const ChatInterface = ({ business }: ChatInterfaceProps) => {
  return (
    <Card className="bg-clari-darkCard border-clari-darkAccent p-8 text-center">
      <CardContent>
        <p className="text-clari-muted">
          This component has been replaced. Please use the new AI assistant cards.
        </p>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
