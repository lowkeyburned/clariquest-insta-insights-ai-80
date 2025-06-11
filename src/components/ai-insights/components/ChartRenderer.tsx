
import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface ChartData {
  type: 'bar' | 'line' | 'pie';
  data: any[];
  title?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  dataKeys?: string[];
}

interface ChartRendererProps {
  chartData: ChartData;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff7f', '#ff1493', '#00bfff', '#ffd700'];

const ChartRenderer: React.FC<ChartRendererProps> = ({ chartData }) => {
  const { type, data, title, xAxisKey = 'name', yAxisKey = 'value', dataKeys = ['value'] } = chartData;

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-clari-darkBg border border-clari-darkAccent rounded-lg">
        <p className="text-clari-muted">No data available for chart</p>
      </div>
    );
  }

  // Generate chart summary and insights
  const generateChartSummary = () => {
    const dataPoints = data.length;
    let summary = '';
    let insights = [];

    switch (type) {
      case 'bar':
        summary = `This bar chart displays ${dataPoints} categories with their corresponding values. `;
        
        if (dataKeys.length > 1) {
          summary += `It compares ${dataKeys.join(', ')} across different categories, making it easy to identify patterns and differences.`;
          insights.push(`📊 Multi-series comparison showing ${dataKeys.length} metrics`);
        } else {
          summary += `It shows the distribution of ${dataKeys[0]} across different categories.`;
          insights.push(`📈 Single metric analysis across ${dataPoints} categories`);
        }

        // Find highest and lowest values
        if (data.length > 0 && dataKeys.length > 0) {
          const values = data.map(item => item[dataKeys[0]]).filter(val => typeof val === 'number');
          if (values.length > 0) {
            const maxValue = Math.max(...values);
            const minValue = Math.min(...values);
            const maxItem = data.find(item => item[dataKeys[0]] === maxValue);
            const minItem = data.find(item => item[dataKeys[0]] === minValue);
            
            if (maxItem) insights.push(`🔝 Highest: ${maxItem[xAxisKey]} (${maxValue})`);
            if (minItem && minValue !== maxValue) insights.push(`🔻 Lowest: ${minItem[xAxisKey]} (${minValue})`);
          }
        }
        break;

      case 'line':
        summary = `This line chart tracks changes over ${dataPoints} time periods. `;
        
        if (dataKeys.length > 1) {
          summary += `It shows trends for ${dataKeys.join(', ')}, helping identify patterns and correlations over time.`;
          insights.push(`📈 Time series analysis with ${dataKeys.length} trend lines`);
        } else {
          summary += `It reveals the trend and progression of ${dataKeys[0]} over time.`;
          insights.push(`⏱️ Single metric trend over ${dataPoints} periods`);
        }

        // Analyze trend direction
        if (data.length >= 2 && dataKeys.length > 0) {
          const firstValue = data[0][dataKeys[0]];
          const lastValue = data[data.length - 1][dataKeys[0]];
          if (typeof firstValue === 'number' && typeof lastValue === 'number') {
            const change = ((lastValue - firstValue) / firstValue * 100).toFixed(1);
            const direction = lastValue > firstValue ? '📈' : lastValue < firstValue ? '📉' : '➡️';
            insights.push(`${direction} Overall change: ${change}%`);
          }
        }
        break;

      case 'pie':
        summary = `This pie chart shows the proportional breakdown of ${dataPoints} segments. `;
        summary += `Each slice represents a portion of the total, making it easy to see relative sizes and market share.`;
        insights.push(`🥧 ${dataPoints} segments with proportional distribution`);

        // Calculate total and percentages
        if (data.length > 0 && yAxisKey) {
          const total = data.reduce((sum, item) => sum + (typeof item[yAxisKey] === 'number' ? item[yAxisKey] : 0), 0);
          const largest = data.reduce((max, item) => 
            (typeof item[yAxisKey] === 'number' && item[yAxisKey] > (typeof max[yAxisKey] === 'number' ? max[yAxisKey] : 0)) ? item : max
          );
          
          if (total > 0 && largest) {
            const percentage = ((largest[yAxisKey] / total) * 100).toFixed(1);
            insights.push(`👑 Largest segment: ${largest[xAxisKey]} (${percentage}%)`);
          }
        }
        break;
    }

    return { summary, insights };
  };

  const { summary, insights } = generateChartSummary();

  const renderBarChart = () => (
    <ChartContainer
      config={{
        value: {
          label: "Value",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-64 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey={xAxisKey} 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar 
              key={key}
              dataKey={key} 
              fill={COLORS[index % COLORS.length]}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );

  const renderLineChart = () => (
    <ChartContainer
      config={{
        value: {
          label: "Value",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-64 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey={xAxisKey} 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          {dataKeys.map((key, index) => (
            <Line 
              key={key}
              type="monotone" 
              dataKey={key} 
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );

  const renderPieChart = () => (
    <ChartContainer
      config={{
        value: {
          label: "Value",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-64 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={yAxisKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );

  const getChartIcon = () => {
    switch (type) {
      case 'bar': return BarChart3;
      case 'line': return TrendingUp;
      case 'pie': return PieChartIcon;
      default: return BarChart3;
    }
  };

  const ChartIcon = getChartIcon();

  return (
    <div className="w-full bg-clari-darkCard border border-clari-darkAccent rounded-lg p-6 space-y-4">
      {/* Chart Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-clari-gold/10">
          <ChartIcon className="text-clari-gold" size={20} />
        </div>
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-clari-text">{title}</h3>
          )}
          <p className="text-sm text-clari-muted capitalize">{type} Chart Visualization</p>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="bg-clari-darkBg rounded-lg p-4">
        {type === 'bar' && renderBarChart()}
        {type === 'line' && renderLineChart()}
        {type === 'pie' && renderPieChart()}
      </div>

      {/* Chart Summary and Insights */}
      <div className="space-y-3">
        <div className="p-4 bg-clari-darkBg rounded-lg border border-clari-darkAccent/50">
          <h4 className="text-sm font-medium text-clari-gold mb-2">Chart Analysis</h4>
          <p className="text-sm text-clari-text leading-relaxed">{summary}</p>
        </div>

        {insights.length > 0 && (
          <div className="p-4 bg-clari-gold/5 rounded-lg border border-clari-gold/20">
            <h4 className="text-sm font-medium text-clari-gold mb-2">Key Insights</h4>
            <ul className="space-y-1">
              {insights.map((insight, index) => (
                <li key={index} className="text-sm text-clari-text flex items-start gap-2">
                  <span className="text-clari-gold">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartRenderer;
