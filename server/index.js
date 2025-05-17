
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5678;

// Enable CORS for all routes
app.use(cors({
  origin: '*',  // In production, replace with specific origins
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(bodyParser.json());

// Main webhook route
app.post('/webhook/:webhookId', async (req, res) => {
  try {
    const { webhookId } = req.params;
    const { message, businessName, businessId, businessDescription } = req.body;
    
    console.log(`Webhook ${webhookId} received message from business: ${businessName} (${businessId})`);
    console.log(`Message: ${message}`);
    
    // Simple logic to detect if this is about surveys
    const isSurveyRelated = 
      message.toLowerCase().includes('survey') || 
      message.toLowerCase().includes('feedback') ||
      message.toLowerCase().includes('customer');
    
    // Generate a response based on the message content
    let response;
    
    if (message.toLowerCase().includes('analyze') || message.toLowerCase().includes('trends')) {
      response = `Based on the data for ${businessName}, I've analyzed recent trends showing an increase in customer engagement by 12% month-over-month. Key areas of customer satisfaction include product quality and customer service. Areas for improvement include website usability and response time.`;
    } else if (message.toLowerCase().includes('survey')) {
      response = `For ${businessName}, I recommend creating a customer satisfaction survey that focuses on the following areas:\n\n1. Overall satisfaction\n2. Product quality assessment\n3. Customer service experience\n4. Website usability\n5. Purchasing process\n\nWould you like me to help you create this survey?`;
    } else if (message.toLowerCase().includes('feedback')) {
      response = `The most common feedback themes for ${businessName} are:\n\n- Positive: Friendly staff, quality products, competitive pricing\n- Areas for improvement: Website navigation, checkout process, response time to inquiries\n\nWould you like specific recommendations to address these points?`;
    } else {
      response = `Thank you for your question about ${businessName}. To provide more specific insights, I'd need to know more about what particular business data you're interested in analyzing. Would you like to know about customer satisfaction, sales trends, or marketing effectiveness?`;
    }
    
    // Delay to simulate processing time
    setTimeout(() => {
      res.json({
        message: response,
        success: true,
        isSurveyRelated: isSurveyRelated
      });
    }, 1000);
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      message: 'Sorry, there was an error processing your request.',
      success: false,
      error: error.message
    });
  }
});

// Test webhook route for Instagram campaigns
app.post('/webhook-test/:webhookId', async (req, res) => {
  try {
    const { webhookId } = req.params;
    console.log(`Test webhook ${webhookId} received data:`, req.body);
    
    // Send a successful response
    setTimeout(() => {
      res.json({
        message: 'Test webhook received data successfully',
        success: true,
        receivedData: req.body
      });
    }, 500);
    
  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({
      message: 'Error processing test webhook request',
      success: false,
      error: error.message
    });
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('AI Insights Webhook Server is running');
});

app.listen(PORT, () => {
  console.log(`Webhook server running on http://localhost:${PORT}`);
});
