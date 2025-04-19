
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const trendingData = [
  { topic: "Sustainability", trend: "+15%", engagement: "High" },
  { topic: "Remote Work", trend: "+12%", engagement: "Medium" },
  { topic: "AI Integration", trend: "+18%", engagement: "High" },
  { topic: "Digital Health", trend: "+9%", engagement: "Medium" },
  { topic: "E-commerce Growth", trend: "+14%", engagement: "High" }
];

const TrendingTopics = () => {
  return (
    <Card className="bg-clari-darkCard border-clari-darkAccent">
      <CardHeader>
        <CardTitle>Trending Topics</CardTitle>
        <CardDescription>Discover what's trending in your data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trendingData.map((item, index) => (
            <div key={index} className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={14} className="text-clari-gold" />
                    <p className="font-medium text-sm">{item.topic}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs">{item.trend}</p>
                  <p className="text-xs text-clari-muted">Engagement: {item.engagement}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingTopics;
