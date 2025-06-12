import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Link, BarChart2, BrainCircuit, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSurveysForBusiness } from "@/utils/supabase/businessHelpers";
import { getSurveySubmissionStats } from "@/utils/supabase/surveySubmissionHelpers";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface BusinessSurveyCardProps {
  business: any;
}

const BusinessSurveyCard: React.FC<BusinessSurveyCardProps> = ({ business }) => {
  const [showSurveyAnalytics, setShowSurveyAnalytics] = useState(false);
  
  const { data: surveysResult } = useQuery({
    queryKey: ['business-surveys', business.id],
    queryFn: () => fetchSurveysForBusiness(business.id)
  });

  const surveys = surveysResult?.success ? surveysResult.data || [] : [];

  return (
    <Card className="bg-gradient-to-br from-clari-darkCard to-clari-darkBg border-clari-darkAccent/30 shadow-2xl hover:shadow-clari-gold/10 transition-all duration-300 hover:border-clari-gold/30">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-clari-gold/20 to-clari-gold/10 rounded-xl border border-clari-gold/20">
              <Building2 className="text-clari-gold" size={28} />
            </div>
            <div>
              <CardTitle className="text-xl bg-gradient-to-r from-clari-text to-clari-text/80 bg-clip-text text-transparent">
                {business.name}
              </CardTitle>
              <p className="text-sm text-clari-muted mt-2 max-w-md">{business.description}</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-clari-darkAccent/50 rounded-full">
                  <FileText size={14} className="text-clari-gold" />
                  <span className="text-xs text-clari-text font-medium">{surveys.length} Surveys</span>
                </div>
                {surveys.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
                    <TrendingUp size={14} className="text-green-400" />
                    <span className="text-xs text-green-400 font-medium">Active</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {business.website && (
            <Button variant="outline" size="sm" className="border-clari-gold/30 text-clari-gold hover:bg-clari-gold/10" asChild>
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="gap-2">
                <Link size={14} />
                Visit
              </a>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 min-w-[120px] border-clari-darkAccent/50 hover:border-blue-400/30 hover:bg-blue-400/5"
            onClick={() => setShowSurveyAnalytics(!showSurveyAnalytics)}
          >
            <BarChart2 size={14} className="mr-2" />
            Survey
            {showSurveyAnalytics ? (
              <ChevronUp size={14} className="ml-2" />
            ) : (
              <ChevronDown size={14} className="ml-2" />
            )}
          </Button>
          <Button variant="outline" size="sm" className="flex-1 min-w-[120px] border-clari-darkAccent/50 hover:border-purple-400/30 hover:bg-purple-400/5" asChild>
            <RouterLink to={`/ai-insights/${business.id}`} className="gap-2">
              <BrainCircuit size={14} />
              AI Insights
            </RouterLink>
          </Button>
        </div>

        {/* Collapsible Survey Analytics */}
        {showSurveyAnalytics && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            {surveys.length > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="h-px bg-gradient-to-r from-clari-gold/50 to-transparent flex-1"></div>
                  <h4 className="text-sm font-medium text-clari-text/80 px-3">Survey Analytics</h4>
                  <div className="h-px bg-gradient-to-l from-clari-gold/50 to-transparent flex-1"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {surveys.map((survey) => (
                    <SurveyResponseCard key={survey.id} survey={survey} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-clari-darkAccent/50 rounded-xl bg-gradient-to-b from-clari-darkAccent/10 to-transparent">
                <div className="p-4 bg-clari-darkAccent/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <FileText className="text-clari-muted" size={36} />
                </div>
                <h3 className="text-lg font-medium text-clari-text mb-2">No surveys yet</h3>
                <p className="text-clari-muted mb-6 max-w-sm mx-auto">Create your first survey to start collecting valuable customer feedback and insights.</p>
                <Button className="bg-gradient-to-r from-clari-gold to-clari-gold/80 hover:from-clari-gold/90 hover:to-clari-gold/70 text-clari-darkBg font-medium" asChild>
                  <RouterLink to={`/survey/create/${business.id}`}>
                    Create First Survey
                  </RouterLink>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SurveyResponseCard: React.FC<{ survey: any }> = ({ survey }) => {
  const { data: statsResult } = useQuery({
    queryKey: ['survey-stats', survey.id],
    queryFn: () => getSurveySubmissionStats(survey.id)
  });

  const stats = statsResult?.success ? statsResult.data : null;
  const totalSubmissions = stats?.totalSubmissions || 0;

  const pieData = [
    {
      name: 'Completed',
      value: totalSubmissions,
      color: '#F59E0B'
    },
    {
      name: 'Pending',
      value: Math.max(0, 10 - totalSubmissions),
      color: '#374151'
    }
  ];

  const completionRate = totalSubmissions > 0 ? (totalSubmissions / 10) * 100 : 0;

  return (
    <Card className="bg-gradient-to-br from-clari-darkBg/80 to-clari-darkCard/50 border-clari-darkAccent/30 hover:border-clari-gold/20 transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-clari-gold rounded-full"></div>
              <h5 className="font-semibold text-clari-text truncate text-sm">{survey.title}</h5>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-clari-muted">
                {totalSubmissions} response{totalSubmissions !== 1 ? 's' : ''} collected
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-clari-darkAccent/50 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-clari-gold to-clari-gold/70 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(completionRate, 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-clari-gold font-medium">{completionRate.toFixed(0)}%</span>
              </div>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <div className="w-16 h-16 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={30}
                    innerRadius={18}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#242424',
                      border: '1px solid #2A2A2A',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" className="flex-1 text-xs border-clari-darkAccent/50 hover:border-clari-gold/30 hover:bg-clari-gold/5" asChild>
            <RouterLink to={`/survey-results/${survey.id}`}>
              View Results
            </RouterLink>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs border-clari-darkAccent/50 hover:border-blue-400/30 hover:bg-blue-400/5" asChild>
            <RouterLink to={`/survey/${survey.id}`}>
              Take Survey
            </RouterLink>
          </Button>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-clari-gold rounded-full"></div>
            <span className="text-clari-muted">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-clari-darkAccent rounded-full"></div>
            <span className="text-clari-muted">Pending</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessSurveyCard;
