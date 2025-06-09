
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Instagram, 
  MapPin, 
  Users, 
  Clock, 
  ExternalLink,
  Hash
} from 'lucide-react';
import { fetchInstagramData, getInstagramDataStats } from '@/utils/supabase/instagramDataHelpers';

const InstagramDataAnalytics = () => {
  const { data: instagramData, isLoading: isLoadingData } = useQuery({
    queryKey: ['instagram-data'],
    queryFn: () => fetchInstagramData(20)
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['instagram-stats'],
    queryFn: getInstagramDataStats
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Group data by location for analytics
  const locationStats = React.useMemo(() => {
    if (!instagramData?.success || !instagramData.data) return {};
    
    const grouped = instagramData.data.reduce((acc: Record<string, number>, item) => {
      const location = item.location || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});
    
    return grouped;
  }, [instagramData]);

  if (isLoadingData || isLoadingStats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-clari-darkCard border-clari-darkAccent animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-clari-darkBg rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const data = instagramData?.success ? instagramData.data || [] : [];
  const statsData = stats?.success ? stats.data : null;

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-clari-muted font-medium">Total People Found</p>
                <p className="text-3xl font-bold text-clari-text mt-1">
                  {statsData?.totalRecords || 0}
                </p>
                <p className="text-xs text-clari-muted mt-1">Instagram users scraped</p>
              </div>
              <div className="p-3 rounded-full bg-pink-500/20">
                <Instagram className="text-pink-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-clari-muted font-medium">Unique Locations</p>
                <p className="text-3xl font-bold text-clari-text mt-1">
                  {statsData?.uniqueLocations || 0}
                </p>
                <p className="text-xs text-clari-muted mt-1">Areas covered</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/20">
                <MapPin className="text-blue-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-clari-darkCard border-clari-darkAccent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-clari-muted font-medium">Recent Data</p>
                <p className="text-3xl font-bold text-clari-text mt-1">
                  {statsData?.recentRecords || 0}
                </p>
                <p className="text-xs text-clari-muted mt-1">Last 24 hours</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/20">
                <Clock className="text-green-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Breakdown */}
      <Card className="bg-clari-darkCard border-clari-darkAccent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-clari-text">
            <MapPin className="text-clari-gold" size={20} />
            Location Distribution
          </CardTitle>
          <CardDescription>People found by location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(locationStats).map(([location, count]) => (
              <div key={location} className="text-center p-4 bg-clari-darkBg rounded-lg border border-clari-darkAccent/50">
                <div className="text-2xl font-bold text-clari-gold mb-1">{count}</div>
                <div className="text-sm text-clari-muted font-medium">{location}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instagram Users List */}
      <Card className="bg-clari-darkCard border-clari-darkAccent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-clari-text">
            <Users className="text-clari-gold" size={20} />
            Instagram Users ({data.length})
          </CardTitle>
          <CardDescription>Recently scraped Instagram data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.length === 0 ? (
              <div className="text-center py-8">
                <Instagram className="mx-auto text-clari-muted mb-3" size={48} />
                <p className="text-clari-muted text-lg">No Instagram data found</p>
                <p className="text-clari-muted/70 text-sm">Scraped data will appear here</p>
              </div>
            ) : (
              data.map((user) => (
                <div key={user.id} className="p-4 bg-clari-darkBg rounded-lg border border-clari-darkAccent/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Instagram size={16} className="text-pink-400" />
                          <span className="font-medium text-clari-text">@{user.instagram_username}</span>
                        </div>
                        <Badge variant="outline" className="bg-clari-gold/10 text-clari-gold border-clari-gold/30">
                          <MapPin size={12} className="mr-1" />
                          {user.location}
                        </Badge>
                      </div>
                      
                      <p className="text-clari-text font-medium mb-1">{user.owner_full_name}</p>
                      
                      {user.post_caption && (
                        <p className="text-sm text-clari-muted mb-2">
                          {truncateText(user.post_caption, 150)}
                        </p>
                      )}
                      
                      {user.hashtags && user.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {user.hashtags.slice(0, 5).map((hashtag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Hash size={10} className="mr-1" />
                              {hashtag}
                            </Badge>
                          ))}
                          {user.hashtags.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{user.hashtags.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-clari-muted">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {user.post_timestamp ? formatDate(user.post_timestamp) : 'No date'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {user.profile_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={user.profile_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={14} className="mr-1" />
                            Profile
                          </a>
                        </Button>
                      )}
                      {user.post_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={user.post_url} target="_blank" rel="noopener noreferrer">
                            <Instagram size={14} className="mr-1" />
                            Post
                          </a>
                        </Button>
                      )}
                    </div>
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

export default InstagramDataAnalytics;
