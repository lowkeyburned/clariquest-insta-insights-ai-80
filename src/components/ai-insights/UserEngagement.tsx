
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User as UserIcon, MessageSquare, BrainCircuit } from "lucide-react";

const UserEngagement = () => {
  return (
    <Card className="bg-clari-darkCard border-clari-darkAccent">
      <CardHeader>
        <CardTitle>User Engagement Analysis</CardTitle>
        <CardDescription>Analyze user engagement patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
            <h3 className="font-medium text-sm text-clari-gold mb-1">Active Users</h3>
            <div className="flex items-center gap-2">
              <UserIcon size={20} className="text-clari-muted" />
              <p className="text-xs">1,245 active users</p>
            </div>
          </div>
          
          <div className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
            <h3 className="font-medium text-sm text-clari-gold mb-1">Most Engaged Content</h3>
            <div className="flex items-center gap-2">
              <MessageSquare size={20} className="text-clari-muted" />
              <p className="text-xs">Surveys related to product feedback</p>
            </div>
          </div>
          
          <div className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent">
            <h3 className="font-medium text-sm text-clari-gold mb-1">Average Session Time</h3>
            <div className="flex items-center gap-2">
              <BrainCircuit size={20} className="text-clari-muted" />
              <p className="text-xs">5 minutes 30 seconds</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserEngagement;
