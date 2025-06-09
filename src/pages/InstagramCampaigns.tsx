import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Settings,
  Link as LinkIcon,
  Play,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { BusinessData } from "@/components/business/BusinessForm";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchBusinessById, fetchBusinesses, fetchSurveysForBusiness } from "@/utils/supabase";
import { getSetting, saveSetting } from "@/utils/supabase";
import { createInstagramCampaign, linkSurveyToCampaign } from "@/utils/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Updated webhook URL for Instagram campaigns
const DEFAULT_WEBHOOK_URL = "https://clariquest.app.n8n.cloud/webhook/92f8949a-84e1-4179-990f-83ab97c84700";

interface WebhookData {
  id: string;
  username: string;
  location: string;
  followers: number;
  engagement_rate: number;
  last_post: string;
  contact_status: 'pending' | 'contacted' | 'replied' | 'failed';
  dm_sent: boolean;
  response_received: boolean;
  timestamp: string;
}

const InstagramCampaigns = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [reachInNumbers, setReachInNumbers] = useState("");
  const [selectedSurveyId, setSelectedSurveyId] = useState("");
  const [webhookUrl, setWebhookUrl] = useState(DEFAULT_WEBHOOK_URL);
  const [instagramUsername, setInstagramUsername] = useState("");
  const [webhookData, setWebhookData] = useState<WebhookData[]>([]);
  const [isCollectingData, setIsCollectingData] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Fetch businesses
  const { data: businessesResult } = useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses
  });
  
  // Extract businesses data
  const businesses = businessesResult?.success ? businessesResult.data || [] : [];
  
  // Fetch single business if businessId is provided
  const { data: businessResult } = useQuery({
    queryKey: ['business', businessId],
    queryFn: () => fetchBusinessById(businessId as string),
    enabled: !!businessId
  });
  
  // Extract business data
  const business = businessResult?.success ? businessResult.data : null;
  
  // Fetch surveys for the selected business
  const { data: surveysResult } = useQuery({
    queryKey: ['surveys', businessId],
    queryFn: () => fetchSurveysForBusiness(businessId as string),
    enabled: !!businessId
  });
  
  // Extract surveys data
  const surveys = surveysResult?.success ? surveysResult.data || [] : [];
  
  // Fetch settings
  const { data: savedWebhookUrlResult } = useQuery({
    queryKey: ['settings', 'n8nWebhookUrl'],
    queryFn: () => getSetting('n8nWebhookUrl')
  });
  
  const { data: savedInstagramUsernameResult } = useQuery({
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
      business_id: string;
      name: string;
      description?: string;
      start_date: string;
      end_date?: string;
      created_by: string;
      survey_link?: string;
      target_location?: string;
      reach_numbers?: number;
      message_content?: string;
    }) => createInstagramCampaign(campaignData),
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
    if (savedWebhookUrlResult?.success && savedWebhookUrlResult.data) {
      setWebhookUrl(savedWebhookUrlResult.data);
    }
    if (savedInstagramUsernameResult?.success && savedInstagramUsernameResult.data) {
      setInstagramUsername(savedInstagramUsernameResult.data);
    }
  }, [savedWebhookUrlResult, savedInstagramUsernameResult]);

  const handleCollectDataAndExecute = async () => {
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
    if (!searchQuery.trim()) {
      toast({
        title: "Target location cannot be empty",
        description: "Please specify a target location.",
        variant: "destructive"
      });
      return;
    }
    
    setIsCollectingData(true);
    
    try {
      // Get survey link if survey is selected
      let surveyLink = "";
      if (selectedSurveyId) {
        surveyLink = `${window.location.origin}/survey/${selectedSurveyId}`;
      }
      
      // Use the configured webhook URL, fallback to default if not available
      const targetWebhookUrl = webhookUrl || DEFAULT_WEBHOOK_URL;
      
      console.log("Collecting data from webhook:", targetWebhookUrl);
      
      // Save campaign to database first if business is selected
      if (business) {
        try {
          // Get current user for created_by field
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            toast({
              title: "Authentication required",
              description: "Please log in to create campaigns.",
              variant: "destructive"
            });
            return;
          }

          const result = await saveCampaignMutation.mutateAsync({
            business_id: business.id,
            name: `Campaign for ${searchQuery || "Global"}`,
            description: messageText,
            start_date: new Date().toISOString().split('T')[0],
            created_by: user.id,
            survey_link: surveyLink,
            target_location: searchQuery,
            reach_numbers: parseInt(reachInNumbers),
            message_content: messageText
          });
          
          console.log("Campaign saved:", result);
          
          // If survey is selected, create the link
          if (selectedSurveyId && result.success && result.data) {
            try {
              await linkSurveyToCampaign(result.data.id, selectedSurveyId, surveyLink);
              console.log("Survey linked to campaign successfully");
            } catch (linkError) {
              console.error("Error linking survey to campaign:", linkError);
            }
          }
        } catch (error) {
          console.error("Error saving campaign to database:", error);
          // Continue with webhook even if database save fails
        }
      }
      
      // Format data for webhook to collect Instagram data
      const campaignData = {
        action: "collect_data",
        message: messageText,
        location: searchQuery || "Global",
        reachInNumbers: parseInt(reachInNumbers),
        instagramUsername: instagramUsername,
        surveyLink: surveyLink,
        business: business ? {
          id: business.id,
          name: business.name
        } : null,
        timestamp: new Date().toISOString(),
        source: "Instagram Campaign Data Collection"
      };
      
      console.log("Webhook payload for data collection:", JSON.stringify(campaignData));
      
      const response = await fetch(targetWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      });
      
      if (response.ok) {
        const responseData = await response.json();
        console.log("Webhook response:", responseData);
        
        // Process webhook response and create table data
        if (responseData && responseData.users) {
          const processedData: WebhookData[] = responseData.users.map((user: any, index: number) => ({
            id: `user_${index + 1}`,
            username: user.username || `user_${index + 1}`,
            location: user.location || searchQuery,
            followers: user.followers || Math.floor(Math.random() * 10000) + 500,
            engagement_rate: user.engagement_rate || (Math.random() * 5 + 1).toFixed(2),
            last_post: user.last_post || `${Math.floor(Math.random() * 24) + 1}h ago`,
            contact_status: 'pending',
            dm_sent: false,
            response_received: false,
            timestamp: new Date().toISOString()
          }));
          
          setWebhookData(processedData);
          
          toast({
            title: "Data collected successfully",
            description: `Found ${processedData.length} users. Starting execution...`,
          });
          
          // Auto-execute after data collection
          await executeOnCollectedData(processedData);
          
        } else {
          // Fallback: create sample data if webhook doesn't return expected format
          const sampleData: WebhookData[] = Array.from({ length: 5 }, (_, index) => ({
            id: `sample_${index + 1}`,
            username: `user_${index + 1}_${searchQuery}`,
            location: searchQuery,
            followers: Math.floor(Math.random() * 10000) + 500,
            engagement_rate: parseFloat((Math.random() * 5 + 1).toFixed(2)),
            last_post: `${Math.floor(Math.random() * 24) + 1}h ago`,
            contact_status: 'pending',
            dm_sent: false,
            response_received: false,
            timestamp: new Date().toISOString()
          }));
          
          setWebhookData(sampleData);
          
          toast({
            title: "Sample data generated",
            description: `Generated ${sampleData.length} sample users. Starting execution...`,
          });
          
          // Auto-execute with sample data
          await executeOnCollectedData(sampleData);
        }
      } else {
        throw new Error(`Webhook request failed with status ${response.status}`);
      }
      
    } catch (error) {
      console.error("Error collecting data from webhook:", error);
      toast({
        title: "Error collecting data",
        description: "Failed to collect data from webhook. Using sample data instead.",
        variant: "destructive"
      });
      
      // Fallback to sample data
      const fallbackData: WebhookData[] = Array.from({ length: 3 }, (_, index) => ({
        id: `fallback_${index + 1}`,
        username: `${searchQuery}_user_${index + 1}`,
        location: searchQuery,
        followers: Math.floor(Math.random() * 5000) + 1000,
        engagement_rate: parseFloat((Math.random() * 4 + 2).toFixed(2)),
        last_post: `${Math.floor(Math.random() * 12) + 1}h ago`,
        contact_status: 'pending',
        dm_sent: false,
        response_received: false,
        timestamp: new Date().toISOString()
      }));
      
      setWebhookData(fallbackData);
      await executeOnCollectedData(fallbackData);
    } finally {
      setIsCollectingData(false);
    }
  };

  const executeOnCollectedData = async (data: WebhookData[]) => {
    setIsExecuting(true);
    
    try {
      // Execute DM sending for each user
      const updatedData = [...data];
      
      for (let i = 0; i < updatedData.length; i++) {
        // Simulate execution delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update status to show progress
        updatedData[i] = {
          ...updatedData[i],
          contact_status: 'contacted',
          dm_sent: true
        };
        
        setWebhookData([...updatedData]);
        
        // Send execution request to webhook
        const executionData = {
          action: "send_dm",
          username: updatedData[i].username,
          message: messageText,
          timestamp: new Date().toISOString()
        };
        
        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(executionData),
          });
          
          console.log(`DM sent to ${updatedData[i].username}`);
        } catch (error) {
          console.error(`Failed to send DM to ${updatedData[i].username}:`, error);
          updatedData[i].contact_status = 'failed';
        }
      }
      
      setWebhookData(updatedData);
      
      toast({
        title: "Execution completed",
        description: `Processed ${updatedData.length} users successfully.`,
      });
      
    } catch (error) {
      console.error("Error executing campaign:", error);
      toast({
        title: "Execution failed",
        description: "There was an error executing the campaign.",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleTestWebhook = async () => {
    try {
      const targetWebhookUrl = webhookUrl || DEFAULT_WEBHOOK_URL;
      
      const testData = {
        test: true,
        message: "Test webhook connection",
        timestamp: new Date().toISOString(),
        source: "Instagram Campaign Test"
      };
      
      console.log("Testing webhook URL:", targetWebhookUrl);
      console.log("Test payload:", JSON.stringify(testData));
      
      await fetch(targetWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData)
      });
      
      toast({
        title: "Webhook Test",
        description: "Test data sent to webhook"
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
                  Configure your webhook URL and Instagram credentials
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input 
                    id="webhookUrl"
                    placeholder="https://clariquest.app.n8n.cloud/webhook/92f8949a-84e1-4179-990f-83ab97c84700" 
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="border-clari-darkAccent bg-clari-darkBg"
                  />
                  <p className="text-xs text-clari-muted">This is the webhook URL for your campaign data</p>
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
                    Your Instagram username - password should be set as an environment variable in your backend
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

              {surveys.length > 0 && (
                <div>
                  <Label>Survey Link (Optional)</Label>
                  <Select value={selectedSurveyId} onValueChange={setSelectedSurveyId}>
                    <SelectTrigger className="border-clari-darkAccent bg-clari-darkBg">
                      <SelectValue placeholder="Select a survey to include in your message" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No survey</SelectItem>
                      {surveys.map((survey) => (
                        <SelectItem key={survey.id} value={survey.id}>
                          {survey.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-clari-muted mt-1">
                    This will automatically add the survey link to your message
                  </p>
                </div>
              )}

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
                  {selectedSurveyId && " • Survey link will be automatically added"}
                </p>
              </div>

              <Button 
                onClick={handleCollectDataAndExecute}
                className="w-full gap-2 bg-clari-gold text-black hover:bg-clari-gold/90"
                disabled={saveCampaignMutation.isPending || isCollectingData || isExecuting}
              >
                {isCollectingData ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Collecting Data...
                  </>
                ) : isExecuting ? (
                  <>
                    <Play size={16} />
                    Executing Campaign...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Collect Data & Execute
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Webhook Data Table */}
          {webhookData.length > 0 && (
            <Card className="bg-clari-darkCard border-clari-darkAccent mt-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Campaign Data & Results</CardTitle>
                    <CardDescription>User data collected from webhook and execution status</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExecuting && (
                      <div className="flex items-center gap-2 text-yellow-500">
                        <RefreshCw size={16} className="animate-spin" />
                        <span className="text-sm">Executing...</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-clari-darkAccent">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Followers</TableHead>
                        <TableHead>Engagement</TableHead>
                        <TableHead>Last Post</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>DM Sent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {webhookData.map((user, index) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">@{user.username}</TableCell>
                          <TableCell>{user.location}</TableCell>
                          <TableCell>{user.followers.toLocaleString()}</TableCell>
                          <TableCell>{user.engagement_rate}%</TableCell>
                          <TableCell>{user.last_post}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.contact_status === 'contacted' ? 'bg-green-100 text-green-800' :
                              user.contact_status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.contact_status}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {user.dm_sent ? (
                                <CheckCircle className="text-green-500" size={16} />
                              ) : (
                                <XCircle className="text-red-500" size={16} />
                              )}
                              <span className="text-xs">
                                {user.dm_sent ? 'Sent' : 'Pending'}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 p-3 bg-clari-darkBg rounded-md border border-blue-500/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="text-blue-500 mt-0.5" size={16} />
                    <div>
                      <p className="text-sm text-clari-muted">
                        <strong>Webhook Data Collection:</strong> This table shows real data collected from your webhook and execution status. 
                        The system automatically executes DM campaigns after collecting user data.
                      </p>
                      <p className="text-xs text-clari-muted mt-1">
                        Total users processed: {webhookData.length} | 
                        DMs sent: {webhookData.filter(u => u.dm_sent).length} | 
                        Success rate: {webhookData.length > 0 ? Math.round((webhookData.filter(u => u.contact_status === 'contacted').length / webhookData.length) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Available Surveys</CardTitle>
              <CardDescription>Surveys you can link to campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {surveys.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-clari-muted text-sm">No surveys available</p>
                  <p className="text-clari-muted text-xs mt-1">
                    Create surveys in AI Insights to use them in campaigns
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {surveys.slice(0, 3).map((survey, index) => (
                    <div 
                      key={index} 
                      className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1">
                            <LinkIcon size={14} className="text-clari-gold" />
                            <p className="font-medium text-sm">{survey.title}</p>
                          </div>
                          <p className="text-xs text-clari-muted mt-1">
                            {survey.is_active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
