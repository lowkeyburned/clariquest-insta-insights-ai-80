
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, BarChart3, MessageSquare, Database, TrendingUp, Users } from 'lucide-react';
import BusinessStatsDropdown from '@/components/dashboard/BusinessStatsDropdown';
import RealTimeStats from '@/components/dashboard/RealTimeStats';

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-clari-text mb-2">Dashboard</h1>
            <p className="text-clari-muted text-lg">Monitor your survey performance and business analytics in real-time</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="gap-2 border-clari-darkAccent hover:bg-clari-darkAccent">
              <Link to="/database">
                <Database size={18} />
                Database
              </Link>
            </Button>
            <Button asChild className="gap-2 bg-clari-gold text-black hover:bg-clari-gold/90 font-semibold">
              <Link to="/businesses">
                <Plus size={18} />
                Add Business
              </Link>
            </Button>
          </div>
        </div>

        {/* Business Analytics Section - More Prominent */}
        <div className="bg-gradient-to-r from-clari-darkCard to-clari-darkBg p-6 rounded-xl border border-clari-darkAccent">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-clari-gold/10">
              <BarChart3 className="text-clari-gold" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-clari-text">Business Analytics</h2>
              <p className="text-clari-muted">Select a business to view detailed survey statistics</p>
            </div>
          </div>
          <BusinessStatsDropdown />
        </div>

        {/* Real-time Overview */}
        <div className="bg-gradient-to-r from-clari-darkBg to-clari-darkCard p-6 rounded-xl border border-clari-darkAccent">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-clari-gold/10">
              <TrendingUp className="text-clari-gold animate-pulse" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-clari-text">Live Activity</h2>
              <p className="text-clari-muted">Real-time survey responses and system activity</p>
            </div>
          </div>
          <RealTimeStats />
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-clari-darkCard border-clari-darkAccent hover:border-clari-gold/50 transition-colors">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-clari-text">
                <div className="p-2 rounded-lg bg-clari-gold/10">
                  <BarChart3 className="text-clari-gold" size={20} />
                </div>
                Survey Analytics
              </CardTitle>
              <CardDescription className="text-clari-muted">
                Deep dive into survey performance metrics and response analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-clari-gold text-black hover:bg-clari-gold/90">
                <Link to="/businesses">View Analytics</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-clari-darkCard border-clari-darkAccent hover:border-clari-gold/50 transition-colors">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-clari-text">
                <div className="p-2 rounded-lg bg-clari-gold/10">
                  <MessageSquare className="text-clari-gold" size={20} />
                </div>
                Create Campaign
              </CardTitle>
              <CardDescription className="text-clari-muted">
                Launch targeted Instagram messaging campaigns to boost engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link to="/instagram-messaging">Create Campaign</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-clari-darkCard border-clari-darkAccent hover:border-clari-gold/50 transition-colors">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-clari-text">
                <div className="p-2 rounded-lg bg-clari-gold/10">
                  <Users className="text-clari-gold" size={20} />
                </div>
                Quick Actions
              </CardTitle>
              <CardDescription className="text-clari-muted">
                Quickly access the most common tasks and workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
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
