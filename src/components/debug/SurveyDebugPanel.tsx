
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { fetchSurveys } from '@/utils/supabase/database';
import { useToast } from '@/components/ui/use-toast';

interface Survey {
  id: string;
  title: string;
  slug?: string;
  created_at: string;
  is_active: boolean;
}

const SurveyDebugPanel = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadSurveys = async () => {
      try {
        const result = await fetchSurveys();
        if (result.success && result.data) {
          setSurveys(result.data);
        }
      } catch (error) {
        console.error('Error loading surveys:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSurveys();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Survey URL copied to clipboard",
    });
  };

  const openSurvey = (survey: Survey) => {
    const url = survey.slug 
      ? `/survey/${survey.slug}` 
      : `/survey/${survey.id}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Card className="bg-clari-darkCard border-clari-darkAccent">
        <CardContent className="p-8">
          <div className="text-center text-clari-text">Loading surveys...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-clari-darkCard border-clari-darkAccent">
        <CardHeader>
          <CardTitle className="text-clari-text">
            Available Surveys ({surveys.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {surveys.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-clari-muted">No surveys found in the database.</p>
              <Button 
                onClick={() => window.location.href = '/survey/create'}
                className="mt-4 bg-clari-gold text-black hover:bg-clari-gold/90"
              >
                Create Your First Survey
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {surveys.map((survey) => (
                <div key={survey.id} className="border border-clari-darkAccent rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-clari-text">{survey.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      survey.is_active 
                        ? 'bg-green-900/20 text-green-400 border border-green-400/20' 
                        : 'bg-red-900/20 text-red-400 border border-red-400/20'
                    }`}>
                      {survey.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-clari-muted">
                    <div>
                      <strong>ID:</strong> 
                      <code className="ml-2 bg-clari-darkBg px-2 py-1 rounded text-clari-gold">
                        {survey.id}
                      </code>
                    </div>
                    
                    {survey.slug && (
                      <div>
                        <strong>Slug:</strong> 
                        <code className="ml-2 bg-clari-darkBg px-2 py-1 rounded text-clari-gold">
                          {survey.slug}
                        </code>
                      </div>
                    )}
                    
                    <div>
                      <strong>Created:</strong> {new Date(survey.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openSurvey(survey)}
                      className="border-clari-gold text-clari-gold hover:bg-clari-gold hover:text-black"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(
                        survey.slug 
                          ? `${window.location.origin}/survey/${survey.slug}`
                          : `${window.location.origin}/survey/${survey.id}`
                      )}
                      className="border-clari-darkAccent text-clari-text hover:bg-clari-darkAccent"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy URL
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/survey/results/${survey.id}`, '_blank')}
                      className="border-clari-darkAccent text-clari-text hover:bg-clari-darkAccent"
                    >
                      Results
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyDebugPanel;
