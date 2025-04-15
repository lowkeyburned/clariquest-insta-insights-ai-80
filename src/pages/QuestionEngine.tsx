
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Save,
  Send,
  Sparkles,
  List,
  Plus
} from "lucide-react";
import { useState } from "react";

const QuestionEngine = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("");

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Question Engine</h1>
          <p className="text-clari-muted mt-1">Create and manage survey questions</p>
        </div>
        <Button className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90">
          <Plus size={16} />
          New Template
        </Button>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="bg-clari-darkCard">
          <TabsTrigger value="templates" className="gap-1">
            <List size={16} />
            Templates
          </TabsTrigger>
          <TabsTrigger value="builder" className="gap-1">
            <Sparkles size={16} />
            Question Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-4">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Question Templates</CardTitle>
              <CardDescription>Pre-built templates for common survey scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {[
                  {
                    id: "product-feedback",
                    title: "Product Feedback",
                    description: "Questions about product experience and satisfaction",
                    questions: 5
                  },
                  {
                    id: "market-research",
                    title: "Market Research",
                    description: "Understand market trends and customer preferences",
                    questions: 8
                  },
                  {
                    id: "customer-satisfaction",
                    title: "Customer Satisfaction",
                    description: "Measure overall customer satisfaction and NPS",
                    questions: 6
                  }
                ].map((template) => (
                  <Card key={template.id} className="bg-clari-darkBg border-clari-darkAccent">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{template.title}</h3>
                          <p className="text-sm text-clari-muted mt-1">{template.description}</p>
                          <p className="text-xs text-clari-muted mt-2">{template.questions} questions</p>
                        </div>
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          <MessageSquare size={16} />
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="mt-4">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Create Questions</CardTitle>
              <CardDescription>Build custom questions for your surveys</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">Question Type</label>
                <Select>
                  <SelectTrigger className="border-clari-darkAccent bg-clari-darkBg">
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="rating">Rating Scale</SelectItem>
                    <SelectItem value="open-ended">Open Ended</SelectItem>
                    <SelectItem value="yes-no">Yes/No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Question Text</label>
                <Textarea 
                  placeholder="Enter your question here..."
                  className="border-clari-darkAccent bg-clari-darkBg min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Description (Optional)</label>
                <Input 
                  placeholder="Add additional context for the question"
                  className="border-clari-darkAccent bg-clari-darkBg"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" className="gap-2">
                  <Save size={16} />
                  Save Draft
                </Button>
                <Button className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90">
                  <Send size={16} />
                  Add to Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default QuestionEngine;
