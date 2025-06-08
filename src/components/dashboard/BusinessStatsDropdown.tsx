
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, TrendingUp, Clock } from 'lucide-react';
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
              stats.submissionsByDate[date] = (stats.submissionsByDate[date] || 0) + count;
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
      <Card className="bg-clari-darkCard border-clari-darkAccent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="text-clari-gold" size={20} />
            Business Survey Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-clari-muted mb-2 block">
                Select Business
              </label>
              <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
                <SelectTrigger className="bg-clari-darkBg border-clari-darkAccent">
                  <SelectValue placeholder="Choose a business to view analytics" />
                </SelectTrigger>
                <SelectContent className="bg-clari-darkBg border-clari-darkAccent">
                  {businesses.map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{business.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {business.survey_count || 0} surveys
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBusiness && (
              <div className="pt-4 border-t border-clari-darkAccent">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-clari-darkBg p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="text-clari-gold" size={16} />
                      <span className="text-sm text-clari-muted">Total Responses</span>
                    </div>
                    <div className="text-2xl font-bold text-clari-text">
                      {currentStats?.totalSubmissions || 0}
                    </div>
                  </div>

                  <div className="bg-clari-darkBg p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="text-clari-gold" size={16} />
                      <span className="text-sm text-clari-muted">Recent Trend</span>
                    </div>
                    <div className="text-2xl font-bold text-clari-text">
                      {getRecentTrend() > 0 ? '+' : ''}{getRecentTrend()}
                    </div>
                  </div>

                  <div className="bg-clari-darkBg p-4 rounded-lg col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="text-clari-gold" size={16} />
                      <span className="text-sm text-clari-muted">Latest Response</span>
                    </div>
                    <div className="text-lg font-semibold text-clari-text">
                      {formatDate(currentStats?.latestSubmissionDate)}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-clari-muted mb-2">Active Surveys</h4>
                  <div className="space-y-2">
                    {surveys.map((survey) => (
                      <div key={survey.id} className="flex items-center justify-between p-2 bg-clari-darkBg rounded">
                        <span className="text-sm text-clari-text">{survey.title}</span>
                        <Badge variant={survey.is_active ? "default" : "secondary"}>
                          {survey.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessStatsDropdown;
