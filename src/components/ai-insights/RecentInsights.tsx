
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RecentInsightsProps {
  businessId: string;
}

const RecentInsights = ({ businessId }: RecentInsightsProps) => {
  // In a real application, we would fetch actual insights for this business
  // For now, we'll display some sample insights
  
  return (
    <div className="space-y-4">
      <div className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
        <h3 className="font-medium text-sm text-clari-gold mb-1">Survey Sentiment Analysis</h3>
        <p className="text-xs">AI analysis reveals a 30% increase in positive sentiment towards new product features.</p>
      </div>
      
      <div className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
        <h3 className="font-medium text-sm text-clari-gold mb-1">Social Media Trend Detection</h3>
        <p className="text-xs">AI detected a rising trend in user interest towards sustainable practices in the fashion industry.</p>
      </div>
      
      <div className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
        <h3 className="font-medium text-sm text-clari-gold mb-1">Customer Feedback Analysis</h3>
        <p className="text-xs">AI identified key areas for improvement in customer service based on recent feedback data.</p>
      </div>
    </div>
  );
};

export default RecentInsights;
