
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, ExternalLink, Plus, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { nanoid } from 'nanoid';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedLink {
  id: string;
  title: string;
  questions: string[];
  uniqueCode: string;
  shareUrl: string;
  responseCount: number;
  createdAt: string;
}

const LinkGenerator = () => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState(['']);
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedLink[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const baseUrl = 'https://clariquest-insta-insights-ai-80.vercel.app';

  useEffect(() => {
    loadGeneratedLinks();
  }, []);

  const loadGeneratedLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('instagram_surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const links: GeneratedLink[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        questions: item.questions,
        uniqueCode: item.unique_code,
        shareUrl: `${baseUrl}/s/${item.unique_code}`,
        responseCount: item.response_count || 0,
        createdAt: item.created_at
      }));

      setGeneratedLinks(links);
    } catch (error) {
      console.error('Error loading links:', error);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  const updateQuestion = (index: number, value: string) => {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const generateLink = async () => {
    if (!title.trim() || questions.some(q => !q.trim())) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const uniqueCode = nanoid(8);
      const shareUrl = `${baseUrl}/s/${uniqueCode}`;

      const { data, error } = await supabase
        .from('instagram_surveys')
        .insert([{
          title: title.trim(),
          questions: questions.filter(q => q.trim()),
          unique_code: uniqueCode,
          response_count: 0
        }])
        .select()
        .single();

      if (error) throw error;

      const newLink: GeneratedLink = {
        id: data.id,
        title: data.title,
        questions: data.questions,
        uniqueCode: data.unique_code,
        shareUrl,
        responseCount: 0,
        createdAt: data.created_at
      };

      setGeneratedLinks([newLink, ...generatedLinks]);
      setTitle('');
      setQuestions(['']);

      toast({
        title: "Link Generated!",
        description: "Your survey link is ready to share on Instagram",
      });
    } catch (error) {
      console.error('Error generating link:', error);
      toast({
        title: "Error",
        description: "Failed to generate link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    });
  };

  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('instagram_surveys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGeneratedLinks(generatedLinks.filter(link => link.id !== id));
      toast({
        title: "Deleted",
        description: "Survey link deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting link:', error);
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Instagram Survey Link Generator</h1>
        <p className="text-muted-foreground">Create shareable survey links for your Instagram campaigns</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Survey</CardTitle>
          <CardDescription>Generate a unique link to share on Instagram</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="title">Survey Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Quick Product Feedback"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Questions</Label>
            <div className="space-y-3 mt-2">
              {questions.map((question, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={question}
                    onChange={(e) => updateQuestion(index, e.target.value)}
                    placeholder={`Question ${index + 1}`}
                    className="flex-1"
                    rows={2}
                  />
                  {questions.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeQuestion(index)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addQuestion}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>

          <Button
            onClick={generateLink}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Survey Link'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Generated Links</h2>
        {generatedLinks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No survey links generated yet. Create your first one above!
            </CardContent>
          </Card>
        ) : (
          generatedLinks.map((link) => (
            <Card key={link.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{link.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(link.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {link.responseCount} responses
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/s/${link.uniqueCode}`, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/results/${link.uniqueCode}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteLink(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded mb-3">
                  <p className="text-sm font-mono break-all">{link.shareUrl}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => copyLink(link.shareUrl)}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    onClick={() => window.open(link.shareUrl, '_blank')}
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Survey
                  </Button>
                </div>

                <div className="mt-3">
                  <p className="text-sm font-medium mb-1">Questions:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {link.questions.map((q, i) => (
                      <li key={i}>• {q}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default LinkGenerator;
