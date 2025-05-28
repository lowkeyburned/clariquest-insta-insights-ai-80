
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Users, 
  FileText, 
  BarChart3, 
  Building2, 
  MessageSquare,
  Settings,
  Download,
  Trash2
} from "lucide-react";
import { fetchBusinesses } from "@/utils/supabase";
import { BusinessData } from "@/components/business/BusinessForm";

const Database = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSurveys: 0,
    totalResponses: 0,
    totalBusinesses: 0,
    totalCampaigns: 0
  });

  const { data: businessesResult } = useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses
  });

  const businesses = businessesResult?.success ? businessesResult.data || [] : [];

  // Transform business data to match BusinessData interface
  const transformedBusinesses: BusinessData[] = businesses.map(business => ({
    id: business.id,
    name: business.name,
    description: business.description || "",
    industry: business.industry || "",
    website: business.website || "",
    owner_id: business.owner_id,
    user_id: business.owner_id, // Map owner_id to user_id for compatibility
    created_at: business.created_at,
    updated_at: business.updated_at
  }));

  useEffect(() => {
    // Update stats when businesses data changes
    setStats(prev => ({
      ...prev,
      totalBusinesses: businesses.length
    }));
  }, [businesses]);

  const tableStats = [
    { name: "Businesses", count: stats.totalBusinesses, icon: Building2, color: "bg-blue-500" },
    { name: "Users", count: stats.totalUsers, icon: Users, color: "bg-green-500" },
    { name: "Surveys", count: stats.totalSurveys, icon: FileText, color: "bg-purple-500" },
    { name: "Responses", count: stats.totalResponses, icon: BarChart3, color: "bg-orange-500" },
    { name: "Campaigns", count: stats.totalCampaigns, icon: MessageSquare, color: "bg-pink-500" },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Database Management</h1>
            <p className="text-clari-muted mt-1">
              Monitor and manage your database tables and data
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download size={16} />
              Export Data
            </Button>
            <Button variant="outline" className="gap-2">
              <Settings size={16} />
              Settings
            </Button>
          </div>
        </div>

        {/* Database Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tableStats.map((stat) => (
            <Card key={stat.name} className="bg-clari-darkCard border-clari-darkAccent">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-clari-muted">{stat.name}</p>
                    <p className="text-2xl font-bold">{stat.count}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Recent Businesses
              </CardTitle>
              <CardDescription>Latest business registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transformedBusinesses.slice(0, 5).map((business) => (
                  <div 
                    key={business.id} 
                    className="flex items-center justify-between p-3 bg-clari-darkBg rounded-md"
                  >
                    <div>
                      <p className="font-medium">{business.name}</p>
                      <p className="text-sm text-clari-muted">{business.industry}</p>
                    </div>
                    <Badge variant="outline">
                      {new Date(business.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                ))}
                {transformedBusinesses.length === 0 && (
                  <p className="text-clari-muted text-center py-4">No businesses found</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Actions
              </CardTitle>
              <CardDescription>Management and maintenance tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <BarChart3 size={16} />
                Run Analytics Query
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Download size={16} />
                Backup Database
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Settings size={16} />
                Optimize Tables
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 text-red-400 border-red-400 hover:bg-red-400/10"
              >
                <Trash2 size={16} />
                Clean Old Data
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Database Schema */}
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardHeader>
            <CardTitle>Database Schema</CardTitle>
            <CardDescription>Overview of your database structure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { table: "businesses", rows: stats.totalBusinesses, columns: 7 },
                { table: "surveys", rows: stats.totalSurveys, columns: 8 },
                { table: "survey_questions", rows: 0, columns: 8 },
                { table: "survey_responses", rows: stats.totalResponses, columns: 6 },
                { table: "instagram_campaigns", rows: stats.totalCampaigns, columns: 8 },
                { table: "profiles", rows: stats.totalUsers, columns: 6 },
              ].map((table) => (
                <div 
                  key={table.table} 
                  className="p-4 bg-clari-darkBg rounded-md border border-clari-darkAccent"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{table.table}</h4>
                    <Badge variant="outline">{table.rows} rows</Badge>
                  </div>
                  <p className="text-sm text-clari-muted">{table.columns} columns</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Database;
