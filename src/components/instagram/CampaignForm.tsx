
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCampaign } from "@/utils/supabaseHelpers";
import { useToast } from "@/components/ui/use-toast";
import { sendToWebhooks } from "@/utils/webhookUtils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Send } from "lucide-react";

interface CampaignFormProps {
  businessId?: string;
  businessName?: string;
  webhookUrl: string;
  instagramUsername: string;
}

const CampaignForm = ({ businessId, businessName, webhookUrl, instagramUsername }: CampaignFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [reachInNumbers, setReachInNumbers] = useState("");
  
  const saveCampaignMutation = useMutation({
    mutationFn: (campaignData: {
      businessId: string;
      name: string;
      messageText: string;
      location?: string;
      reachNumbers?: number;
    }) => createCampaign(campaignData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({
        title: "Campaign saved",
        description: "Your Instagram campaign has been saved.",
      });
    }
  });
  
  const handleSendCampaign = async () => {
    if (!messageText.trim()) {
      toast({
        title: "Message cannot be empty",
        description: "Please enter a message to send to the targeted users.",
        variant: "destructive"
      });
      return;
    }
    if (!reachInNumbers.trim()) {
      toast({
        title: "Reach cannot be empty",
        description: "Please specify the reach in numbers.",
        variant: "destructive"
      });
      return;
    }
    if (!webhookUrl) {
      toast({
        title: "Webhook URL not configured",
        description: "Please configure your n8n webhook URL in settings first.",
        variant: "destructive"
      });
      return;
    }
    
    // Save campaign to database first if business is selected
    if (businessId) {
      await saveCampaignMutation.mutateAsync({
        businessId: businessId,
        name: `Campaign for ${searchQuery || "Global"}`,
        messageText: messageText,
        location: searchQuery,
        reachNumbers: parseInt(reachInNumbers)
      });
    }
    
    // Format data for n8n to process with the Puppeteer script
    const campaignData = {
      message: messageText,
      location: searchQuery || "Global",
      reachInNumbers: parseInt(reachInNumbers),
      instagramUsername: instagramUsername,
      targetUsers: ["user1", "user2", "user3"], // This would be dynamically generated based on your targeting criteria
      business: businessId ? {
        id: businessId,
        name: businessName
      } : null,
      timestamp: new Date().toISOString(),
      source: "Instagram Campaign",
      campaignType: "Geographic Targeting"
    };
    
    try {
      // Send to both webhook URLs
      const result = await sendToWebhooks(webhookUrl, campaignData, { useSecondary: true });
      
      if (result.success) {
        toast({
          title: "Campaign data sent to webhooks",
          description: "Your campaign data was successfully sent to all configured webhooks.",
        });
        
        console.log("Webhooks triggered with data:", campaignData);
        setMessageText("");
        setReachInNumbers("");
      } else {
        throw new Error("Failed to send to webhooks");
      }
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Error",
        description: "There was an error sending your campaign data to the webhooks.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card className="bg-clari-darkCard border-clari-darkAccent">
      <CardHeader>
        <CardTitle>New Campaign</CardTitle>
        <CardDescription>Create a new targeted Instagram messaging campaign</CardDescription>
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

        <div>
          <Label>Reach in Numbers</Label>
          <Input 
            type="number" 
            placeholder="e.g. 5000" 
            className="border-clari-darkAccent bg-clari-darkBg"
            value={reachInNumbers}
            onChange={e => setReachInNumbers(e.target.value)}
            min={1}
          />
        </div>

        <div>
          <Label>Message Content</Label>
          <textarea 
            className="w-full min-h-[120px] rounded-md border border-clari-darkAccent bg-clari-darkBg p-3 text-sm"
            placeholder="Enter your message here..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <p className="text-xs text-clari-muted mt-1">
            Use {'{username}'} to personalize for each recipient
          </p>
        </div>

        <Button 
          onClick={handleSendCampaign}
          className="w-full gap-2 bg-clari-gold text-black hover:bg-clari-gold/90"
          disabled={saveCampaignMutation.isPending}
        >
          {saveCampaignMutation.isPending ? "Sending..." : (
            <>
              <Send size={16} />
              Send Campaign
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CampaignForm;
