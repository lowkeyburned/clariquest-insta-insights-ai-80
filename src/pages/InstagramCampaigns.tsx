import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Instagram, 
  Send, 
  MapPin, 
  Search,
  ArrowLeft,
  Webhook,
  Settings,
  Link as LinkIcon,
  RefreshCw,
  CheckCircle,
  Calendar,
  Eye,
  Check,
  ChevronsUpDown,
  Users,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchBusinessById, fetchBusinesses, fetchSurveysForBusiness } from "@/utils/supabase";
import { getSetting, saveSetting } from "@/utils/supabase";
import { createInstagramCampaign, linkSurveyToCampaign } from "@/utils/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DEFAULT_WEBHOOK_URL = "https://clariquest.app.n8n.cloud/webhook/92f8949a-84e1-4179-990f-83ab97c84700";

// Popular cities and specific areas within cities for the dropdown
const POPULAR_CITIES = [
  // Dubai Areas
  "Dubai Marina", "Downtown Dubai", "Dubai Silicon Oasis", "Jumeirah", "Deira", "Bur Dubai", "Business Bay", 
  "Dubai Investment Park", "Jumeirah Beach Residence (JBR)", "Palm Jumeirah", "Dubai Sports City", "Motor City",
  "Arabian Ranches", "Emirates Hills", "Dubai Hills Estate", "Mirdif", "Festival City", "International City",
  "Dubai South", "Al Barsha", "Jumeirah Village Circle", "Discovery Gardens", "Dubai Healthcare City",
  "Dubai Internet City", "Dubai Media City", "Dubai Knowledge Park", "Dubai Studio City", "Dubai Production City",
  "Al Satwa", "Karama", "Oud Metha", "Al Garhoud", "Al Qusais", "Nahda", "Mamzar", "Al Rashidiya",
  "Al Mizhar", "Al Warqa", "Al Khawaneej", "Al Barari", "Mudon", "Remraam", "Town Square", "Damac Hills",
  
  // Abu Dhabi Areas
  "Abu Dhabi Marina", "Corniche", "Al Reem Island", "Yas Island", "Saadiyat Island", "Al Raha Beach",
  "Khalifa City", "Al Reef", "Al Ghadeer", "Masdar City", "Al Bateen", "Tourist Club Area", "Electra Street",
  "Hamdan Street", "Al Zahiyah", "Al Markaziyah", "Al Mushrif", "Mohammed Bin Zayed City", "Shakhbout City",
  
  // Sharjah Areas
  "Al Nahda Sharjah", "Al Majaz", "Al Khan", "Al Qasba", "University City", "Al Taawun", "Al Qulayaah",
  "Muwailih", "Al Dhait", "Tilal City", "Wasit", "Al Ramtha", "Al Suyoh", "King Faisal Street",
  
  // US Cities and Areas
  "Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island", "Beverly Hills", "Hollywood", "Santa Monica",
  "Venice Beach", "Downtown LA", "West Hollywood", "Pasadena", "Long Beach", "Malibu", "Burbank",
  "Chicago Loop", "Lincoln Park", "Wicker Park", "River North", "Gold Coast", "Old Town", "Lakeview",
  "Houston Heights", "Downtown Houston", "River Oaks", "Galleria", "Memorial", "Montrose", "Midtown Houston",
  "South Beach Miami", "Wynwood", "Brickell", "Coral Gables", "Coconut Grove", "Little Havana",
  
  // UK Areas
  "Central London", "Canary Wharf", "Camden", "Greenwich", "Shoreditch", "Notting Hill", "Kensington",
  "Chelsea", "Mayfair", "Soho", "Covent Garden", "Bank", "City of London", "Westminster", "Marylebone",
  "Paddington", "King's Cross", "London Bridge", "Bermondsey", "Clapham", "Brixton", "Hackney",
  
  // European Cities and Areas
  "Le Marais Paris", "Champs-Élysées", "Montmartre", "Saint-Germain", "Latin Quarter", "Bastille",
  "Mitte Berlin", "Kreuzberg", "Prenzlauer Berg", "Charlottenburg", "Friedrichshain", "Schöneberg",
  "Eixample Barcelona", "Gothic Quarter", "El Born", "Gràcia", "Park Güell Area", "Las Ramblas",
  "Centro Madrid", "Malasaña", "Chueca", "Salamanca", "La Latina", "Lavapiés", "Retiro",
  
  // Asian Cities and Areas
  "Shibuya", "Shinjuku", "Harajuku", "Ginza", "Akihabara", "Roppongi", "Asakusa", "Ikebukuro",
  "Gangnam Seoul", "Hongdae", "Myeongdong", "Itaewon", "Insadong", "Dongdaemun", "Apgujeong",
  "Central Hong Kong", "Tsim Sha Tsui", "Causeway Bay", "Wan Chai", "Mong Kok", "Admiralty",
  "Marina Bay Singapore", "Orchard Road", "Clarke Quay", "Chinatown Singapore", "Little India Singapore",
  "Sukhumvit Bangkok", "Silom", "Khao San Road", "Chatuchak", "Thonglor", "Ekkamai", "Asok",
  
  // Australian Cities and Areas
  "Sydney CBD", "Bondi Beach", "Manly", "Surry Hills", "Newtown", "Darlinghurst", "Paddington Sydney",
  "Melbourne CBD", "St Kilda", "Fitzroy", "Carlton", "Richmond Melbourne", "South Yarra", "Toorak",
  "Brisbane City", "South Bank Brisbane", "New Farm", "Fortitude Valley", "West End Brisbane",
  
  // Canadian Cities and Areas
  "Downtown Toronto", "Entertainment District", "King West", "Queen West", "Distillery District",
  "Downtown Vancouver", "Gastown", "Yaletown", "Kitsilano", "West End Vancouver", "Coal Harbour",
  "Old Montreal", "Plateau Montreal", "Mile End", "Westmount", "Downtown Montreal",
  
  // Other Major Cities
  "Times Square", "SoHo NYC", "Tribeca", "Upper East Side", "Upper West Side", "East Village",
  "Castro San Francisco", "Mission District", "SOMA", "Nob Hill", "Pacific Heights", "Haight-Ashbury",
  "Copacabana", "Ipanema", "Leblon", "Barra da Tijuca", "Santa Teresa Rio", "Lapa Rio",
  "Palermo Buenos Aires", "San Telmo", "Puerto Madero", "Recoleta", "Belgrano", "Villa Crespo",
  "Polanco Mexico City", "Roma Norte", "Condesa", "Coyoacán", "Santa Fe Mexico City", "Del Valle"
];

interface WebhookInstagramData {
  instagramUsername: string;
  ownerFullName: string;
  location: string;
  dmMessage: string;
  profileUrl?: string;
  originalPost?: {
    postId: string;
    postUrl: string;
    caption: string;
    hashtags: string[];
    timestamp: string;
  };
}

const InstagramCampaigns = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [reachInNumbers, setReachInNumbers] = useState("");
  const [selectedSurveyId, setSelectedSurveyId] = useState("none");
  const [webhookUrl, setWebhookUrl] = useState(DEFAULT_WEBHOOK_URL);
  const [instagramUsername, setInstagramUsername] = useState("");
  const [webhookData, setWebhookData] = useState<WebhookInstagramData[]>([]);
  const [isCollectingData, setIsCollectingData] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [open, setOpen] = useState(false);
  
  // Fetch businesses
  const { data: businessesResult } = useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses
  });
  
  const businesses = businessesResult?.success ? businessesResult.data || [] : [];
  
  // Fetch single business if businessId is provided
  const { data: businessResult } = useQuery({
    queryKey: ['business', businessId],
    queryFn: () => fetchBusinessById(businessId as string),
    enabled: !!businessId
  });
  
  const business = businessResult?.success ? businessResult.data : null;
  
  // Fetch surveys for the selected business
  const { data: surveysResult } = useQuery({
    queryKey: ['surveys', businessId],
    queryFn: () => fetchSurveysForBusiness(businessId as string),
    enabled: !!businessId
  });
  
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      if (selectedSurveyId && selectedSurveyId !== "none") {
        surveyLink = `${window.location.origin}/survey/${selectedSurveyId}`;
      }
      
      const targetWebhookUrl = webhookUrl || DEFAULT_WEBHOOK_URL;
      
      console.log("Collecting data from webhook:", targetWebhookUrl);
      
      // Save campaign to database first if business is selected
      if (business) {
        try {
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
          
          if (selectedSurveyId && selectedSurveyId !== "none" && result.success && result.data) {
            try {
              await linkSurveyToCampaign(result.data.id, selectedSurveyId, surveyLink);
              console.log("Survey linked to campaign successfully");
            } catch (linkError) {
              console.error("Error linking survey to campaign:", linkError);
            }
          }
        } catch (error) {
          console.error("Error saving campaign to database:", error);
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
        
        // Handle the new response format with nested body array
        let instagramUsers: WebhookInstagramData[] = [];
        
        if (Array.isArray(responseData)) {
          // Direct array response
          instagramUsers = responseData;
        } else if (responseData && responseData.response && Array.isArray(responseData.response.body)) {
          // Nested response format
          instagramUsers = responseData.response.body;
        } else if (responseData && Array.isArray(responseData.body)) {
          // Response with body array
          instagramUsers = responseData.body;
        }
        
        if (instagramUsers.length > 0) {
          // Generate profile URLs if not provided
          const processedUsers = instagramUsers.map(user => ({
            ...user,
            profileUrl: user.profileUrl || `https://instagram.com/${user.instagramUsername}`
          }));
          
          setWebhookData(processedUsers);
          
          // Store campaign data in localStorage for the Python script page
          localStorage.setItem('instagram_campaign_data', JSON.stringify(processedUsers));
          
          toast({
            title: "Data collected successfully",
            description: `Found ${processedUsers.length} Instagram users from webhook.`,
          });
        } else {
          toast({
            title: "No data received",
            description: "The webhook didn't return any Instagram user data. Please check your webhook configuration.",
            variant: "destructive"
          });
        }
      } else {
        throw new Error(`Webhook request failed with status ${response.status}`);
      }
      
    } catch (error) {
      console.error("Error collecting data from webhook:", error);
      toast({
        title: "Error collecting data",
        description: "Failed to collect data from webhook. Please check your webhook configuration.",
        variant: "destructive"
      });
    } finally {
      setIsCollectingData(false);
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

  const handleSendMessages = () => {
    // Store campaign data and navigate to Python script page
    localStorage.setItem('instagram_campaign_data', JSON.stringify(webhookData));
    navigate(`/python-script${businessId ? `/${businessId}` : ''}`);
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

      <div className="space-y-6">
        {/* Main Campaign Creation Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Campaign Form - Takes 3 columns */}
          <div className="lg:col-span-3">
            <Card className="bg-clari-darkCard border-clari-darkAccent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="text-clari-gold" size={20} />
                  New Campaign
                </CardTitle>
                <CardDescription>Create a new targeted Instagram messaging campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Target Location</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between border-clari-darkAccent bg-clari-darkBg hover:bg-clari-darkBg/80"
                      >
                        {searchQuery
                          ? POPULAR_CITIES.find((city) => city.toLowerCase() === searchQuery.toLowerCase()) || searchQuery
                          : "Search for a city, area, or location..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0 bg-clari-darkCard border-clari-darkAccent">
                      <Command>
                        <CommandInput 
                          placeholder="Search cities, areas, neighborhoods..." 
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                          className="border-none bg-transparent"
                        />
                        <CommandList>
                          <CommandEmpty>
                            <div className="p-4 text-center">
                              <p className="text-clari-muted">No location found.</p>
                              <p className="text-xs text-clari-muted mt-1">
                                You can still type a custom location above.
                              </p>
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            {POPULAR_CITIES
                              .filter((city) =>
                                city.toLowerCase().includes(searchQuery.toLowerCase())
                              )
                              .slice(0, 15)
                              .map((city) => (
                                <CommandItem
                                  key={city}
                                  value={city}
                                  onSelect={(currentValue) => {
                                    setSearchQuery(currentValue === searchQuery ? "" : currentValue);
                                    setOpen(false);
                                  }}
                                  className="cursor-pointer hover:bg-clari-darkBg"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      searchQuery.toLowerCase() === city.toLowerCase() ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <MapPin className="mr-2 h-4 w-4 text-clari-muted" />
                                  {city}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                  <Label>Survey Link (Optional)</Label>
                  <Select value={selectedSurveyId} onValueChange={setSelectedSurveyId}>
                    <SelectTrigger className="border-clari-darkAccent bg-clari-darkBg">
                      <SelectValue placeholder="Select a survey to include in messages" />
                    </SelectTrigger>
                    <SelectContent className="bg-clari-darkCard border-clari-darkAccent">
                      <SelectItem value="none">No survey (messages only)</SelectItem>
                      {surveys.map((survey) => (
                        <SelectItem key={survey.id} value={survey.id}>
                          {survey.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedSurveyId && selectedSurveyId !== "none" && (
                    <p className="text-xs text-clari-muted mt-1">
                      Survey link will be automatically added to your messages
                    </p>
                  )}
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
                    {selectedSurveyId && selectedSurveyId !== "none" && " • Survey link will be automatically added"}
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
                  ) : (
                    <>
                      <Send size={16} />
                      Start Campaign
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Available Surveys - Takes 1 column */}
          <div className="lg:col-span-1">
            <Card className="bg-clari-darkCard border-clari-darkAccent h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LinkIcon className="text-clari-gold" size={18} />
                  Available Surveys
                </CardTitle>
                <CardDescription className="text-sm">Link surveys to your campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {surveys.length === 0 ? (
                  <div className="text-center py-6">
                    <LinkIcon className="mx-auto text-clari-muted mb-2" size={32} />
                    <p className="text-clari-muted text-sm">No surveys available</p>
                    <p className="text-clari-muted text-xs mt-1">
                      Create surveys in AI Insights
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {surveys.map((survey) => (
                        <div 
                          key={survey.id} 
                          className={cn(
                            "p-3 rounded-lg border transition-all cursor-pointer",
                            selectedSurveyId === survey.id 
                              ? "bg-clari-gold/10 border-clari-gold" 
                              : "bg-clari-darkBg/50 border-clari-darkAccent hover:border-clari-gold/50"
                          )}
                          onClick={() => setSelectedSurveyId(selectedSurveyId === survey.id ? "none" : survey.id)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm text-clari-text truncate pr-2">{survey.title}</h4>
                            <Badge 
                              variant={survey.is_active ? "default" : "secondary"}
                              className={cn(
                                "text-xs px-2 py-0.5",
                                survey.is_active ? "bg-green-500/20 text-green-400 border-green-500/30" : ""
                              )}
                            >
                              {survey.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-xs text-clari-muted mb-2 line-clamp-2">
                            {survey.description || 'No description available'}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-clari-muted">
                              <Calendar size={10} />
                              {formatDate(survey.created_at)}
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-6 px-2 text-xs"
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Link to={`/survey/${survey.id}`} target="_blank">
                                  <Eye size={10} className="mr-1" />
                                  View
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {selectedSurveyId && selectedSurveyId !== "none" && (
                      <div className="pt-2 border-t border-clari-darkAccent">
                        <div className="flex items-center gap-2 text-sm text-clari-gold">
                          <CheckCircle size={14} />
                          <span>Survey selected for campaign</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedSurveyId("none")}
                          className="w-full mt-2 h-8 text-xs"
                        >
                          Remove Selection
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instagram Campaign Results - Full Width */}
        {webhookData.length > 0 && (
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Instagram className="text-pink-400" size={20} />
                    Instagram Campaign Results
                  </CardTitle>
                  <CardDescription>Targeted users found for your campaign</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-clari-muted">
                    <Users size={16} />
                    <span>{webhookData.length} Users Found</span>
                  </div>
                  <Badge variant="outline" className="bg-clari-gold/10 text-clari-gold border-clari-gold/30">
                    {searchQuery || "Global"} Campaign
                  </Badge>
                  <Button 
                    onClick={handleSendMessages}
                    className="gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  >
                    <MessageSquare size={16} />
                    Generate Python Script ({webhookData.length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-clari-darkAccent overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-clari-darkBg/50 border-clari-darkAccent">
                      <TableHead className="font-semibold">User Profile</TableHead>
                      <TableHead className="font-semibold w-32">Location</TableHead>
                      <TableHead className="font-semibold">Message Content</TableHead>
                      <TableHead className="font-semibold w-32 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {webhookData.map((user, index) => (
                      <TableRow key={index} className="border-clari-darkAccent hover:bg-clari-darkBg/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                              {user.ownerFullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-clari-text truncate">{user.ownerFullName}</p>
                              <div className="flex items-center gap-1 text-sm text-clari-muted">
                                <Instagram size={12} />
                                <span className="truncate">@{user.instagramUsername}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                            <MapPin size={10} className="mr-1" />
                            {user.location}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <p className="text-sm text-clari-text whitespace-pre-wrap break-words line-clamp-3">
                              {user.dmMessage}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Button variant="outline" size="sm" asChild>
                              <a href={user.profileUrl || `https://instagram.com/${user.instagramUsername}`} target="_blank" rel="noopener noreferrer">
                                <Instagram size={12} className="mr-1" />
                                Profile
                              </a>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4 p-4 bg-gradient-to-r from-clari-gold/10 to-clari-gold/5 rounded-lg border border-clari-gold/20">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-clari-gold mt-0.5 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-medium text-clari-text">
                      Campaign Data Successfully Collected
                    </p>
                    <p className="text-xs text-clari-muted mt-1">
                      Found {webhookData.length} Instagram users in {webhookData[0]?.location || 'the target location'}. 
                      Click "Generate Python Script" to create the automated messaging script.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default InstagramCampaigns;
