
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, BarChart3, MessageSquare, Database } from 'lucide-react';
import BusinessStatsDropdown from '@/components/dashboard/BusinessStatsDropdown';
import RealTimeStats from '@/components/dashboard/RealTimeStats';

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-clari-text">Dashboard</h1>
            <p className="text-clari-muted mt-1">Monitor your survey performance in real-time</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/database">
                <Database size={16} />
                View Database
              </Link>
            </Button>
            <Button asChild className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90">
              <Link to="/businesses">
                <Plus size={16} />
                Add Business
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RealTimeStats />
          </div>
          
          <div className="lg:col-span-1">
            <BusinessStatsDropdown />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="text-clari-gold" size={20} />
                Survey Analytics
              </CardTitle>
              <CardDescription>
                View detailed analytics for all your surveys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/businesses">View Analytics</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="text-clari-gold" size={20} />
                Create Campaign
              </CardTitle>
              <CardDescription>
                Start a new Instagram messaging campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link to="/instagram-messaging">Create Campaign</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="text-clari-gold" size={20} />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Quickly access common tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button asChild size="sm" className="w-full" variant="ghost">
                  <Link to="/businesses">Add Business</Link>
                </Button>
                <Button asChild size="sm" className="w-full" variant="ghost">
                  <Link to="/survey/create">Create Survey</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
