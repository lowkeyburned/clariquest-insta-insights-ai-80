
import { BrainCircuit, MessageSquare, BarChart3, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatWelcomeProps {
  onSelectPrompt: (prompt: string) => void;
  mode?: "survey" | "chart" | "chat-db";
}

const ChatWelcome = ({ onSelectPrompt, mode = "survey" }: ChatWelcomeProps) => {
  const getModeSpecificContent = () => {
    switch (mode) {
      case "survey":
        return {
          title: "Survey AI Assistant",
          description: "Create intelligent surveys and questionnaires tailored to your business needs",
          icon: MessageSquare,
          prompts: [
            { 
              text: "Create a customer satisfaction survey", 
              action: () => onSelectPrompt("Create a comprehensive customer satisfaction survey for my business with questions about service quality, product satisfaction, and overall experience") 
            },
            { 
              text: "Generate product feedback questions", 
              action: () => onSelectPrompt("Generate detailed product feedback questions that will help me understand customer preferences, pain points, and improvement suggestions") 
            },
            { 
              text: "Design employee engagement survey", 
              action: () => onSelectPrompt("Design an employee engagement survey to measure job satisfaction, workplace culture, and identify areas for improvement") 
            },
            { 
              text: "Create market research questionnaire", 
              action: () => onSelectPrompt("Create a market research questionnaire to understand target audience preferences, buying behavior, and market trends") 
            }
          ]
        };
      case "chart":
        return {
          title: "Chart AI Assistant",
          description: "Generate insightful data visualizations and business analytics",
          icon: BarChart3,
          prompts: [
            { 
              text: "Analyze sales performance trends", 
              action: () => onSelectPrompt("Analyze our sales performance trends over the past year and create visualizations showing growth patterns, seasonal variations, and key performance indicators") 
            },
            { 
              text: "Create customer demographics chart", 
              action: () => onSelectPrompt("Create comprehensive charts showing our customer demographics including age groups, geographic distribution, and purchasing behaviors") 
            },
            { 
              text: "Generate revenue analytics dashboard", 
              action: () => onSelectPrompt("Generate a revenue analytics dashboard with charts showing income streams, profit margins, and financial performance metrics") 
            },
            { 
              text: "Visualize market competition data", 
              action: () => onSelectPrompt("Create visualizations comparing our market position against competitors, including market share, pricing analysis, and competitive advantages") 
            }
          ]
        };
      case "chat-db":
        return {
          title: "Database AI Assistant",
          description: "Query and analyze your business data using natural language",
          icon: Database,
          prompts: [
            { 
              text: "Show recent customer transactions", 
              action: () => onSelectPrompt("Show me detailed information about recent customer transactions including amounts, dates, and customer profiles") 
            },
            { 
              text: "Analyze inventory levels and trends", 
              action: () => onSelectPrompt("Analyze current inventory levels, identify low-stock items, and show trends in product demand over time") 
            },
            { 
              text: "Generate customer lifetime value report", 
              action: () => onSelectPrompt("Generate a comprehensive report on customer lifetime value, showing our most valuable customers and their purchasing patterns") 
            },
            { 
              text: "Find sales patterns and insights", 
              action: () => onSelectPrompt("Find sales patterns and insights from our data including peak sales periods, best-performing products, and customer behavior trends") 
            }
          ]
        };
      default:
        return {
          title: "AI Chat Assistant",
          description: "Ask questions about your business data or request insights",
          icon: BrainCircuit,
          prompts: [
            { text: "Analyze customer feedback", action: () => onSelectPrompt("Analyze customer feedback trends") },
            { text: "Create a product survey", action: () => onSelectPrompt("Create a survey about our product") }
          ]
        };
    }
  };

  const content = getModeSpecificContent();

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center space-y-6 max-w-2xl">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-clari-gold/10">
            <content.icon className="text-clari-gold" size={48} />
          </div>
        </div>
        
        <div>
          <h3 className="text-2xl font-bold mb-3">{content.title}</h3>
          <p className="text-clari-muted text-lg leading-relaxed">
            {content.description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
          {content.prompts.map((prompt, index) => (
            <Button 
              key={index}
              variant="outline" 
              className="text-sm h-auto p-4 text-left hover:border-clari-gold hover:bg-clari-gold/5 transition-all duration-200" 
              onClick={prompt.action}
            >
              <span className="line-clamp-2">{prompt.text}</span>
            </Button>
          ))}
        </div>
        
        <div className="text-xs text-clari-muted">
          Choose a prompt above or type your own question below
        </div>
      </div>
    </div>
  );
};

export default ChatWelcome;
