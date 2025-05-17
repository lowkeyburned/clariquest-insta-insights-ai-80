

# AI Insights Webhook Server

This is a simple Express.js server that handles the webhook requests from the AI Insights chat feature.

## Setup and Running

1. Install dependencies:
```
npm install
```

2. Start the server:
```
npm start
```

The server will run on http://localhost:5678

## Endpoints

- `POST /webhook/:webhookId` - Main webhook endpoint that receives messages from the chat interface
- `POST /webhook/:webhookId/chat` - Chat-specific webhook endpoint
- `POST /webhook-test/:webhookId` - Test webhook endpoint for Instagram campaigns
- `GET /` - Simple healthcheck endpoint

## Environment

Make sure the frontend is configured to send requests to this server at the correct URL:
- For AI Insights: `http://localhost:5678/webhook-test/ab4a8a3c-0b5a-4728-9983-25caff5d1b9c`
- For Instagram Campaigns: `http://localhost:5678/webhook-test/92f8949a-84e1-4179-990f-83ab97c84700`

