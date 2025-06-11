
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, TrendingUp, Clock, Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchBusinesses } from '@/utils/supabase/businessHelpers';
import { getSurveySubmissionStats } from '@/utils/supabase/surveySubmissionHelpers';
import { fetchSurveysForBusiness } from '@/utils/supabase/businessHelpers';

interface BusinessStats {
  totalSubmissions: number;
  submissionsByDate: Record<string, number>;
  latestSubmissionDate?: string;
}

const BusinessStatsDropdown = () => {
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [businessStats, setBusinessStats] = useState<Record<string, BusinessStats>>({});

  const { data: businessesResult } = useQuery({
    queryKey: ['businesses'],
    queryFn: fetchBusinesses
  });

  const businesses = businessesResult?.success ? businessesResult.data || [] : [];

  const { data: surveysResult } = useQuery({
    queryKey: ['surveys', selectedBusinessId],
    queryFn: () => selectedBusinessId ? fetchSurveysForBusiness(selectedBusinessId) : null,
    enabled: !!selectedBusinessId
  });

  const surveys = surveysResult?.success ? surveysResult.data || [] : [];

  // Fetch stats for all surveys when business is selected
  useEffect(() => {
    const fetchStatsForBusiness = async () => {
      if (!selectedBusinessId || !surveys.length) return;

      const stats: BusinessStats = {
        totalSubmissions: 0,
        submissionsByDate: {},
        latestSubmissionDate: undefined
      };

      for (const survey of surveys) {
        try {
          const result = await getSurveySubmissionStats(survey.id);
          if (result.success && result.data) {
            stats.totalSubmissions += result.data.totalSubmissions;
            
            // Merge submission dates
            Object.entries(result.data.submissionsByDate).forEach(([date, count]) => {
              stats.submissionsByDate[date] = (stats.submissionsByDate[date] || 0) + (typeof count === 'number' ? count : 0);
            });

            // Update latest submission date
            if (result.data.latestSubmissionDate) {
              if (!stats.latestSubmissionDate || 
                  new Date(result.data.latestSubmissionDate) > new Date(stats.latestSubmissionDate)) {
                stats.latestSubmissionDate = result.data.latestSubmissionDate;
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching stats for survey ${survey.id}:`, error);
        }
      }

      setBusinessStats(prev => ({
        ...prev,
        [selectedBusinessId]: stats
      }));
    };

    fetchStatsForBusiness();
  }, [selectedBusinessId, surveys]);

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);
  const currentStats = selectedBusinessId ? businessStats[selectedBusinessId] : null;

  const getRecentTrend = () => {
    if (!currentStats?.submissionsByDate) return 0;
    
    const dates = Object.keys(currentStats.submissionsByDate).sort();
    if (dates.length < 2) return 0;
    
    const recent = currentStats.submissionsByDate[dates[dates.length - 1]] || 0;
    const previous = currentStats.submissionsByDate[dates[dates.length - 2]] || 0;
    
    return recent - previous;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Prominent Business Selector */}
      <div className="bg-clari-darkBg p-6 rounded-lg border border-clari-darkAccent">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="text-clari-gold" size={24} />
          <h3 className="text-xl font-semibold text-clari-text">Select Business</h3>
        </div>
        
        <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
          <SelectTrigger className="w-full h-12 text-lg bg-clari-darkCard border-clari-darkAccent hover:border-clari-gold/50 transition-colors">
            <SelectValue placeholder="🏢 Choose a business to view detailed analytics..." />
          </SelectTrigger>
          <SelectContent className="bg-clari-darkCard border-clari-darkAccent max-h-60">
            {businesses.length === 0 ? (
              <div className="p-4 text-center text-clari-muted">
                <Building2 className="mx-auto mb-2" size={24} />
                <p>No businesses found</p>
                <p className="text-sm">Create a business first to see analytics</p>
              </div>
            ) : (
              businesses.map((business) => (
                <SelectItem key={business.id} value={business.id} className="py-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Building2 size={16} className="text-clari-gold" />
                      <span className="font-medium">{business.name}</span>
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                      {business.survey_count || 0} surveys
                    </Badge>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Business Statistics Display */}
      {selectedBusiness && (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-clari-darkBg border-clari-darkAccent">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="text-clari-gold" size={20} />
                  <span className="text-sm font-medium text-clari-muted">Total Responses</span>
                </div>
                <div className="text-3xl font-bold text-clari-text">
                  {currentStats?.totalSubmissions || 0}
                </div>
                <p className="text-xs text-clari-muted mt-1">All surveys combined</p>
              </CardContent>
            </Card>

            <Card className="bg-clari-darkBg border-clari-darkAccent">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-clari-gold" size={20} />
                  <span className="text-sm font-medium text-clari-muted">Recent Trend</span>
                </div>
                <div className="text-3xl font-bold text-clari-text">
                  {getRecentTrend() > 0 ? '+' : ''}{getRecentTrend()}
                </div>
                <p className="text-xs text-clari-muted mt-1">Daily change</p>
              </CardContent>
            </Card>

            <Card className="bg-clari-darkBg border-clari-darkAccent">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="text-clari-gold" size={20} />
                  <span className="text-sm font-medium text-clari-muted">Latest Response</span>
                </div>
                <div className="text-lg font-semibold text-clari-text">
                  {formatDate(currentStats?.latestSubmissionDate)}
                </div>
                <p className="text-xs text-clari-muted mt-1">Most recent activity</p>
              </CardContent>
            </Card>
          </div>

          {/* Surveys List */}
          <Card className="bg-clari-darkBg border-clari-darkAccent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-clari-text">
                <BarChart3 className="text-clari-gold" size={20} />
                Active Surveys ({surveys.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {surveys.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto text-clari-muted mb-3" size={48} />
                  <p className="text-clari-muted text-lg">No surveys found</p>
                  <p className="text-clari-muted/70 text-sm">Create a survey for this business to see analytics</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {surveys.map((survey) => (
                    <div key={survey.id} className="flex items-center justify-between p-4 bg-clari-darkCard rounded-lg border border-clari-darkAccent/50">
                      <div className="flex-1">
                        <h4 className="font-medium text-clari-text">{survey.title}</h4>
                        <p className="text-sm text-clari-muted mt-1">
                          {survey.description || 'No description provided'}
                        </p>
                      </div>
                      <Badge 
                        variant={survey.is_active ? "default" : "secondary"}
                        className={survey.is_active ? "bg-clari-gold text-black" : ""}
                      >
                        {survey.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedBusinessId && (
        <div className="text-center py-12">
          <Building2 className="mx-auto text-clari-muted mb-4" size={64} />
          <h3 className="text-xl font-semibold text-clari-text mb-2">Select a Business</h3>
          <p className="text-clari-muted">Choose a business from the dropdown above to view detailed analytics and survey statistics.</p>
        </div>
      )}
    </div>
  );
};

export default BusinessStatsDropdown;
