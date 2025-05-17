
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
- `GET /` - Simple healthcheck endpoint

## Environment

Make sure the frontend is configured to send requests to this server at the correct URL: `http://localhost:5678/webhook/ab4a8a3c-0b5a-4728-9983-25caff5d1b9c`
