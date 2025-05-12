
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

import MainLayout from "@/components/layout/MainLayout";
import BusinessSelector from "@/components/instagram/BusinessSelector";
import CampaignForm from "@/components/instagram/CampaignForm";
import CampaignSettings from "@/components/instagram/CampaignSettings";
import ActiveCampaigns from "@/components/instagram/ActiveCampaigns";
import CampaignSchedule from "@/components/instagram/CampaignSchedule";

import { fetchBusinessById, fetchBusinesses, getSetting } from "@/utils/supabaseHelpers";
import { DEFAULT_WEBHOOK_URL } from "@/utils/webhookUtils";

// Define proper typing for businesses to match BusinessData type
type Business = {
  id: string;  // Changed from number to string to match Supabase data
  name: string;
  description?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
};

const InstagramCampaigns = () => {
  const { businessId } = useParams();
  const { toast } = useToast();
  
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
  
  // Set initial values from fetched settings
  useEffect(() => {
    if (savedWebhookUrl) setWebhookUrl(savedWebhookUrl);
    if (savedInstagramUsername) setInstagramUsername(savedInstagramUsername);
  }, [savedWebhookUrl, savedInstagramUsername]);
  
  const handleSettingsChange = (settings: { webhookUrl: string; instagramUsername: string }) => {
    setWebhookUrl(settings.webhookUrl);
    setInstagramUsername(settings.instagramUsername);
  };

  // If no businessId is provided, show a business selector
  if (!businessId && businesses.length > 0) {
    return (
      <MainLayout>
        <BusinessSelector businesses={businesses as any[]} />
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
        
        <CampaignSettings 
          webhookUrl={webhookUrl}
          instagramUsername={instagramUsername}
          onSettingsChange={handleSettingsChange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CampaignForm 
            businessId={business?.id}
            businessName={business?.name}
            webhookUrl={webhookUrl}
            instagramUsername={instagramUsername}
          />
        </div>

        <div>
          <ActiveCampaigns />
          <CampaignSchedule />
        </div>
      </div>
    </MainLayout>
  );
};

export default InstagramCampaigns;
