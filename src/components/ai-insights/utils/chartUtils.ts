
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
    // First, try to find JSON data in code blocks
    const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/) || 
                     content.match(/```\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/);
    
    let jsonStr = '';
    
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      // If no code blocks found, try to extract JSON object directly from content
      // Look for JSON object that starts with { and has type, data properties
      const directJsonMatch = content.match(/\{\s*"type"\s*:\s*"(bar|line|pie)"[\s\S]*?\}/);
      if (directJsonMatch) {
        jsonStr = directJsonMatch[0];
      } else {
        // Try to find any JSON-like structure
        const anyJsonMatch = content.match(/(\{[\s\S]*?"type"[\s\S]*?\})/);
        if (anyJsonMatch) {
          jsonStr = anyJsonMatch[1];
        }
      }
    }
    
    if (!jsonStr) return null;

    // Clean up the JSON string - remove any trailing commas or incomplete parts
    jsonStr = jsonStr.trim();
    
    // Try to parse the JSON
    const parsedData = JSON.parse(jsonStr);
    
    // Validate that it's a proper chart data structure
    if (parsedData.type && parsedData.data && Array.isArray(parsedData.data)) {
      return parsedData as ChartData;
    }
    
    // If it's an array, try to infer chart type
    if (Array.isArray(parsedData)) {
      return inferChartType(parsedData);
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing chart data:', error);
    console.log('Content that failed to parse:', content);
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
