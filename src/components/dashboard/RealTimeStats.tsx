
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
  const [liveCount, setLiveCount] = useState(0);

  const { data: businessesResult } = useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses
  });

  const businesses = businessesResult?.success ? businessesResult.data || [] : [];

  useEffect(() => {
    // Fetch initial recent activities
    const fetchRecentActivities = async () => {
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
        setLiveCount(data.length);
      }
    };

    fetchRecentActivities();

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
          setLiveCount(prev => prev + 1);
          
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-clari-muted">Live Responses</p>
                <p className="text-2xl font-bold text-clari-text">{liveCount}</p>
              </div>
              <div className="p-3 rounded-full bg-clari-darkAccent">
                <Activity className="text-clari-gold animate-pulse" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-clari-muted">Active Businesses</p>
                <p className="text-2xl font-bold text-clari-text">{businesses.length}</p>
              </div>
              <div className="p-3 rounded-full bg-clari-darkAccent">
                <BarChart3 className="text-clari-gold" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-clari-muted">Response Rate</p>
                <p className="text-2xl font-bold text-clari-text">
                  {recentActivities.length > 0 ? '↗️' : '→'} 
                  {recentActivities.length > 5 ? 'High' : 'Moderate'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-clari-darkAccent">
                <TrendingUp className="text-clari-gold" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-clari-darkCard border-clari-darkAccent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="text-clari-gold animate-pulse" size={20} />
            Live Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <p className="text-center text-clari-muted py-8">
                No recent activity. Start collecting survey responses!
              </p>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-clari-darkBg rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-clari-gold text-black">
                        New Response
                      </Badge>
                      <span className="text-sm text-clari-muted">
                        {getBusinessName(activity.survey?.business_id)}
                      </span>
                    </div>
                    <p className="text-sm text-clari-text mt-1">
                      {activity.survey?.title || 'Survey Response'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-clari-muted">
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
