# n8n Workflow Configuration

## Intent Detection Workflow

This workflow handles the AI intent classification for incoming messages.

### Workflow Steps:
1. **Webhook Trigger**: POST to `/webhook/intent`
2. **LLM Node**: Analyzes message and classifies intent
3. **Response**: Returns JSON with reply, intent, and confidence

### Sample Workflow JSON:
```json
{
  "name": "Intent Detection API",
  "nodes": [
    {
      "parameters": {
        "path": "intent",
        "httpMethod": "POST"
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "model": "gpt-3.5-turbo",
        "messages": {
          "systemMessage": "You are a sales assistant. Classify the user's message as either 'SALES' or 'SUPPORT' intent. Respond with a JSON object containing: {'reply': 'your response', 'intent': 'SALES|SUPPORT', 'confidence': 0.0-1.0}",
          "userMessage": "={{ $('Webhook').item.json.message }}"
        }
      },
      "type": "n8n-nodes-base.openAi",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "options": {},
        "responseMode": "responseNode",
        "responseData": "allEntries"
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [650, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "OpenAI",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Booking Email Workflow

This workflow sends appointment confirmation emails.

### Workflow Steps:
1. **Webhook Trigger**: POST to `/webhook/send-appointment`
2. **Email Node**: Sends confirmation email with mock meeting link
3. **Response**: Returns success status

### Sample Workflow JSON:
```json
{
  "name": "Booking Email Sender",
  "nodes": [
    {
      "parameters": {
        "path": "send-appointment",
        "httpMethod": "POST"
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "fromEmail": "sales@yourcompany.com",
        "toEmail": "customer@example.com",
        "subject": "Appointment Confirmed",
        "text": "Your appointment has been confirmed! Here's your meeting link: https://meet.google.com/mock-link-12345",
        "options": {}
      },
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "options": {},
        "responseMode": "responseNode",
        "responseData": "allEntries",
        "responseBody": "{\"success\": true, \"message\": \"Appointment booked successfully\"}"
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [650, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Email",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Email": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Setup Instructions:

1. **n8n Cloud Setup**:
   - Sign up for free trial at https://n8n.io/
   - Create new workflows using the JSON above
   - Configure your LLM API key (OpenAI or other)
   - Set up email credentials (Gmail, Outlook, or SMTP)

2. **Update Frontend API URLs**:
   - Replace `INTENT_WEBHOOK_URL` in `src/services/api.ts`
   - Replace `BOOKING_WEBHOOK_URL` in `src/services/api.ts`

3. **Test the Integration**:
   - Send test messages to verify intent classification
   - Test booking flow by clicking the appointment button
   - Check email delivery for booking confirmations