
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
import { ArrowLeft, Copy, Check, Play, Pause, Code2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { fetchBusinessById } from '@/utils/supabase/businessHelpers';
import { fetchSurveys } from '@/utils/supabase/surveyHelpers';

const PythonScript = () => {
  const { businessId } = useParams<{ businessId?: string }>();
  
  // Form state
  const [targetLocation, setTargetLocation] = useState('New York, NY');
  const [instagramUsername, setInstagramUsername] = useState('');
  const [messageContent, setMessageContent] = useState('Hi! I noticed your amazing content. We\'d love to hear your thoughts in our quick survey: {survey_link}');
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [testingMode, setTestingMode] = useState(true);

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

  // Fetch surveys for the business - properly handle the wrapped response
  const { data: surveysResponse, isLoading: isLoadingSurveys } = useQuery({
    queryKey: ['business-surveys', businessId],
    queryFn: async () => {
      if (!businessId) return { success: true, data: [] };
      return await fetchSurveys(businessId);
    },
    enabled: !!businessId
  });

  // Extract the actual surveys array from the response
  const surveys = surveysResponse?.success && surveysResponse.data ? surveysResponse.data : [];

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
    const finalMessage = messageContent.replace('{survey_link}', surveyLink);

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

def setup_instaloader():
    """Initialize Instaloader with proper settings"""
    L = instaloader.Instaloader()
    
    # Configure to avoid detection
    L.context.user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    
    return L

def get_location_posts(loader, location_name, max_posts=20):
    """Get posts from a specific location"""
    try:
        # Search for location
        print(f"🔍 Searching for location: {location_name}")
        
        # Note: You'll need to implement location search
        # This is a simplified version
        posts = []
        
        # In a real implementation, you would:
        # 1. Search for the location using Instagram's location API
        # 2. Get posts from that location
        # 3. Filter recent posts
        
        print(f"📍 Found location posts for: {location_name}")
        return posts
        
    except Exception as e:
        print(f"❌ Error getting location posts: {e}")
        return []

def analyze_post_engagement(post):
    """Analyze if a post has good engagement for DM outreach"""
    try:
        # Basic engagement metrics
        likes = post.likes if hasattr(post, 'likes') else 0
        comments = post.comments if hasattr(post, 'comments') else 0
        
        # Calculate engagement score
        engagement_score = likes + (comments * 5)  # Comments worth more
        
        return {
            'score': engagement_score,
            'should_contact': engagement_score > 50,  # Threshold
            'likes': likes,
            'comments': comments
        }
    except Exception as e:
        print(f"❌ Error analyzing engagement: {e}")
        return {'score': 0, 'should_contact': False}

def send_dm_message(username, message):
    """Send DM to Instagram user (placeholder function)"""
    if TESTING_MODE:
        print(f"📝 [TEST MODE] Would send DM to @{username}")
        print(f"💬 Message: {message}")
        print("🔗 Survey link included:", SURVEY_LINK)
        return True
    
    # In production, you would implement actual DM sending
    # This requires Instagram's private API or automation tools
    print(f"📤 Sending DM to @{username}")
    
    # Simulate API call delay
    time.sleep(random.uniform(5, 15))
    
    return True

def log_outreach_activity(username, post_url, sent_successfully):
    """Log outreach activity for tracking"""
    activity_log = {
        'timestamp': datetime.now().isoformat(),
        'business_id': BUSINESS_ID,
        'target_username': username,
        'post_url': post_url,
        'message_sent': sent_successfully,
        'survey_link': SURVEY_LINK,
        'location': TARGET_LOCATION
    }
    
    # Save to file or send to webhook
    with open(f'outreach_log_{datetime.now().strftime("%Y%m%d")}.json', 'a') as f:
        f.write(json.dumps(activity_log) + '\\n')
    
    print(f"📊 Logged activity for @{username}")

def main():
    """Main execution function"""
    print("🚀 Starting Instagram Location-Based Outreach")
    print(f"🏢 Business: {BUSINESS_NAME}")
    print(f"📍 Target Location: {TARGET_LOCATION}")
    print(f"🔗 Survey Link: {SURVEY_LINK}")
    print(f"🧪 Testing Mode: {TESTING_MODE}")
    print("-" * 50)
    
    try:
        # Initialize Instaloader
        loader = setup_instaloader()
        
        # Get posts from target location
        location_posts = get_location_posts(loader, TARGET_LOCATION)
        
        if not location_posts:
            print("❌ No posts found for the specified location")
            return
        
        contact_count = 0
        max_contacts_per_day = 10  # Safety limit
        
        for post in location_posts[:20]:  # Process up to 20 posts
            try:
                # Analyze post engagement
                engagement = analyze_post_engagement(post)
                
                if engagement['should_contact'] and contact_count < max_contacts_per_day:
                    username = post.owner_username if hasattr(post, 'owner_username') else 'unknown'
                    
                    print(f"\\n👤 Targeting: @{username}")
                    print(f"📊 Engagement Score: {engagement['score']}")
                    
                    # Send DM
                    success = send_dm_message(username, MESSAGE_CONTENT)
                    
                    if success:
                        contact_count += 1
                        log_outreach_activity(username, post.url if hasattr(post, 'url') else '', True)
                        
                        # Wait between messages to avoid spam detection
                        if not TESTING_MODE:
                            wait_time = random.uniform(60, 180)  # 1-3 minutes
                            print(f"⏱️ Waiting {wait_time:.1f} seconds before next contact...")
                            time.sleep(wait_time)
                    
                else:
                    print(f"⏭️ Skipping post (low engagement or daily limit reached)")
                
            except Exception as e:
                print(f"❌ Error processing post: {e}")
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
                    <p className="text-xs text-clari-muted mt-2">
                      This link will be included in all messages
                    </p>
                  </Card>
                </div>

                {/* Message Content */}
                <div className="space-y-2">
                  <Label htmlFor="message">DM Message Template</Label>
                  <Textarea
                    id="message"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Your message template (use {survey_link} for the survey URL)"
                    className="bg-clari-darkBg border-clari-darkAccent min-h-[100px]"
                  />
                  <p className="text-xs text-clari-muted">
                    Use {"{survey_link}"} in your message to automatically include the survey URL
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
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PythonScript;
