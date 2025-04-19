
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Instagram, 
  Send, 
  Users, 
  MapPin, 
  Search
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const InstagramCampaigns = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  
  const handleSendCampaign = () => {
    if (!messageText.trim()) {
      toast({
        title: "Message cannot be empty",
        description: "Please enter a message to send to the targeted users.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Campaign queued",
      description: "Your Instagram messaging campaign has been queued for sending.",
    });
    
    setMessageText("");
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Instagram Campaigns</h1>
          <p className="text-clari-muted mt-1">Create and manage targeted Instagram campaigns</p>
        </div>
        <Button className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90">
          <Instagram size={16} />
          Connect Instagram
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>New Campaign</CardTitle>
              <CardDescription>Create a new targeted messaging campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Target Location</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-clari-muted" />
                  <Input 
                    placeholder="Search for a city or location..." 
                    className="pl-9 border-clari-darkAccent bg-clari-darkBg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Radius (miles)</Label>
                  <Input 
                    type="number" 
                    placeholder="10" 
                    className="border-clari-darkAccent bg-clari-darkBg"
                  />
                </div>
                <div>
                  <Label>Estimated Reach</Label>
                  <Input 
                    readOnly 
                    value="~5,000 users" 
                    className="border-clari-darkAccent bg-clari-darkBg"
                  />
                </div>
              </div>

              <div>
                <Label>Message Content</Label>
                <textarea 
                  className="w-full min-h-[120px] rounded-md border border-clari-darkAccent bg-clari-darkBg p-3 text-sm"
                  placeholder="Enter your message here..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleSendCampaign}
                className="w-full gap-2 bg-clari-gold text-black hover:bg-clari-gold/90"
              >
                <Send size={16} />
                Send Campaign
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>Currently running campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { location: "New York, NY", users: 1200, status: "Active" },
                  { location: "Los Angeles, CA", users: 850, status: "Active" },
                  { location: "Chicago, IL", users: 600, status: "Queued" },
                ].map((campaign, index) => (
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
        </div>
      </div>
    </MainLayout>
  );
};

export default InstagramCampaigns;
