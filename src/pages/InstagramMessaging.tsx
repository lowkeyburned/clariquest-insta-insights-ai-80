
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Instagram, 
  Send, 
  Users, 
  MapPin, 
  Filter, 
  Clock, 
  MessageSquare,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const InstagramMessaging = () => {
  const { toast } = useToast();
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
      action: (
        <Button variant="outline" size="sm" onClick={() => console.log("View details")}>
          View Details
        </Button>
      )
    });
    
    setMessageText("");
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Instagram Messaging</h1>
          <p className="text-clari-muted mt-1">Create and send messages to targeted Instagram users</p>
        </div>
        <Button className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90">
          <Instagram size={16} />
          Connect Instagram
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>New Message Campaign</CardTitle>
              <CardDescription>Create a new targeted message for Instagram users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input 
                  id="campaign-name" 
                  placeholder="e.g., Summer Product Survey" 
                  className="border-clari-darkAccent bg-clari-darkBg"
                />
              </div>
              
              <div>
                <Label htmlFor="message-text">Message Content</Label>
                <Textarea 
                  id="message-text" 
                  placeholder="Enter your message here. You can use {name} to personalize it." 
                  className="min-h-[120px] border-clari-darkAccent bg-clari-darkBg"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location-target">Target Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-clari-muted" />
                    <Input 
                      id="location-target" 
                      placeholder="New York, NY" 
                      className="border-clari-darkAccent bg-clari-darkBg pl-9"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="audience-size">Estimated Audience</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-clari-muted" />
                    <Input 
                      id="audience-size" 
                      readOnly 
                      value="~2,500 users" 
                      className="border-clari-darkAccent bg-clari-darkBg pl-9"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schedule-time">Schedule</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-clari-muted" />
                    <Input 
                      id="schedule-time" 
                      type="datetime-local" 
                      className="border-clari-darkAccent bg-clari-darkBg pl-9"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="message-limit">Message Limit</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-clari-muted" />
                    <Input 
                      id="message-limit" 
                      type="number" 
                      placeholder="100" 
                      className="border-clari-darkAccent bg-clari-darkBg pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-clari-darkAccent pt-4">
              <Button variant="outline">Save as Draft</Button>
              <Button 
                className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90"
                onClick={handleSendCampaign}
              >
                <Send size={16} />
                Send Campaign
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Message Preview</CardTitle>
              <CardDescription>See how your message will appear to recipients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-clari-darkBg p-4 rounded-md border border-clari-darkAccent">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-clari-darkAccent flex items-center justify-center">
                    <Instagram size={16} className="text-clari-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Your Business</p>
                    <p className="text-xs text-clari-muted">via Instagram</p>
                  </div>
                </div>
                <div className="pl-11">
                  <p className="text-sm">
                    {messageText || "Your message will appear here. Enter a message to see the preview."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Audience Targeting</CardTitle>
              <CardDescription>Define your target audience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">Age Range</Label>
                <div className="flex gap-2">
                  <Input placeholder="18" className="w-20 border-clari-darkAccent bg-clari-darkBg" />
                  <span className="flex items-center">-</span>
                  <Input placeholder="35" className="w-20 border-clari-darkAccent bg-clari-darkBg" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="interests" className="mb-2 block">Interests</Label>
                <Input 
                  id="interests" 
                  placeholder="fashion, fitness, technology" 
                  className="border-clari-darkAccent bg-clari-darkBg"
                />
                <p className="text-xs text-clari-muted mt-1">Separate multiple interests with commas</p>
              </div>
              
              <div>
                <Label htmlFor="radius" className="mb-2 block">Geographic Radius (miles)</Label>
                <Input 
                  id="radius" 
                  type="number" 
                  placeholder="25" 
                  className="border-clari-darkAccent bg-clari-darkBg"
                />
              </div>
              
              <Button className="w-full gap-2">
                <Filter size={16} />
                Apply Filters
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Status of your recent messaging campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Product Survey Q2", status: "Completed", messages: 156, date: "Jun 15, 2023", success: true },
                  { name: "Feedback Request", status: "In Progress", messages: 78, date: "Jun 20, 2023", success: true },
                  { name: "New Product Launch", status: "Queued", messages: 240, date: "Jun 23, 2023", success: true },
                  { name: "Customer Interview", status: "Failed", messages: 0, date: "Jun 5, 2023", success: false }
                ].map((campaign, index) => (
                  <div key={index} className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{campaign.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {campaign.success ? (
                            <CheckCircle2 size={14} className="text-green-500" />
                          ) : (
                            <AlertCircle size={14} className="text-red-500" />
                          )}
                          <p className="text-xs text-clari-muted">{campaign.status}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-clari-muted">{campaign.date}</p>
                        <p className="text-xs mt-1">{campaign.messages} messages</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="ghost" className="w-full text-clari-gold">View All Campaigns</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default InstagramMessaging;
