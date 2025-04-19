
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, FileText, Settings } from "lucide-react";
import { useState } from "react";

interface InsightGeneratorProps {
  businesses: Array<{ id: string; name: string; }>;
}

const InsightGenerator = ({ businesses }: InsightGeneratorProps) => {
  const [query, setQuery] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState("");

  return (
    <Card className="bg-clari-darkCard border-clari-darkAccent">
      <CardHeader>
        <CardTitle>Insight Generator</CardTitle>
        <CardDescription>Generate custom insights using AI analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4">
          <Label htmlFor="business-select">Select Business</Label>
          <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
            <SelectTrigger id="business-select" className="w-full">
              <SelectValue placeholder="Select a business" />
            </SelectTrigger>
            <SelectContent>
              {businesses.map((business) => (
                <SelectItem key={business.id} value={business.id}>
                  {business.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <FileText className="absolute left-3 top-2.5 h-5 w-5 text-clari-muted" />
          <Input 
            placeholder="Enter your query or topic" 
            className="pl-10 border-clari-darkAccent bg-clari-darkBg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="data-source">Data Source</Label>
            <Input 
              id="data-source" 
              placeholder="Surveys, Social Media, etc." 
              className="border-clari-darkAccent bg-clari-darkBg"
            />
          </div>
          
          <div>
            <Label htmlFor="analysis-type">Analysis Type</Label>
            <Input 
              id="analysis-type" 
              placeholder="Sentiment, Trend, etc." 
              className="border-clari-darkAccent bg-clari-darkBg"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Button 
            className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90"
            disabled={!selectedBusiness}
          >
            <BrainCircuit size={16} />
            Generate Insight
          </Button>
          <Button variant="outline" className="gap-2">
            <Settings size={16} />
            Advanced Options
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightGenerator;
