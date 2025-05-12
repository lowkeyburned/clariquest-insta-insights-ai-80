
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar, Target } from "lucide-react";

interface ScheduledCampaign {
  name: string;
  date: string;
  type: string;
}

interface CampaignScheduleProps {
  scheduledCampaigns?: ScheduledCampaign[];
}

const CampaignSchedule = ({ scheduledCampaigns = [] }: CampaignScheduleProps) => {
  // Default campaigns if none provided
  const defaultScheduled = [
    { name: "Summer Sale", date: "May 15, 2025", type: "Promotional" },
    { name: "Product Launch", date: "June 1, 2025", type: "Announcement" },
  ];
  
  const displayScheduled = scheduledCampaigns.length > 0 ? scheduledCampaigns : defaultScheduled;
  
  return (
    <Card className="bg-clari-darkCard border-clari-darkAccent mt-6">
      <CardHeader>
        <CardTitle>Campaign Schedule</CardTitle>
        <CardDescription>Upcoming planned campaigns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayScheduled.map((event, index) => (
            <div 
              key={index} 
              className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{event.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar size={14} className="text-clari-gold" />
                    <p className="text-xs text-clari-muted">{event.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Target size={14} className="text-clari-muted" />
                  <span className="text-xs">{event.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignSchedule;
