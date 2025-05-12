
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveSetting } from "@/utils/supabaseHelpers";
import { useToast } from "@/components/ui/use-toast";
import { sendToWebhooks, DEFAULT_WEBHOOK_URL, SECONDARY_WEBHOOK_URL } from "@/utils/webhookUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Instagram, Settings, Webhook } from "lucide-react";

interface CampaignSettingsProps {
  webhookUrl: string;
  instagramUsername: string;
  onSettingsChange: (settings: { webhookUrl: string; instagramUsername: string }) => void;
}

const CampaignSettings = ({ webhookUrl, instagramUsername, onSettingsChange }: CampaignSettingsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [localWebhookUrl, setLocalWebhookUrl] = useState(webhookUrl);
  const [localInstagramUsername, setLocalInstagramUsername] = useState(instagramUsername);
  
  const saveSettingsMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => saveSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
  });
  
  const handleTestWebhook = async () => {
    try {
      const testData = {
        test: true,
        message: "Test webhook connection",
        timestamp: new Date().toISOString(),
        source: "Instagram Campaign Test"
      };
      
      // Send to both webhook URLs for testing
      const result = await sendToWebhooks(localWebhookUrl || DEFAULT_WEBHOOK_URL, testData, { useSecondary: true });
      
      if (result.success) {
        toast({
          title: "Webhook Test",
          description: "Test data sent to all configured webhooks"
        });
        console.log("Test webhook sent:", testData);
      } else {
        throw new Error("Failed to send test data");
      }
    } catch (err) {
      console.error("Webhook test error:", err);
      toast({
        title: "Webhook Test Failed",
        description: "Could not send test data to webhooks",
        variant: "destructive"
      });
    }
  };
  
  const handleSaveSettings = () => {
    saveSettingsMutation.mutateAsync({ 
      key: 'n8nWebhookUrl', 
      value: localWebhookUrl 
    });
    
    saveSettingsMutation.mutateAsync({ 
      key: 'instagramUsername', 
      value: localInstagramUsername 
    });
    
    toast({
      title: "Settings Saved",
      description: "Your Instagram campaign settings have been saved."
    });
    
    // Update parent component state
    onSettingsChange({
      webhookUrl: localWebhookUrl,
      instagramUsername: localInstagramUsername
    });
  };
  
  return (
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
                value={localWebhookUrl}
                onChange={(e) => setLocalWebhookUrl(e.target.value)}
                className="border-clari-darkAccent bg-clari-darkBg"
              />
              <p className="text-xs text-clari-muted">This is the webhook URL from your n8n workflow</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secondaryWebhookUrl">Secondary Webhook URL (Read-only)</Label>
              <Input 
                id="secondaryWebhookUrl" 
                value={SECONDARY_WEBHOOK_URL}
                readOnly
                className="border-clari-darkAccent bg-clari-darkBg text-clari-muted"
              />
              <p className="text-xs text-clari-muted">
                This webhook URL will also receive campaign data
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instagramUsername">Instagram Username</Label>
              <Input 
                id="instagramUsername" 
                placeholder="your_instagram_username"
                value={localInstagramUsername}
                onChange={(e) => setLocalInstagramUsername(e.target.value)}
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
  );
};

export default CampaignSettings;
