
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Copy, Check, Users, Download } from 'lucide-react';
import { toast } from 'sonner';
import { fetchBusinessById } from '@/utils/supabase/businessHelpers';
import { fetchSurveys } from '@/utils/supabase/surveyHelpers';
import { fetchInstagramData } from '@/utils/supabase/instagramDataHelpers';

const PythonScript = () => {
  const { businessId } = useParams<{ businessId?: string }>();
  
  // Form state
  const [instagramUsername, setInstagramUsername] = useState('');
  const [instagramPassword, setInstagramPassword] = useState('');
  const [targetLocation, setTargetLocation] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [testingMode, setTestingMode] = useState(true);

  // Available locations - simplified to just these two
  const locations = [
    { value: 'Dubai Silicon Oasis', label: 'Dubai Silicon Oasis' },
    { value: 'Mamzar', label: 'Mamzar' }
  ];

  // Get campaign data from localStorage (set by InstagramCampaigns page)
  const [campaignData, setCampaignData] = useState<any[]>([]);

  useEffect(() => {
    const storedData = localStorage.getItem('instagram_campaign_data');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setCampaignData(parsedData);
        
        // Set location from the first user's location if available
        if (parsedData.length > 0 && parsedData[0].location) {
          setTargetLocation(parsedData[0].location);
        }
      } catch (error) {
        console.error('Error parsing campaign data:', error);
      }
    }
  }, []);

  // Fetch business data
  const { data: businessResult, isLoading: isLoadingBusiness } = useQuery({
    queryKey: ['business', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      const result = await fetchBusinessById(businessId);
      return result.success ? result.data : null;
    },
    enabled: !!businessId
  });

  // Fetch surveys for the business
  const { data: surveysResponse, isLoading: isLoadingSurveys } = useQuery({
    queryKey: ['business-surveys', businessId],
    queryFn: async () => {
      if (!businessId) return { success: true, data: [] };
      return await fetchSurveys(businessId);
    },
    enabled: !!businessId
  });

  // Fetch Instagram data for selected campaign location
  const { data: instagramDataResponse } = useQuery({
    queryKey: ['instagram-data', targetLocation],
    queryFn: async () => {
      if (!targetLocation) return { success: true, data: [] };
      return await fetchInstagramData(50, targetLocation);
    },
    enabled: !!targetLocation
  });

  const surveys = surveysResponse?.success && surveysResponse.data ? surveysResponse.data : [];
  const instagramUsers = instagramDataResponse?.success && instagramDataResponse.data ? instagramDataResponse.data : [];

  // Default message template
  const defaultMessage = `Hey! 👋 I noticed you're from {location} and love your content! 

We're conducting a quick survey about local preferences in your area and would love to hear your thoughts. It only takes 2-3 minutes to complete.

As a thank you, we'll send you a special discount voucher that you can use at local businesses! 🎁

Survey link: {survey_link}

Thanks for helping us understand our community better! ✨`;

  // Set default message when component loads
  useEffect(() => {
    if (!messageContent) {
      setMessageContent(defaultMessage);
    }
  }, []);

  // Generate the final survey link
  const getFinalSurveyLink = () => {
    if (!selectedSurveyId) return 'https://yoursurvey.com/survey123';
    
    const selectedSurvey = surveys.find(s => s.id === selectedSurveyId);
    if (!selectedSurvey) return 'https://yoursurvey.com/survey123';
    
    return `${window.location.origin}/survey/${selectedSurvey.id}`;
  };

  const business = businessResult;

  // Generate Python script with n8n approach
  const generatePythonScript = () => {
    const surveyLink = getFinalSurveyLink();
    const finalMessage = messageContent
      .replace('{survey_link}', surveyLink)
      .replace('{location}', targetLocation);

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
TESTING_MODE = ${testingMode ? 'True' : 'False'}

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

# ===============================
# CONFIGURATION SUMMARY
# ===============================
# Business: ${business?.name || 'Your Business'}
# Target Location: ${targetLocation}
# Survey Link: ${surveyLink}
# Total Instagram Users Found: ${instagramUsers.length}
# Campaign Data Users: ${campaignData.length}
# Testing Mode: ${testingMode ? 'Enabled' : 'Disabled'}
# ===============================
`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatePythonScript());
      setCopied(true);
      toast.success('Python script copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadScript = () => {
    const script = generatePythonScript();
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `instagram_dm_sender_${Date.now()}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Python script downloaded!');
  };

  if (isLoadingBusiness) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clari-gold mx-auto mb-4"></div>
            <p className="text-clari-muted">Loading business details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!business) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Business not found</h2>
          <p className="text-clari-muted">The requested business could not be found.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Python Script Generator</h1>
              <p className="text-clari-muted">Generate and download Python script to send Instagram messages</p>
            </div>
          </div>
          
          {/* Status indicators */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-clari-gold/20 rounded-full">
              <Users size={16} className="text-clari-gold" />
              <span className="text-sm font-medium text-clari-gold">
                {campaignData.length} Users Ready
              </span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              testingMode 
                ? 'bg-yellow-500/20 text-yellow-500' 
                : 'bg-green-500/20 text-green-500'
            }`}>
              {testingMode ? 'Test Mode' : 'Production Mode'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Instagram Credentials */}
            <Card className="bg-clari-darkCard border-clari-darkAccent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Users size={16} className="text-white" />
                  </div>
                  Instagram Credentials
                </CardTitle>
                <p className="text-sm text-clari-muted">Configure your Instagram account details</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Instagram Username</Label>
                  <Input
                    id="username"
                    value={instagramUsername}
                    onChange={(e) => setInstagramUsername(e.target.value)}
                    placeholder="e.g., yourbusiness"
                    className="bg-clari-darkBg border-clari-darkAccent"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Instagram Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={instagramPassword}
                    onChange={(e) => setInstagramPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="bg-clari-darkBg border-clari-darkAccent"
                  />
                </div>

                {/* Survey Link */}
                <div className="space-y-2">
                  <Label>Survey Link</Label>
                  <Card className="p-3 bg-clari-darkBg border-clari-darkAccent">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-clari-gold">
                          {getFinalSurveyLink()}
                        </p>
                        <p className="text-xs text-clari-muted">
                          This link will be included in all messages
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Mode Selection */}
                <div className="space-y-2">
                  <Label>Mode Selection</Label>
                  <div className="flex gap-2">
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
                    >
                      Production
                    </Button>
                  </div>
                  <p className="text-xs text-clari-muted">
                    {testingMode ? 'Will send to test users only' : 'Will send to campaign users'}
                  </p>
                </div>

                {/* Security Note */}
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-xs text-yellow-500">
                    <strong>Security Note:</strong> Make sure to use app-specific passwords 
                    or consider using environment variables in production.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Configuration */}
            <Card className="bg-clari-darkCard border-clari-darkAccent">
              <CardHeader>
                <CardTitle>Campaign Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location Selection */}
                <div className="space-y-2">
                  <Label htmlFor="location">Target Location</Label>
                  <Select value={targetLocation} onValueChange={setTargetLocation}>
                    <SelectTrigger className="bg-clari-darkBg border-clari-darkAccent">
                      <SelectValue placeholder="Choose a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.value} value={location.value}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {campaignData.length > 0 && (
                    <p className="text-xs text-clari-muted">
                      Campaign data loaded with {campaignData.length} users
                    </p>
                  )}
                </div>

                {/* Survey Selection */}
                <div className="space-y-2">
                  <Label htmlFor="survey">Select Survey</Label>
                  <Select value={selectedSurveyId} onValueChange={setSelectedSurveyId}>
                    <SelectTrigger className="bg-clari-darkBg border-clari-darkAccent">
                      <SelectValue placeholder="Choose a survey" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingSurveys ? (
                        <SelectItem value="loading" disabled>Loading surveys...</SelectItem>
                      ) : surveys.length === 0 ? (
                        <SelectItem value="no-surveys" disabled>No surveys available</SelectItem>
                      ) : (
                        surveys.map((survey) => (
                          <SelectItem key={survey.id} value={survey.id}>
                            {survey.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Message Content */}
                <div className="space-y-2">
                  <Label htmlFor="message">DM Message Template</Label>
                  <Textarea
                    id="message"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Your message template"
                    className="bg-clari-darkBg border-clari-darkAccent min-h-[120px]"
                  />
                  <p className="text-xs text-clari-muted">
                    Use {"{location}"} and {"{survey_link}"} in your message for automatic replacement
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Script Preview */}
          <div className="space-y-6">
            <Card className="bg-clari-darkCard border-clari-darkAccent">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Generated Python Script</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="gap-2"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={downloadScript}
                      className="gap-2 bg-clari-gold hover:bg-clari-gold/90"
                    >
                      <Download size={16} />
                      Download
                    </Button>
                  </div>
                </CardTitle>
                <p className="text-sm text-clari-muted">Ready-to-run script for your Instagram campaign</p>
              </CardHeader>
              <CardContent>
                <div className="bg-clari-darkBg border border-clari-darkAccent rounded-lg p-4 max-h-[600px] overflow-auto">
                  <pre className="text-sm text-clari-text whitespace-pre-wrap font-mono">
                    {generatePythonScript()}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Preview */}
            <Card className="bg-clari-darkCard border-clari-darkAccent">
              <CardHeader>
                <CardTitle>Campaign Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-clari-darkBg rounded-lg">
                      <div className="text-lg font-bold text-clari-gold">{campaignData.length}</div>
                      <div className="text-sm text-clari-muted">Campaign Users</div>
                    </div>
                    <div className="p-3 bg-clari-darkBg rounded-lg">
                      <div className="text-lg font-bold text-clari-gold">{targetLocation || 'Not Selected'}</div>
                      <div className="text-sm text-clari-muted">Location</div>
                    </div>
                  </div>
                  
                  {messageContent && (
                    <div className="p-3 bg-clari-darkBg rounded-lg">
                      <div className="text-sm font-medium mb-2">Message Preview:</div>
                      <div className="text-xs text-clari-muted whitespace-pre-wrap">
                        {messageContent.substring(0, 200)}{messageContent.length > 200 ? '...' : ''}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PythonScript;
