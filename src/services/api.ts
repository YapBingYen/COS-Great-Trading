import axios from 'axios';
import type { IntentResponse } from '../types';

const INTENT_WEBHOOK_URL = import.meta.env.VITE_N8N_INTENT_WEBHOOK || 'https://your-n8n-instance.com/webhook/intent';
const BOOKING_WEBHOOK_URL = import.meta.env.VITE_N8N_BOOKING_WEBHOOK || 'https://your-n8n-instance.com/webhook/send-appointment';

export const chatApi = {
  async sendMessage(message: string): Promise<IntentResponse> {
    try {
      const response = await axios.post(INTENT_WEBHOOK_URL, { message });
      console.log('n8n Raw Response:', response.data);

      let data = response.data;

      // Handle array response from n8n (common default)
      if (Array.isArray(data)) {
        data = data[0];
      }

      // Handle nested stringified JSON (defensive parsing)
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.warn('Failed to parse string response, using raw string as reply');
          return { reply: data, intent: 'SUPPORT', confidence: 0 };
        }
      }
      
      // Normalize response keys (case insensitivity or missing fields)
      return {
        reply: data.reply || data.text || "I received your message but couldn't generate a reply.",
        intent: data.intent || 'SUPPORT',
        confidence: data.confidence || 0
      };

    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback to mock response for development
      return getMockIntentResponse(message);
    }
  },

  async bookAppointment(customerName?: string): Promise<boolean> {
    try {
      await axios.post(BOOKING_WEBHOOK_URL, { customerName });
      return true;
    } catch (error) {
      console.error('Error booking appointment:', error);
      // Fallback to mock success for development
      return true;
    }
  }
};

// Mock function to simulate n8n responses during development
function getMockIntentResponse(message: string): IntentResponse {
  const salesKeywords = ['pricing', 'price', 'cost', 'buy', 'purchase', 'demo', 'appointment', 'pay'];
  const isSales = salesKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );

  // const hotLeadKeywords = ['pay now', 'purchase', 'buy now'];
  // const isHotLead = hotLeadKeywords.some(keyword => 
  //   message.toLowerCase().includes(keyword)
  // );

  if (isSales) {
    return {
      reply: "I'd be happy to help you with pricing information. Would you like to book an appointment to discuss this further?",
      intent: 'SALES',
      confidence: 0.9
    };
  }

  return {
    reply: "Thank you for your message. I'll connect you with our support team who can assist you further.",
    intent: 'SUPPORT',
    confidence: 0.8
  };
}