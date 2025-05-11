
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Instagram, 
  Send, 
  Users, 
  MapPin, 
  Search,
  ArrowLeft,
  Webhook,
  Calendar,
  Target,
  Settings
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { BusinessData } from "@/components/business/BusinessForm";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchBusinessById, fetchBusinesses, getSetting, saveSetting, createCampaign } from "@/utils/supabaseHelpers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Default webhook URL - update this to your n8n webhook URL
const DEFAULT_WEBHOOK_URL = "http://localhost:5678/webhook/n8n";

const InstagramCampaigns = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [reachInNumbers, setReachInNumbers] = useState("");
  const [webhookUrl, setWebhookUrl] = useState(DEFAULT_WEBHOOK_URL);
  const [instagramUsername, setInstagramUsername] = useState("");
  
  // Fetch businesses
  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses
  });
  
  // Fetch single business if businessId is provided
  const { data: business } = useQuery({
    queryKey: ['business', businessId],
    queryFn: () => fetchBusinessById(businessId as string),
    enabled: !!businessId
  });
  
  // Fetch settings
  const { data: savedWebhookUrl } = useQuery({
    queryKey: ['settings', 'n8nWebhookUrl'],
    queryFn: () => getSetting('n8nWebhookUrl')
  });
  
  const { data: savedInstagramUsername } = useQuery({
    queryKey: ['settings', 'instagramUsername'],
    queryFn: () => getSetting('instagramUsername')
  });
  
  // Set up mutations
  const saveSettingsMutation = useMutation({
    mutationFn: ({ key, value }: { key: string, value: string }) => 
      saveSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
  });
  
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
  
  // Set initial values from fetched settings
  useEffect(() => {
    if (savedWebhookUrl) setWebhookUrl(savedWebhookUrl);
    if (savedInstagramUsername) setInstagramUsername(savedInstagramUsername);
  }, [savedWebhookUrl, savedInstagramUsername]);
  
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
    if (business) {
      await saveCampaignMutation.mutateAsync({
        businessId: business.id,
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
      business: business ? {
        id: business.id,
        name: business.name
      } : null,
      timestamp: new Date().toISOString(),
      source: "Instagram Campaign",
      campaignType: "Geographic Targeting"
    };
    
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // Added for cross-origin requests
        body: JSON.stringify(campaignData),
      });
      
      toast({
        title: "Campaign data sent to n8n",
        description: "Your campaign data was successfully sent to your n8n webhook.",
      });
      
      console.log("n8n webhook triggered with data:", campaignData);
      setMessageText("");
      setReachInNumbers("");
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Error",
        description: "There was an error sending your campaign data to the webhook.",
        variant: "destructive"
      });
    }
  };
  
  const handleTestWebhook = async () => {
    try {
      const testData = {
        test: true,
        message: "Test webhook connection",
        timestamp: new Date().toISOString(),
        source: "Instagram Campaign Test"
      };
      
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify(testData)
      });
      
      toast({
        title: "Webhook Test",
        description: "Test data sent to n8n webhook"
      });
      console.log("Test webhook sent:", testData);
    } catch (err) {
      console.error("Webhook test error:", err);
      toast({
        title: "Webhook Test Failed",
        description: "Could not send test data to webhook",
        variant: "destructive"
      });
    }
  };

  const handleSaveSettings = () => {
    saveSettingsMutation.mutateAsync({ 
      key: 'n8nWebhookUrl', 
      value: webhookUrl 
    });
    
    saveSettingsMutation.mutateAsync({ 
      key: 'instagramUsername', 
      value: instagramUsername 
    });
    
    toast({
      title: "Settings Saved",
      description: "Your Instagram campaign settings have been saved."
    });
  };

  // If no businessId is provided, show a business selector
  if (!businessId && businesses.length > 0) {
    return (
      <MainLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Select a Business</h1>
          <p className="text-clari-muted mt-1">
            Choose a business to manage Instagram campaigns
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <Card 
              key={business.id} 
              className="cursor-pointer bg-clari-darkCard border-clari-darkAccent hover:border-clari-gold transition-colors"
              onClick={() => navigate(`/instagram-campaigns/${business.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Instagram className="text-clari-gold" />
                  <h3 className="text-xl font-medium">{business.name}</h3>
                </div>
                <p className="text-sm text-clari-muted">
                  Manage Instagram campaigns for {business.name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link to={businessId ? `/business/${businessId}` : "/businesses"} className="gap-2">
            <ArrowLeft size={16} />
            {businessId ? "Back to Business" : "Back to Businesses"}
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Instagram Campaigns</h1>
          <p className="text-clari-muted mt-1">
            {business ? `Create and manage targeted Instagram campaigns for ${business.name}` : 'Create and manage targeted Instagram campaigns'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleTestWebhook}
            variant="outline"
            className="gap-2"
          >
            <Webhook size={16} />
            Test Webhook
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings size={16} />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-clari-darkCard border-clari-darkAccent">
              <DialogHeader>
                <DialogTitle>Instagram Campaign Settings</DialogTitle>
                <DialogDescription>
                  Configure your n8n webhook URL and Instagram credentials
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">n8n Webhook URL</Label>
                  <Input 
                    id="webhookUrl"
                    placeholder="https://your-n8n.com/webhook/xyz" 
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="border-clari-darkAccent bg-clari-darkBg"
                  />
                  <p className="text-xs text-clari-muted">This is the webhook URL from your n8n workflow</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instagramUsername">Instagram Username</Label>
                  <Input 
                    id="instagramUsername" 
                    placeholder="your_instagram_username"
                    value={instagramUsername}
                    onChange={(e) => setInstagramUsername(e.target.value)}
                    className="border-clari-darkAccent bg-clari-darkBg"
                  />
                  <p className="text-xs text-clari-muted">
                    Your Instagram username - password should be set as an environment variable in n8n
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleSaveSettings}
                >
                  Save Settings
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90">
            <Instagram size={16} />
            Connect Instagram
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
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

          <Card className="bg-clari-darkCard border-clari-darkAccent mt-6">
            <CardHeader>
              <CardTitle>Campaign Schedule</CardTitle>
              <CardDescription>Upcoming planned campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Summer Sale", date: "May 15, 2025", type: "Promotional" },
                  { name: "Product Launch", date: "June 1, 2025", type: "Announcement" },
                ].map((event, index) => (
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
        </div>
      </div>
    </MainLayout>
  );
};

export default InstagramCampaigns;
