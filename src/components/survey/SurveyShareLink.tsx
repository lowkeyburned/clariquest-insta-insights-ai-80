
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Copy, Check, Edit2, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { updateSurveySlug, isSlugAvailable } from '@/utils/supabase/slugHelpers';

interface SurveyShareLinkProps {
  surveyId: string;
  currentSlug?: string;
  onSlugUpdate?: (newSlug: string) => void;
}

const SurveyShareLink = ({ surveyId, currentSlug, onSlugUpdate }: SurveyShareLinkProps) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newSlug, setNewSlug] = useState(currentSlug || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const baseUrl = 'https://clariquest-insta-insights-ai-80.vercel.app/survey';
  const shareUrl = currentSlug ? `${baseUrl}/${currentSlug}` : `${baseUrl}/${surveyId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Survey link has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleSlugUpdate = async () => {
    if (!newSlug || newSlug === currentSlug) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      // Check if slug is available
      const available = await isSlugAvailable(newSlug);
      if (!available) {
        toast({
          title: "Slug not available",
          description: "This URL is already taken. Please try another one.",
          variant: "destructive",
        });
        return;
      }

      // Update the slug
      await updateSurveySlug(surveyId, newSlug);
      onSlugUpdate?.(newSlug);
      setIsEditing(false);
      toast({
        title: "URL updated!",
        description: "Your survey URL has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update survey URL.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="bg-clari-darkCard border-clari-darkAccent">
      <CardHeader>
        <CardTitle className="text-clari-text flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Share Your Survey
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-clari-muted">
            Share this link anywhere - Instagram DMs, WhatsApp, email, or social media:
          </p>
          
          <div className="flex gap-2">
            <Input 
              value={shareUrl}
              readOnly
              className="bg-clari-darkBg border-clari-darkAccent text-clari-text font-mono text-sm"
            />
            <Button 
              onClick={copyToClipboard}
              className="bg-clari-gold text-black hover:bg-clari-gold/90"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {currentSlug && (
          <div className="space-y-2">
            <p className="text-sm text-clari-muted">Custom URL:</p>
            
            {isEditing ? (
              <div className="flex gap-2">
                <div className="flex-1 flex">
                  <span className="bg-clari-darkBg border border-r-0 border-clari-darkAccent px-3 py-2 text-sm text-clari-muted rounded-l">
                    {baseUrl}/
                  </span>
                  <Input 
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="bg-clari-darkBg border-clari-darkAccent text-clari-text rounded-l-none"
                    placeholder="your-custom-url"
                  />
                </div>
                <Button 
                  onClick={handleSlugUpdate}
                  disabled={isUpdating}
                  size="sm"
                  className="bg-clari-gold text-black hover:bg-clari-gold/90"
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </Button>
                <Button 
                  onClick={() => {
                    setIsEditing(false);
                    setNewSlug(currentSlug);
                  }}
                  variant="outline"
                  size="sm"
                  className="border-clari-darkAccent text-clari-text"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <code className="bg-clari-darkBg px-3 py-2 rounded text-clari-gold text-sm">
                  /{currentSlug}
                </code>
                <Button 
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="border-clari-darkAccent text-clari-text"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="bg-clari-darkBg/50 rounded-lg p-3 text-xs text-clari-muted">
          <p className="font-medium mb-1">💡 Pro Tips:</p>
          <ul className="space-y-1">
            <li>• This link works like Google Forms - share it anywhere!</li>
            <li>• Custom URLs are easier to remember and look more professional</li>
            <li>• You can edit the URL anytime, but old links will stop working</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SurveyShareLink;
