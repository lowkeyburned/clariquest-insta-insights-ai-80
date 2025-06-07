
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

  const getCapabilities = () => {
    switch (type) {
      case "survey":
        return [
          "Generate custom survey questions",
          "Create feedback forms instantly",
          "Design customer satisfaction surveys",
          "Build product evaluation forms"
        ];
      case "chart":
        return [
          "Create data visualizations",
          "Generate business insights",
          "Analyze trends and patterns",
          "Build interactive dashboards"
        ];
      case "database":
        return [
          "Query data with natural language",
          "Generate detailed reports",
          "Analyze business metrics",
          "Extract actionable insights"
        ];
      default:
        return [];
    }
  };

  const capabilities = getCapabilities();

  return (
    <Card className="bg-clari-darkCard border-clari-darkAccent hover:border-clari-gold/50 transition-all duration-300 group cursor-pointer h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-lg bg-clari-gold/10 group-hover:bg-clari-gold/20 transition-colors">
            <Icon className="text-clari-gold" size={28} />
          </div>
          <CardTitle className="text-2xl group-hover:text-clari-gold transition-colors">{title}</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-6">
        <p className="text-clari-muted leading-relaxed">
          {description}
        </p>
        
        <div className="space-y-3 flex-1">
          <h4 className="font-semibold text-sm text-clari-gold">Capabilities:</h4>
          <ul className="space-y-2">
            {capabilities.map((capability, index) => (
              <li key={index} className="text-sm text-clari-muted flex items-start gap-2">
                <span className="text-clari-gold text-xs mt-1">●</span>
                <span>{capability}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button 
          onClick={handleOpenChat}
          className="w-full bg-clari-gold text-black hover:bg-clari-gold/90 transition-all duration-200 font-medium py-3 group-hover:scale-105"
        >
          Start {title} Session
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIAssistantCard;
