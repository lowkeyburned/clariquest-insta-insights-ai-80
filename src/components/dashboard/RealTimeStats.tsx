
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, BarChart3, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { fetchBusinesses } from '@/utils/supabase/businessHelpers';

interface RealtimeActivity {
  id: string;
  survey_id: string;
  created_at: string;
  survey?: {
    title: string;
    business_id: string;
  };
}

const RealTimeStats = () => {
  const [recentActivities, setRecentActivities] = useState<RealtimeActivity[]>([]);
  const [totalResponsesCount, setTotalResponsesCount] = useState(0);

  const { data: businessesResult } = useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses
  });

  const businesses = businessesResult?.success ? businessesResult.data || [] : [];

  useEffect(() => {
    // Fetch initial data
    const fetchInitialData = async () => {
      // Get total responses count
      const { count } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact', head: true });
      
      setTotalResponsesCount(count || 0);

      // Get recent activities
      const { data, error } = await supabase
        .from('survey_responses')
        .select(`
          id,
          survey_id,
          created_at,
          survey:surveys (
            title,
            business_id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setRecentActivities(data);
      }
    };

    fetchInitialData();

    // Set up real-time subscription
    const channel = supabase
      .channel('survey-responses-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'survey_responses'
        },
        (payload) => {
          console.log('New survey response:', payload);
          
          // Add new response to the list
          const newResponse = payload.new as RealtimeActivity;
          setRecentActivities(prev => [newResponse, ...prev.slice(0, 9)]);
          setTotalResponsesCount(prev => prev + 1);
          
          // Fetch survey details for the new response
          fetchSurveyDetails(newResponse.survey_id, newResponse.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSurveyDetails = async (surveyId: string, responseId: string) => {
    const { data: survey } = await supabase
      .from('surveys')
      .select('title, business_id')
      .eq('id', surveyId)
      .single();

    if (survey) {
      setRecentActivities(prev => 
        prev.map(activity => 
          activity.id === responseId 
            ? { ...activity, survey }
            : activity
        )
      );
    }
  };

  const getBusinessName = (businessId?: string) => {
    if (!businessId) return 'Unknown Business';
    const business = businesses.find(b => b.id === businessId);
    return business?.name || 'Unknown Business';
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-clari-muted font-medium">Total Responses</p>
                <p className="text-3xl font-bold text-clari-text mt-1">{totalResponsesCount}</p>
                <p className="text-xs text-clari-muted mt-1">All time</p>
              </div>
              <div className="p-3 rounded-full bg-clari-darkAccent">
                <Activity className="text-clari-gold" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-clari-muted font-medium">Active Businesses</p>
                <p className="text-3xl font-bold text-clari-text mt-1">{businesses.length}</p>
                <p className="text-xs text-clari-muted mt-1">Currently managed</p>
              </div>
              <div className="p-3 rounded-full bg-clari-darkAccent">
                <BarChart3 className="text-clari-gold" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-clari-muted font-medium">Recent Activity</p>
                <p className="text-3xl font-bold text-clari-text mt-1">{recentActivities.length}</p>
                <p className="text-xs text-clari-muted mt-1">Last 10 responses</p>
              </div>
              <div className="p-3 rounded-full bg-clari-darkAccent">
                <TrendingUp className="text-clari-gold" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-clari-darkCard border-clari-darkAccent">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Activity className="text-clari-gold" size={20} />
            Recent Survey Responses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="mx-auto text-clari-muted mb-4" size={48} />
                <p className="text-clari-muted text-lg font-medium">No recent responses</p>
                <p className="text-clari-muted/70 text-sm">Survey responses will appear here in real-time</p>
              </div>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-clari-darkBg rounded-lg border border-clari-darkAccent/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="default" className="bg-clari-gold text-black font-medium">
                        New Response
                      </Badge>
                      <span className="text-sm text-clari-muted font-medium">
                        {getBusinessName(activity.survey?.business_id)}
                      </span>
                    </div>
                    <p className="text-clari-text font-medium">
                      {activity.survey?.title || 'Survey Response'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-clari-muted font-medium">
                      {formatTimeAgo(activity.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeStats;
