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
import { ArrowLeft, Copy, Check, Play, Pause, Code2, ExternalLink, Users, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchBusinessById } from '@/utils/supabase/businessHelpers';
import { fetchSurveys } from '@/utils/supabase/surveyHelpers';
import { fetchInstagramCampaigns } from '@/utils/supabase/campaignHelpers';
import { fetchInstagramData } from '@/utils/supabase/instagramDataHelpers';

interface TestUser {
  id: string;
  username: string;
  fullName: string;
  location: string;
}

const PythonScript = () => {
  const { businessId } = useParams<{ businessId?: string }>();
  
  // Form state
  const [targetLocation, setTargetLocation] = useState('');
  const [instagramUsername, setInstagramUsername] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [testingMode, setTestingMode] = useState(true);
  const [testUsers, setTestUsers] = useState<TestUser[]>([]);
  const [newTestUser, setNewTestUser] = useState({ username: '', fullName: '', location: '' });

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

  // Fetch Instagram campaigns
  const { data: campaignsResponse, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['instagram-campaigns', businessId],
    queryFn: async () => {
      if (!businessId) return { success: true, data: [] };
      return await fetchInstagramCampaigns(businessId);
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
  const campaigns = campaignsResponse?.success && campaignsResponse.data ? campaignsResponse.data : [];
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

  // Update location and other fields when campaign is selected
  useEffect(() => {
    if (selectedCampaignId && campaigns.length > 0) {
      const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
      if (selectedCampaign) {
        setTargetLocation(selectedCampaign.target_location || '');
        if (selectedCampaign.message_content) {
          setMessageContent(selectedCampaign.message_content);
        }
      }
    }
  }, [selectedCampaignId, campaigns]);

  // Add test user
  const addTestUser = () => {
    if (newTestUser.username && newTestUser.fullName) {
      const testUser: TestUser = {
        id: Date.now().toString(),
        username: newTestUser.username,
        fullName: newTestUser.fullName,
        location: newTestUser.location || targetLocation
      };
      setTestUsers([...testUsers, testUser]);
      setNewTestUser({ username: '', fullName: '', location: '' });
      toast.success('Test user added successfully!');
    } else {
      toast.error('Please fill in username and full name');
    }
  };

  // Remove test user
  const removeTestUser = (id: string) => {
    setTestUsers(testUsers.filter(user => user.id !== id));
    toast.success('Test user removed');
  };

  // Generate the final survey link
  const getFinalSurveyLink = () => {
    if (!selectedSurveyId) return 'https://yoursurvey.com/survey123';
    
    const selectedSurvey = surveys.find(s => s.id === selectedSurveyId);
    if (!selectedSurvey) return 'https://yoursurvey.com/survey123';
    
    return `${window.location.origin}/survey/${selectedSurvey.id}`;
  };

  const business = businessResult;

  // Generate Python script with all the parameters
  const generatePythonScript = () => {
    const surveyLink = getFinalSurveyLink();
    const finalMessage = messageContent
      .replace('{survey_link}', surveyLink)
      .replace('{location}', targetLocation);

    // Combine real Instagram users and test users
    const allTargetUsers = [
      ...instagramUsers.map(user => ({
        username: user.instagram_username,
        fullName: user.owner_full_name || 'Unknown',
        location: user.location || targetLocation,
        isTestUser: false
      })),
      ...testUsers.map(user => ({
        username: user.username,
        fullName: user.fullName,
        location: user.location,
        isTestUser: true
      }))
    ];

    return `import instaloader
import time
import random
from datetime import datetime, timedelta
import requests
import json

# Configuration
TARGET_LOCATION = "${targetLocation}"
INSTAGRAM_USERNAME = "${instagramUsername}"
SURVEY_LINK = "${surveyLink}"
MESSAGE_CONTENT = """${finalMessage}"""
TESTING_MODE = ${testingMode ? 'True' : 'False'}

# Business Information
BUSINESS_NAME = "${business?.name || 'Your Business'}"
BUSINESS_ID = "${businessId || ''}"
CAMPAIGN_ID = "${selectedCampaignId}"

# Target Users List (${allTargetUsers.length} total users)
TARGET_USERS = ${JSON.stringify(allTargetUsers, null, 2)}

def setup_instaloader():
    """Initialize Instaloader with proper settings"""
    L = instaloader.Instaloader()
    
    # Configure to avoid detection
    L.context.user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    
    return L

def send_dm_message(username, full_name, location, is_test_user=False):
    """Send DM to Instagram user"""
    # Personalize message with user's location
    personalized_message = MESSAGE_CONTENT.replace('{location}', location)
    
    if TESTING_MODE:
        print(f"📝 [TEST MODE] Would send DM to @{username} ({full_name})")
        print(f"📍 Location: {location}")
        print(f"🧪 Test User: {is_test_user}")
        print(f"💬 Message: {personalized_message}")
        print("🔗 Survey link included:", SURVEY_LINK)
        print("-" * 50)
        return True
    
    # In production, you would implement actual DM sending
    print(f"📤 Sending DM to @{username} ({full_name})")
    print(f"📍 Location: {location}")
    
    # Simulate API call delay
    time.sleep(random.uniform(5, 15))
    
    return True

def log_outreach_activity(username, full_name, location, sent_successfully, is_test_user=False):
    """Log outreach activity for tracking"""
    activity_log = {
        'timestamp': datetime.now().isoformat(),
        'business_id': BUSINESS_ID,
        'campaign_id': CAMPAIGN_ID,
        'target_username': username,
        'full_name': full_name,
        'location': location,
        'is_test_user': is_test_user,
        'message_sent': sent_successfully,
        'survey_link': SURVEY_LINK,
        'target_location': TARGET_LOCATION
    }
    
    # Save to file
    log_filename = f'outreach_log_{datetime.now().strftime("%Y%m%d")}.json'
    with open(log_filename, 'a') as f:
        f.write(json.dumps(activity_log) + '\\n')
    
    print(f"📊 Logged activity for @{username}")

def main():
    """Main execution function"""
    print("🚀 Starting Instagram Location-Based Outreach")
    print(f"🏢 Business: {BUSINESS_NAME}")
    print(f"📍 Target Location: {TARGET_LOCATION}")
    print(f"🎯 Total Target Users: {len(TARGET_USERS)}")
    print(f"🔗 Survey Link: {SURVEY_LINK}")
    print(f"🧪 Testing Mode: {TESTING_MODE}")
    print("-" * 60)
    
    if not TARGET_USERS:
        print("❌ No target users found. Please check your campaign data.")
        return
    
    try:
        contact_count = 0
        max_contacts_per_day = 20  # Safety limit
        
        for user_data in TARGET_USERS:
            if contact_count >= max_contacts_per_day:
                print(f"🛑 Reached daily limit of {max_contacts_per_day} contacts")
                break
                
            try:
                username = user_data['username']
                full_name = user_data['fullName']
                location = user_data['location']
                is_test_user = user_data.get('isTestUser', False)
                
                print(f"\\n👤 Targeting: @{username} ({full_name})")
                print(f"📍 Location: {location}")
                if is_test_user:
                    print("🧪 TEST USER")
                
                # Send DM
                success = send_dm_message(username, full_name, location, is_test_user)
                
                if success:
                    contact_count += 1
                    log_outreach_activity(username, full_name, location, True, is_test_user)
                    
                    # Wait between messages to avoid spam detection
                    if not TESTING_MODE:
                        wait_time = random.uniform(60, 180)  # 1-3 minutes
                        print(f"⏱️ Waiting {wait_time:.1f} seconds before next contact...")
                        time.sleep(wait_time)
                
            except Exception as e:
                print(f"❌ Error processing user @{username}: {e}")
                continue
        
        print(f"\\n✅ Outreach completed! Contacted {contact_count} users")
        print(f"📊 Check outreach_log_{datetime.now().strftime('%Y%m%d')}.json for details")
        
    except Exception as e:
        print(f"❌ Script error: {e}")

if __name__ == "__main__":
    # Safety check
    if not TESTING_MODE:
        confirm = input("⚠️ You're about to run in PRODUCTION mode. Are you sure? (yes/no): ")
        if confirm.lower() != 'yes':
            print("🛑 Script cancelled")
            exit()
    
    main()

# Required packages:
# pip install instaloader requests

print("\\n" + "="*60)
print("📋 SETUP INSTRUCTIONS:")
print("1. Install required packages: pip install instaloader requests")
print("2. Set TESTING_MODE = False when ready for production")
print("3. Implement actual Instagram DM sending functionality")
print("4. Configure proper Instagram authentication")
print("5. Test with small batches first")
print("="*60)
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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Python Instagram Script</h1>
            <p className="text-clari-muted">Generate automated Instagram outreach script for {business.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <Card className="bg-clari-darkCard border-clari-darkAccent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 size={20} />
                  Script Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Campaign Selection */}
                <div className="space-y-2">
                  <Label htmlFor="campaign">Select Instagram Campaign</Label>
                  <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                    <SelectTrigger className="bg-clari-darkBg border-clari-darkAccent">
                      <SelectValue placeholder="Choose a campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCampaigns ? (
                        <SelectItem value="loading" disabled>Loading campaigns...</SelectItem>
                      ) : campaigns.length === 0 ? (
                        <SelectItem value="no-campaigns" disabled>No campaigns available</SelectItem>
                      ) : (
                        campaigns.map((campaign) => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.name} - {campaign.target_location}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Target Location</Label>
                  <Input
                    id="location"
                    value={targetLocation}
                    onChange={(e) => setTargetLocation(e.target.value)}
                    placeholder="e.g., New York, NY"
                    className="bg-clari-darkBg border-clari-darkAccent"
                  />
                  {instagramUsers.length > 0 && (
                    <p className="text-xs text-clari-muted">
                      Found {instagramUsers.length} Instagram users in this location
                    </p>
                  )}
                </div>

                {/* Instagram Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Your Instagram Username</Label>
                  <Input
                    id="username"
                    value={instagramUsername}
                    onChange={(e) => setInstagramUsername(e.target.value)}
                    placeholder="e.g., yourbusiness"
                    className="bg-clari-darkBg border-clari-darkAccent"
                  />
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

                {/* Survey Link Display */}
                <div className="space-y-2">
                  <Label>Survey Link</Label>
                  <Card className="p-3 bg-clari-darkBg border-clari-darkAccent">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-clari-gold">
                          {selectedSurveyId && surveys.find(s => s.id === selectedSurveyId)?.title || 'Default Survey'}
                        </p>
                        <p className="text-xs text-clari-muted break-all">
                          {getFinalSurveyLink()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getFinalSurveyLink(), '_blank')}
                        className="ml-2"
                      >
                        <ExternalLink size={14} />
                      </Button>
                    </div>
                  </Card>
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

                {/* Testing Mode */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="testing"
                    checked={testingMode}
                    onChange={(e) => setTestingMode(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="testing" className="flex items-center gap-2">
                    {testingMode ? <Pause size={16} /> : <Play size={16} />}
                    Testing Mode (Safe - No actual DMs sent)
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Test Users Management */}
            <Card className="bg-clari-darkCard border-clari-darkAccent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} />
                  Test Users ({testUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Test User */}
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Instagram username"
                    value={newTestUser.username}
                    onChange={(e) => setNewTestUser({ ...newTestUser, username: e.target.value })}
                    className="bg-clari-darkBg border-clari-darkAccent"
                  />
                  <Input
                    placeholder="Full name"
                    value={newTestUser.fullName}
                    onChange={(e) => setNewTestUser({ ...newTestUser, fullName: e.target.value })}
                    className="bg-clari-darkBg border-clari-darkAccent"
                  />
                  <Input
                    placeholder="Location (optional)"
                    value={newTestUser.location}
                    onChange={(e) => setNewTestUser({ ...newTestUser, location: e.target.value })}
                    className="bg-clari-darkBg border-clari-darkAccent"
                  />
                  <Button onClick={addTestUser} className="gap-2">
                    <Plus size={16} />
                    Add Test User
                  </Button>
                </div>

                {/* Test Users List */}
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {testUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-clari-darkBg rounded border border-clari-darkAccent/50">
                      <div>
                        <p className="font-medium text-sm">@{user.username}</p>
                        <p className="text-xs text-clari-muted">{user.fullName} - {user.location}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTestUser(user.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="gap-2"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy Script'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-clari-darkBg border border-clari-darkAccent rounded-lg p-4 max-h-[600px] overflow-auto">
                  <pre className="text-sm text-clari-text whitespace-pre-wrap font-mono">
                    {generatePythonScript()}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Target Users Summary */}
            <Card className="bg-clari-darkCard border-clari-darkAccent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} />
                  Target Users Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-clari-darkBg rounded-lg">
                    <div className="text-2xl font-bold text-clari-gold">{instagramUsers.length}</div>
                    <div className="text-sm text-clari-muted">Real Users</div>
                  </div>
                  <div className="p-4 bg-clari-darkBg rounded-lg">
                    <div className="text-2xl font-bold text-clari-gold">{testUsers.length}</div>
                    <div className="text-sm text-clari-muted">Test Users</div>
                  </div>
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
