
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BrainCircuit } from "lucide-react";

interface RecentInsightsProps {
  businessId: string;
}

const RecentInsights = ({ businessId }: RecentInsightsProps) => {
  // In a real application, we would fetch actual insights for this business
  // For now, we'll display some sample insights with different types
  
  return (
    <div className="space-y-4">
      <div className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent hover:border-clari-gold/50 transition-colors cursor-pointer">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-clari-gold/20 text-clari-gold text-xs font-medium px-2 py-0.5 rounded-sm">
            #Survey
          </span>
          <h3 className="font-medium text-sm text-clari-gold">Survey Sentiment Analysis</h3>
        </div>
        <p className="text-xs">AI analysis reveals a 30% increase in positive sentiment towards new product features.</p>
      </div>
      
      <div className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent hover:border-clari-gold/50 transition-colors cursor-pointer">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-blue-500/20 text-blue-400 text-xs font-medium px-2 py-0.5 rounded-sm">
            #Insight
          </span>
          <h3 className="font-medium text-sm text-clari-gold">Social Media Trend Detection</h3>
        </div>
        <p className="text-xs">AI detected a rising trend in user interest towards sustainable practices in the fashion industry.</p>
      </div>
      
      <div className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent hover:border-clari-gold/50 transition-colors cursor-pointer">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-clari-gold/20 text-clari-gold text-xs font-medium px-2 py-0.5 rounded-sm">
            #Survey
          </span>
          <h3 className="font-medium text-sm text-clari-gold">Customer Feedback Analysis</h3>
        </div>
        <p className="text-xs">AI identified key areas for improvement in customer service based on recent feedback data.</p>
      </div>
      
      <div className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent hover:border-clari-gold/50 transition-colors cursor-pointer">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-purple-500/20 text-purple-400 text-xs font-medium px-2 py-0.5 rounded-sm">
            #Strategy
          </span>
          <h3 className="font-medium text-sm text-clari-gold">Competitive Analysis</h3>
        </div>
        <p className="text-xs">AI comparison of market competitors shows potential opportunities in the mid-tier price segment.</p>
      </div>
    </div>
  );
};

export default RecentInsights;
