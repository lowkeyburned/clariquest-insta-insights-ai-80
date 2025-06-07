
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BusinessWithSurveyCount } from "@/utils/types/database";
import { LucideIcon } from "lucide-react";
import AIChat from "./AIChat";

interface AIAssistantCardProps {
  type: "survey" | "chart" | "database";
  title: string;
  description: string;
  icon: LucideIcon;
  business: BusinessWithSurveyCount;
}

const AIAssistantCard = ({ type, title, description, icon: Icon, business }: AIAssistantCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChat = () => {
    setIsOpen(true);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
  };

  if (isOpen) {
    return (
      <div className="lg:col-span-3">
        <AIChat
          type={type}
          title={title}
          business={business}
          onClose={handleCloseChat}
        />
      </div>
    );
  }

  return (
    <Card className="bg-clari-darkCard border-clari-darkAccent hover:border-clari-gold/50 transition-all duration-200 group cursor-pointer">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-clari-gold/10 group-hover:bg-clari-gold/20 transition-colors">
            <Icon className="text-clari-gold" size={24} />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-clari-muted text-sm leading-relaxed">
          {description}
        </p>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">What you can do:</h4>
          <ul className="text-xs text-clari-muted space-y-1">
            {type === "survey" && (
              <>
                <li>• Generate custom survey questions</li>
                <li>• Create feedback forms</li>
                <li>• Design customer satisfaction surveys</li>
              </>
            )}
            {type === "chart" && (
              <>
                <li>• Create data visualizations</li>
                <li>• Generate business insights</li>
                <li>• Analyze trends and patterns</li>
              </>
            )}
            {type === "database" && (
              <>
                <li>• Query data with natural language</li>
                <li>• Generate reports</li>
                <li>• Analyze business metrics</li>
              </>
            )}
          </ul>
        </div>

        <Button 
          onClick={handleOpenChat}
          className="w-full bg-clari-gold text-black hover:bg-clari-gold/90 transition-colors"
        >
          Start {title} Session
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIAssistantCard;
