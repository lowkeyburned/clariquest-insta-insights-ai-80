
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft,
  Download,
  Code,
  Instagram,
  Play,
  Copy,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface CampaignUser {
  instagramUsername: string;
  ownerFullName: string;
  location: string;
  dmMessage: string;
}

const PythonScript = () => {
  const { businessId } = useParams();
  const { toast } = useToast();
  
  const [instagramUsername, setInstagramUsername] = useState("clari_quest2");
  const [instagramPassword, setInstagramPassword] = useState("SawaaF@234!!!");
  const [campaignData, setCampaignData] = useState<CampaignUser[]>([]);
  const [copied, setCopied] = useState(false);

  // Load campaign data from localStorage (this would be passed from the campaign page)
  useEffect(() => {
    const savedCampaignData = localStorage.getItem('instagram_campaign_data');
    if (savedCampaignData) {
      try {
        const data = JSON.parse(savedCampaignData);
        setCampaignData(data);
      } catch (error) {
        console.error('Error parsing campaign data:', error);
      }
    }
  }, []);

  const generatePythonScript = () => {
    const usernames = campaignData.map(user => user.instagramUsername);
    const messageMapping = campaignData.reduce((acc, user) => {
      acc[user.instagramUsername] = user.dmMessage;
      return acc;
    }, {} as Record<string, string>);

    return `from time import sleep
from instagrapi import Client
import json

# Instagram credentials
USERNAME = "${instagramUsername}"
PASSWORD = "${instagramPassword}"

# Target users and their personalized messages
TARGET_USERS_DATA = ${JSON.stringify(campaignData.map(user => ({
  username: user.instagramUsername,
  full_name: user.ownerFullName,
  location: user.location,
  message: user.dmMessage
})), null, 4)}

def main():
    try:
        # Initialize the client
        cl = Client()
        print(f"Attempting to login as {USERNAME}...")

        # Login to Instagram
        cl.login(USERNAME, PASSWORD)
        print("Login successful!")
        
        success_count = 0
        failed_count = 0
        
        # Send personalized message to each target user
        for user_data in TARGET_USERS_DATA:
            username = user_data['username']
            full_name = user_data['full_name']
            location = user_data['location']
            message = user_data['message']
            
            try:
                print(f"Looking up user {username} ({full_name})...")
                user_id = cl.user_id_from_username(username)

                print(f"Sending personalized message to {username}...")
                cl.direct_send(message, [user_id])
                print(f"✓ Message successfully sent to {username} ({full_name})")
                success_count += 1

                # Sleep to avoid being rate limited
                print(f"Waiting 30 seconds before next message...")
                sleep(30)

            except Exception as e:
                print(f"✗ Failed to send message to {username}: {e}")
                failed_count += 1
                # Continue with next user even if one fails
                continue

        print(f"\\nCampaign complete!")
        print(f"✓ Successfully sent: {success_count} messages")
        print(f"✗ Failed to send: {failed_count} messages")
        print(f"Total users targeted: {len(TARGET_USERS_DATA)}")

    except Exception as e:
        print(f"An error occurred during login or setup: {e}")


if __name__ == "__main__":
    main()
`;
  };

  const handleCopyScript = async () => {
    const script = generatePythonScript();
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      toast({
        title: "Script copied!",
        description: "Python script has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please select and copy manually.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadScript = () => {
    const script = generatePythonScript();
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'instagram_campaign_sender.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Script downloaded!",
      description: "Python script has been saved to your downloads folder.",
    });
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link to={businessId ? `/instagram-campaigns/${businessId}` : "/instagram-campaigns"} className="gap-2">
            <ArrowLeft size={16} />
            Back to Campaign
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Python Script Generator</h1>
          <p className="text-clari-muted mt-1">
            Generate and download Python script to send Instagram messages
          </p>
        </div>
        <Badge variant="outline" className="bg-clari-gold/10 text-clari-gold border-clari-gold/30">
          <Instagram size={14} className="mr-1" />
          {campaignData.length} Users Ready
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="text-clari-gold" size={20} />
                Instagram Credentials
              </CardTitle>
              <CardDescription>Configure your Instagram account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username">Instagram Username</Label>
                <Input 
                  id="username"
                  value={instagramUsername}
                  onChange={(e) => setInstagramUsername(e.target.value)}
                  className="border-clari-darkAccent bg-clari-darkBg"
                  placeholder="your_instagram_username"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Instagram Password</Label>
                <Input 
                  id="password"
                  type="password"
                  value={instagramPassword}
                  onChange={(e) => setInstagramPassword(e.target.value)}
                  className="border-clari-darkAccent bg-clari-darkBg"
                  placeholder="your_password"
                />
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-xs text-yellow-400">
                  <strong>Security Note:</strong> Make sure to use app-specific passwords or consider using environment variables in production.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Preview */}
          <Card className="bg-clari-darkCard border-clari-darkAccent mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Play className="text-green-400" size={18} />
                Campaign Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-clari-muted">Total Users:</span>
                  <span className="text-clari-text font-medium">{campaignData.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-clari-muted">Est. Duration:</span>
                  <span className="text-clari-text font-medium">
                    {Math.ceil(campaignData.length * 0.5)} minutes
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-clari-muted">Rate Limit:</span>
                  <span className="text-clari-text font-medium">30s between messages</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Script Display Panel */}
        <div className="lg:col-span-2">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="text-clari-gold" size={20} />
                    Generated Python Script
                  </CardTitle>
                  <CardDescription>Ready-to-run script for your Instagram campaign</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCopyScript}
                    variant="outline"
                    className="gap-2"
                    disabled={campaignData.length === 0}
                  >
                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button 
                    onClick={handleDownloadScript}
                    className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90"
                    disabled={campaignData.length === 0}
                  >
                    <Download size={16} />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {campaignData.length > 0 ? (
                <div className="relative">
                  <Textarea 
                    value={generatePythonScript()}
                    readOnly
                    className="font-mono text-sm min-h-[500px] bg-clari-darkBg border-clari-darkAccent resize-none"
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <Code className="mx-auto text-clari-muted mb-4" size={48} />
                  <p className="text-clari-muted text-lg">No campaign data available</p>
                  <p className="text-clari-muted text-sm mt-2">
                    Please go back to the campaign page and collect user data first
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Installation Instructions */}
          <Card className="bg-clari-darkCard border-clari-darkAccent mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Installation Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-clari-darkBg rounded-lg border border-clari-darkAccent">
                  <p className="text-sm font-medium mb-2">1. Install required library:</p>
                  <code className="text-xs bg-black/50 p-2 rounded block">pip install instagrapi</code>
                </div>
                
                <div className="p-3 bg-clari-darkBg rounded-lg border border-clari-darkAccent">
                  <p className="text-sm font-medium mb-2">2. Save the script as a .py file</p>
                  <p className="text-xs text-clari-muted">Download or copy the script above</p>
                </div>
                
                <div className="p-3 bg-clari-darkBg rounded-lg border border-clari-darkAccent">
                  <p className="text-sm font-medium mb-2">3. Run the script:</p>
                  <code className="text-xs bg-black/50 p-2 rounded block">python instagram_campaign_sender.py</code>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-400">
                  <strong>Note:</strong> The script includes built-in rate limiting (30 seconds between messages) 
                  to comply with Instagram's API guidelines and avoid account restrictions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default PythonScript;
