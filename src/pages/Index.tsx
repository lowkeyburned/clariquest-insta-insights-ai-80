
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart2, 
  MessageSquare, 
  UserSearch, 
  Sparkles, 
  Database, 
  Activity 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const stats = [
    { label: "Survey Responses", value: "1,254", change: "+12.3%", icon: <BarChart2 className="text-clari-gold" /> },
    { label: "Instagram Messages", value: "846", change: "+8.5%", icon: <MessageSquare className="text-clari-gold" /> },
    { label: "Targeted Users", value: "3,127", change: "+15.7%", icon: <UserSearch className="text-clari-gold" /> },
    { label: "AI Insights", value: "128", change: "+23.1%", icon: <Sparkles className="text-clari-gold" /> },
  ];

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-clari-muted mt-1">Welcome to Clariquest, your market research assistant</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/database">
              <Database size={16} />
              View Database
            </Link>
          </Button>
          <Button asChild className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90">
            <Link to="/instagram-messaging">
              <MessageSquare size={16} />
              New Campaign
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-clari-darkCard border-clari-darkAccent">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-clari-muted">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-green-400">{stat.change}</p>
              </div>
              <div className="p-3 rounded-full bg-clari-darkAccent">
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-clari-darkCard border-clari-darkAccent">
          <CardHeader>
            <CardTitle>Survey Response Trends</CardTitle>
            <CardDescription>Monthly survey completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center border border-dashed border-clari-darkAccent rounded-md">
              <div className="text-center">
                <Activity size={40} className="mx-auto mb-2 text-clari-muted" />
                <p className="text-clari-muted">Survey response visualization will appear here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { icon: <BarChart2 size={14} />, text: "Survey #1254 completed", time: "5 min ago" },
                { icon: <MessageSquare size={14} />, text: "15 new Instagram messages sent", time: "10 min ago" },
                { icon: <UserSearch size={14} />, text: "New audience segment created", time: "25 min ago" },
                { icon: <Sparkles size={14} />, text: "AI insights report generated", time: "1 hour ago" },
                { icon: <Database size={14} />, text: "Database backup completed", time: "2 hours ago" }
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-clari-darkAccent">
                  <div className="p-1.5 rounded-full bg-clari-darkAccent text-clari-gold">
                    {activity.icon}
                  </div>
                  <div>
                    <p className="text-sm">{activity.text}</p>
                    <p className="text-xs text-clari-muted">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Index;
