
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Link, BarChart2, BrainCircuit } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSurveysForBusiness } from "@/utils/supabase/businessHelpers";
import { getSurveySubmissionStats } from "@/utils/supabase/surveySubmissionHelpers";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface BusinessSurveyCardProps {
  business: any;
}

const BusinessSurveyCard: React.FC<BusinessSurveyCardProps> = ({ business }) => {
  const { data: surveysResult } = useQuery({
    queryKey: ['business-surveys', business.id],
    queryFn: () => fetchSurveysForBusiness(business.id)
  });

  const surveys = surveysResult?.success ? surveysResult.data || [] : [];

  return (
    <Card className="bg-clari-darkCard border-clari-darkAccent">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="text-clari-gold" size={24} />
            <div>
              <CardTitle>{business.name}</CardTitle>
              <p className="text-sm text-clari-muted mt-1">{business.description}</p>
            </div>
          </div>
          {business.website && (
            <Button variant="outline" size="sm" asChild>
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="gap-2">
                <Link size={14} />
                Website
              </a>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Business Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-clari-muted">
            <FileText size={16} />
            <span>{surveys.length} Surveys</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <RouterLink to={`/survey/create/${business.id}`} className="gap-2">
                <FileText size={14} />
                Create Survey
              </RouterLink>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <RouterLink to={`/business/${business.id}`} className="gap-2">
                <BarChart2 size={14} />
                Analysis
              </RouterLink>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <RouterLink to={`/ai-insights/${business.id}`} className="gap-2">
                <BrainCircuit size={14} />
                AI Insights
              </RouterLink>
            </Button>
          </div>
        </div>

        {/* Surveys List with Visualizations */}
        {surveys.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-clari-text">Surveys & Responses</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {surveys.map((survey) => (
                <SurveyResponseCard key={survey.id} survey={survey} />
              ))}
            </div>
          </div>
        )}

        {surveys.length === 0 && (
          <div className="text-center py-8 border border-dashed border-clari-darkAccent rounded-lg">
            <FileText className="text-clari-muted mx-auto mb-3" size={32} />
            <p className="text-clari-muted">No surveys created yet</p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <RouterLink to={`/survey/create/${business.id}`}>
                Create First Survey
              </RouterLink>
            </Button>
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

  // Create pie chart data for visualization
  const pieData = [
    {
      name: 'Completed',
      value: totalSubmissions,
      color: '#F59E0B' // clari-gold
    },
    {
      name: 'Pending',
      value: Math.max(0, 10 - totalSubmissions), // Assuming target of 10 responses
      color: '#374151' // clari-darkAccent
    }
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent === 0) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="bg-clari-darkBg border-clari-darkAccent/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h5 className="font-medium text-clari-text truncate">{survey.title}</h5>
            <p className="text-sm text-clari-muted mt-1">
              {totalSubmissions} response{totalSubmissions !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <div className="w-16 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={30}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="text-xs">
            <RouterLink to={`/survey-results/${survey.id}`}>
              View Results
            </RouterLink>
          </Button>
          <Button variant="outline" size="sm" asChild className="text-xs">
            <RouterLink to={`/survey/${survey.id}`}>
              Take Survey
            </RouterLink>
          </Button>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-clari-gold rounded-full"></div>
            <span className="text-clari-muted">Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-clari-darkAccent rounded-full"></div>
            <span className="text-clari-muted">Pending</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessSurveyCard;
