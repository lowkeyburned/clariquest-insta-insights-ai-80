
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MapPin, Users } from "lucide-react";

interface Campaign {
  location: string;
  users: number;
  status: string;
}

interface ActiveCampaignsProps {
  campaigns?: Campaign[];
}

const ActiveCampaigns = ({ campaigns = [] }: ActiveCampaignsProps) => {
  // Default campaigns if none provided
  const defaultCampaigns = [
    { location: "New York, NY", users: 1200, status: "Active" },
    { location: "Los Angeles, CA", users: 850, status: "Active" },
    { location: "Chicago, IL", users: 600, status: "Queued" },
  ];
  
  const displayCampaigns = campaigns.length > 0 ? campaigns : defaultCampaigns;
  
  return (
    <Card className="bg-clari-darkCard border-clari-darkAccent">
      <CardHeader>
        <CardTitle>Active Campaigns</CardTitle>
        <CardDescription>Currently running campaigns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayCampaigns.map((campaign, index) => (
            <div 
              key={index} 
              className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-clari-gold" />
                    <p className="font-medium text-sm">{campaign.location}</p>
                  </div>
                  <p className="text-xs text-clari-muted mt-1">{campaign.status}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={14} className="text-clari-muted" />
                  <span className="text-sm">{campaign.users}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveCampaigns;
