
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
  CheckCircle,
  Link as LinkIcon
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface CampaignUser {
  instagramUsername: string;
  ownerFullName: string;
  location: string;
  dmMessage: string;
}

// Test users for development/testing
const TEST_USERS: CampaignUser[] = [
  {
    instagramUsername: "saifoo_234",
    ownerFullName: "Saif",
    location: "Dubai, UAE",
    dmMessage: "Hi Saif, we're testing our survey system. This is a test message! 😊 Check out our survey: {survey_link}"
  },
  {
    instagramUsername: "whospys.jj", 
    ownerFullName: "JJ",
    location: "Abu Dhabi, UAE",
    dmMessage: "Hello JJ! Your content is amazing! We have an exciting opportunity for you. Survey: {survey_link}"
  }
];

const PythonScript = () => {
  const { businessId } = useParams();
  const { toast } = useToast();
  
  const [instagramUsername, setInstagramUsername] = useState("clari_quest2");
  const [instagramPassword, setInstagramPassword] = useState("SawaaF@234!!!");
  const [surveyLink, setSurveyLink] = useState("https://yoursurvey.com/survey123");
  const [campaignData, setCampaignData] = useState<CampaignUser[]>([]);
  const [copied, setCopied] = useState(false);
  const [testingMode, setTestingMode] = useState(true);

  // Load campaign data from localStorage (this would be passed from the campaign page)
  useEffect(() => {
    const savedCampaignData = localStorage.getItem('instagram_campaign_data');
    if (savedCampaignData) {
      try {
        const data = JSON.parse(savedCampaignData);
        setCampaignData(data);
        // If real campaign data exists, suggest production mode
        if (data.length > 0) {
          setTestingMode(false);
        }
      } catch (error) {
        console.error('Error parsing campaign data:', error);
        // Use test users if parsing fails
        setCampaignData(TEST_USERS);
        setTestingMode(true);
      }
    } else {
      // Use test users if no campaign data is available
      setCampaignData(TEST_USERS);
      setTestingMode(true);
    }
  }, []);

  const generatePythonScript = () => {
    const dataToUse = testingMode ? TEST_USERS : (campaignData.length > 0 ? campaignData : TEST_USERS);

    return `# Instagram DM Sender for n8n
import time
import json

# Note: You'll need to install instagrapi in your n8n environment
# This code assumes instagrapi is available
try:
    from instagrapi import Client
except ImportError:
    print("Error: instagrapi not installed. Please install it in your n8n environment.")
    raise

# Instagram credentials
USERNAME = "${instagramUsername}"
PASSWORD = "${instagramPassword}"

# TESTING MODE: Set to True for testing, False for production
TESTING_MODE = ${testingMode ? 'True' : 'False'}  # Changed to ${testingMode ? 'True' : 'False'} for ${testingMode ? 'testing' : 'production'}

# Test users (only used when TESTING_MODE = True)
TEST_USERS = [
    "saifoo_234",
    "whospys.jj"
]

def main():
    # Get input data from n8n (for standalone script, we'll simulate this)
    if TESTING_MODE:
        input_data = []  # Empty for testing mode
    else:
        # In n8n, this would be: input_data = _input.all()
        input_data = []

    # Initialize the client
    cl = Client()
    print(f"Attempting to login as {USERNAME}...")

    try:
        # Login to Instagram
        cl.login(USERNAME, PASSWORD)
        print("Login successful!")

        if TESTING_MODE:
            # TESTING: Use hardcoded test users
            print("🧪 TESTING MODE: Using test users")
            users_to_message = []
            test_messages = [
                {
                    "username": "saifoo_234",
                    "message": "Hi Saif, we're testing our survey system. This is a test message! 😊 Check out our survey: ${surveyLink}"
                },
                {
                    "username": "whospys.jj",
                    "message": "Hello JJ! Your content is amazing! We have an exciting opportunity for you. Survey: ${surveyLink}"
                }
            ]
            
            for test_user in test_messages:
                users_to_message.append({
                    'instagramUsername': test_user['username'],
                    'dmMessage': test_user['message']
                })
        else:
            # PRODUCTION: Use data from n8n workflow
            print("🚀 PRODUCTION MODE: Using workflow data")
            users_to_message = []
            for item in input_data:
                # Replace {survey_link} placeholder with actual survey link
                user_data = item['json'].copy()
                if 'dmMessage' in user_data:
                    user_data['dmMessage'] = user_data['dmMessage'].replace('{survey_link}', '${surveyLink}')
                users_to_message.append(user_data)

        print(f"Processing {len(users_to_message)} users...")

        results = []
        
        # Send message to each target user
        for user_data in users_to_message:
            username = user_data['instagramUsername']
            message = user_data['dmMessage']
            
            try:
                print(f"Looking up user {username}...")
                user_id = cl.user_id_from_username(username)

                print(f"Sending message to {username}...")
                print(f"Message preview: {message[:50]}...")
                
                cl.direct_send(message, [user_id])
                print(f"✓ Message successfully sent to {username}")
                
                results.append({
                    'username': username,
                    'status': 'success',
                    'message_sent': message
                })

                # Sleep to avoid being rate limited
                if TESTING_MODE:
                    print(f"Waiting 10 seconds before next message (testing mode)...")
                    time.sleep(10)
                else:
                    print(f"Waiting 45 seconds before next message...")
                    time.sleep(45)

            except Exception as e:
                print(f"✗ Failed to send message to {username}: {e}")
                results.append({
                    'username': username,
                    'status': 'error',
                    'error': str(e)
                })
                continue

        print("All messages processed. Session complete.")
        
        # Create results summary
        result_summary = {
            'status': 'completed',
            'mode': 'testing' if TESTING_MODE else 'production',
            'total_users': len(users_to_message),
            'results': results,
            'summary': {
                'success_count': len([r for r in results if r['status'] == 'success']),
                'error_count': len([r for r in results if r['status'] == 'error'])
            }
        }
        
        print("\\n=== FINAL RESULTS ===")
        print(json.dumps(result_summary, indent=2))
        return result_summary

    except Exception as e:
        print(f"An error occurred during login or initialization: {e}")
        error_result = {
            'status': 'error',
            'error': str(e),
            'mode': 'testing' if TESTING_MODE else 'production'
        }
        print("\\n=== ERROR RESULT ===")
        print(json.dumps(error_result, indent=2))
        return error_result

# Run the main function when script is executed directly
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

  const dataToUse = testingMode ? TEST_USERS : (campaignData.length > 0 ? campaignData : TEST_USERS);

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
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-clari-gold/10 text-clari-gold border-clari-gold/30">
            <Instagram size={14} className="mr-1" />
            {dataToUse.length} Users Ready
          </Badge>
          <Badge variant="outline" className={testingMode ? "bg-blue-500/10 text-blue-400 border-blue-500/30" : "bg-green-500/10 text-green-400 border-green-500/30"}>
            {testingMode ? "Test Mode" : "Production Mode"}
          </Badge>
        </div>
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

              <div>
                <Label htmlFor="surveyLink" className="flex items-center gap-2">
                  <LinkIcon size={16} />
                  Survey Link
                </Label>
                <Input 
                  id="surveyLink"
                  value={surveyLink}
                  onChange={(e) => setSurveyLink(e.target.value)}
                  className="border-clari-darkAccent bg-clari-darkBg"
                  placeholder="https://yoursurvey.com/survey123"
                />
                <p className="text-xs text-clari-muted mt-1">
                  This link will be included in all messages
                </p>
              </div>

              <div>
                <Label>Mode Selection</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={testingMode ? "default" : "outline"}
                    onClick={() => setTestingMode(true)}
                    className="flex-1"
                  >
                    Test Mode
                  </Button>
                  <Button
                    variant={!testingMode ? "default" : "outline"}
                    onClick={() => setTestingMode(false)}
                    className="flex-1"
                    disabled={campaignData.length === 0}
                  >
                    Production
                  </Button>
                </div>
                <p className="text-xs text-clari-muted mt-1">
                  {testingMode ? "Using test users: saifoo_234, whospys.jj" : "Using real campaign data"}
                </p>
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
                  <span className="text-clari-text font-medium">{dataToUse.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-clari-muted">Survey Link:</span>
                  <span className="text-clari-text font-medium text-xs break-all">{surveyLink}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-clari-muted">Est. Duration:</span>
                  <span className="text-clari-text font-medium">
                    {testingMode ? Math.ceil(dataToUse.length * 0.2) : Math.ceil(dataToUse.length * 0.8)} minutes
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-clari-muted">Rate Limit:</span>
                  <span className="text-clari-text font-medium">
                    {testingMode ? "10s between messages" : "45s between messages"}
                  </span>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-400">
                    <strong>{testingMode ? "Test Mode" : "Production Mode"}:</strong> {testingMode ? "Using your specified test users with the survey link included." : "Using real campaign data with survey link replacement."}
                  </p>
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
                  >
                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button 
                    onClick={handleDownloadScript}
                    className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90"
                  >
                    <Download size={16} />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Textarea 
                  value={generatePythonScript()}
                  readOnly
                  className="font-mono text-sm min-h-[500px] bg-clari-darkBg border-clari-darkAccent resize-none"
                />
              </div>
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
                  <strong>Note:</strong> The script includes built-in rate limiting ({testingMode ? "10 seconds" : "45 seconds"} between messages) 
                  to comply with Instagram's API guidelines and avoid account restrictions. The survey link will be automatically included in all messages.
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
