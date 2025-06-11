
interface ChartData {
  type: 'bar' | 'line' | 'pie';
  data: any[];
  title?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  dataKeys?: string[];
}

export const detectChartData = (content: string): ChartData | null => {
  try {
    // Try to find JSON data in the content
    const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/) || 
                     content.match(/(\{[\s\S]*?\}|\[[\s\S]*?\])(?=\s*$|\s*[^\{\[])/);
    
    if (!jsonMatch) return null;

    const jsonStr = jsonMatch[1];
    const parsedData = JSON.parse(jsonStr);
    
    // Detect chart type and format data
    if (Array.isArray(parsedData)) {
      return inferChartType(parsedData);
    } else if (parsedData.type && parsedData.data) {
      return parsedData as ChartData;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing chart data:', error);
    return null;
  }
};

const inferChartType = (data: any[]): ChartData | null => {
  if (!data.length) return null;

  const firstItem = data[0];
  const keys = Object.keys(firstItem);
  
  // Detect pie chart (has 'name' and 'value' or 'fill' property)
  if (keys.includes('name') && keys.includes('value') && data.length <= 10) {
    return {
      type: 'pie',
      data: data,
      xAxisKey: 'name',
      yAxisKey: 'value',
      dataKeys: ['value']
    };
  }
  
  // Detect line chart (has time-series like data or multiple numeric values)
  const numericKeys = keys.filter(key => 
    key !== 'name' && key !== 'month' && key !== 'date' && 
    typeof firstItem[key] === 'number'
  );
  
  if (numericKeys.length > 1) {
    const xKey = keys.find(key => 
      ['name', 'month', 'date', 'time', 'period'].includes(key.toLowerCase())
    ) || keys[0];
    
    return {
      type: 'line',
      data: data,
      xAxisKey: xKey,
      dataKeys: numericKeys
    };
  }
  
  // Default to bar chart
  const xKey = keys.find(key => 
    ['name', 'category', 'label'].includes(key.toLowerCase())
  ) || keys[0];
  
  const yKey = keys.find(key => 
    ['value', 'amount', 'count', 'total'].includes(key.toLowerCase())
  ) || numericKeys[0];
  
  return {
    type: 'bar',
    data: data,
    xAxisKey: xKey,
    yAxisKey: yKey,
    dataKeys: yKey ? [yKey] : numericKeys
  };
};

// Sample data generators for testing
export const generateSampleBarData = () => ({
  type: 'bar' as const,
  data: [
    { name: 'Jan', sales: 4000, expenses: 2400 },
    { name: 'Feb', sales: 3000, expenses: 1398 },
    { name: 'Mar', sales: 2000, expenses: 9800 },
    { name: 'Apr', sales: 2780, expenses: 3908 },
    { name: 'May', sales: 1890, expenses: 4800 },
    { name: 'Jun', sales: 2390, expenses: 3800 }
  ],
  title: 'Monthly Sales vs Expenses',
  xAxisKey: 'name',
  dataKeys: ['sales', 'expenses']
});

export const generateSampleLineData = () => ({
  type: 'line' as const,
  data: [
    { month: 'Jan', revenue: 4000, profit: 2400 },
    { month: 'Feb', revenue: 3000, profit: 1398 },
    { month: 'Mar', revenue: 2000, profit: -800 },
    { month: 'Apr', revenue: 2780, profit: 908 },
    { month: 'May', revenue: 1890, profit: 800 },
    { month: 'Jun', revenue: 2390, profit: 1200 }
  ],
  title: 'Revenue and Profit Trends',
  xAxisKey: 'month',
  dataKeys: ['revenue', 'profit']
});

export const generateSamplePieData = () => ({
  type: 'pie' as const,
  data: [
    { name: 'Desktop', value: 400, fill: '#8884d8' },
    { name: 'Mobile', value: 300, fill: '#82ca9d' },
    { name: 'Tablet', value: 200, fill: '#ffc658' },
    { name: 'Smart TV', value: 100, fill: '#ff7300' }
  ],
  title: 'Device Usage Distribution',
  xAxisKey: 'name',
  yAxisKey: 'value',
  dataKeys: ['value']
});
