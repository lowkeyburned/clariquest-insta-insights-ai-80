
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { nanoid } from 'nanoid';

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
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState(['']);
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedLink[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadExistingLinks();
  }, []);

  const loadExistingLinks = async () => {
    try {
      // For now, show a placeholder since the table doesn't exist yet
      setGeneratedLinks([]);
      toast({
        title: "Note",
        description: "Please create the database tables first using the SQL migration provided earlier.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error loading links:', error);
      toast({
        title: "Error",
        description: "Failed to load existing links",
        variant: "destructive",
      });
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const generateLink = async () => {
    if (!title.trim() || questions.some(q => !q.trim())) {
      toast({
        title: "Invalid Input",
        description: "Please fill in the title and all questions",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const uniqueCode = nanoid(10);
      
      // Show preview of what would be created
      const newLink: GeneratedLink = {
        id: nanoid(),
        title,
        questions: questions.filter(q => q.trim()),
        uniqueCode,
        shareUrl: `${window.location.origin}/s/${uniqueCode}`,
        responseCount: 0,
        createdAt: new Date().toISOString()
      };

      setGeneratedLinks([newLink, ...generatedLinks]);
      
      // Reset form
      setTitle('');
      setQuestions(['']);

      toast({
        title: "Link Generated (Preview)",
        description: "This is a preview. Please create the database tables to save surveys.",
      });
    } catch (error) {
      console.error('Error generating link:', error);
      toast({
        title: "Error",
        description: "Failed to generate link",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    });
  };

  const deleteLink = (id: string) => {
    setGeneratedLinks(generatedLinks.filter(link => link.id !== id));
    toast({
      title: "Deleted",
      description: "Survey link deleted",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Instagram Survey Link Generator</h1>
        <p className="text-muted-foreground">
          Create custom survey links to share on Instagram. Perfect for market research and customer feedback.
        </p>
      </div>

      {/* Survey Creator Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Survey</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Survey Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Customer Feedback Survey"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Questions</label>
            {questions.map((question, index) => (
              <div key={index} className="flex gap-2 mb-3">
                <Textarea
                  value={question}
                  onChange={(e) => updateQuestion(index, e.target.value)}
                  placeholder={`Question ${index + 1}`}
                  rows={2}
                />
                {questions.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={addQuestion} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
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

      {/* Generated Links */}
      {generatedLinks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Generated Survey Links</h2>
          <div className="space-y-4">
            {generatedLinks.map((link) => (
              <Card key={link.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{link.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {link.questions.length} questions • {link.responseCount} responses
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(link.shareUrl)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(link.shareUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Open
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
                  
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-medium mb-1">Share URL:</p>
                    <code className="text-sm bg-white px-2 py-1 rounded border">
                      {link.shareUrl}
                    </code>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1">Questions:</p>
                    <ul className="text-sm text-muted-foreground">
                      {link.questions.map((q, i) => (
                        <li key={i} className="mb-1">
                          {i + 1}. {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkGenerator;
