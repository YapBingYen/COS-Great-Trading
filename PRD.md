# Product Requirements Document (PRD)
## COS Trading – AI-Powered Sales Assistant

### 1. Introduction
This document outlines the requirements for building "COS Trading," an AI-powered sales assistant dashboard. The system features a modern chat interface where users interact with an AI. The system detects user intent (Sales vs. Support) via n8n workflows and enables a seamless email-based appointment booking process for sales-qualified leads.

### 2. Objective
To build a high-fidelity, vanilla JavaScript frontend integrated with an n8n backend that automates sales qualification and booking.

**Key Capabilities:**
- **Real-time Chat**: Connects to n8n Webhooks for AI responses.
- **Intent Detection**: Analyzes messages to identify "Sales" intent.
- **Dynamic UI**: Shows a "Book Meeting" button only when sales intent is detected.
- **Email Booking**: Captures user email via a modal and triggers an n8n email workflow.

### 3. System Architecture

#### 3.1 Components
1.  **Frontend**: 
    - **Tech Stack**: Vanilla JavaScript (ES6+), HTML5, Tailwind CSS v4 (CDN).
    - **Theme**: "Gradient Labs" inspired (Cream/Beige/Orange/Dark).
    - **Hosting**: Vite (Development).
2.  **Backend**: 
    - **Platform**: n8n Cloud.
    - **Workflows**:
        - `POST /webhook/intent`: Chat & Intent Analysis.
        - `POST /webhook/send-appointment`: Email Automation.
3.  **AI Engine**: OpenAI (via n8n) for intent classification and natural language responses.

### 4. Functional Requirements

#### 4.1 Backend (n8n)

**4.1.1 Intent Detection API**
- **Endpoint**: `POST /webhook/intent`
- **Input Payload**: `{ "message": "user text here" }`
- **Logic**:
    - LLM analyzes message for context.
    - Returns JSON with `reply` (text) and `sales_intent` (boolean/string).
- **Output Format**:
  ```json
  {
    "reply": "Our team plan starts at $49/mo...",
    "sales_intent": true
  }
  ```

**4.1.2 Booking API**
- **Endpoint**: `POST /webhook/send-appointment`
- **Input Payload**: 
  ```json
  {
    "customer": "Customer A",
    "email": "user@example.com"
  }
  ```
- **Logic**:
    - Receives email address from frontend.
    - Sends a confirmation email to the provided address via Gmail/SMTP node.
- **Output**: Success status 200 OK.

#### 4.2 Frontend (UI/UX)

**4.2.1 Design System**
- **Theme**: COS Trading (Gradient Labs clone).
- **Colors**: Cream (`#FDFBF7`), Beige (`#F5F2EB`), Orange (`#FF6B2C`), Dark (`#1A1A1A`).
- **Typography**: Inter font family.

**4.2.2 Layout & Features**
- **Navbar**: Minimalist branding ("COS Trading" with logo). No extra links.
- **Sidebar**: List of mock customers (Customer A, B, C) with active states.
- **Chat Area**:
    - Polished message bubbles (User: Dark, AI: White).
    - Typing indicators (animated dots).
    - Auto-scroll to bottom.
- **Booking Modal**:
    - Triggered by "Book Meeting" button.
    - Captures User Email.
    - Handles loading states ("Sending...") and success feedback ("✓ Confirmed").

**4.2.3 Interaction Logic**
1.  **Chat Flow**:
    - User sends message -> API Call to n8n.
    - If API fails (e.g., 429 Error), falls back to **Mock Mode** automatically.
    - Displays AI response.
2.  **Sales Trigger**:
    - If `sales_intent: true` is returned (or mocked), the **"Book Meeting"** button appears in the chat header.
3.  **Booking Flow**:
    - User clicks "Book Meeting" -> Modal opens.
    - User enters email -> Clicks Confirm.
    - App calls `/webhook/send-appointment`.
    - Modal closes -> Success message added to chat.

### 5. Technical Implementation Details

**5.1 File Structure**
```
/
├── index.html      # Main entry (DOM structure, Modal, Tailwind CDN)
├── style.css       # Custom animations (fade-in, typing) & overrides
├── app.js          # Logic (State, API calls, Event Listeners)
├── .env            # Webhook URLs (VITE_N8N_*)
└── package.json    # Dev dependencies (Vite)
```

**5.2 Environment Variables**
- `VITE_N8N_INTENT_WEBHOOK`: Production URL for chat.
- `VITE_N8N_BOOKING_WEBHOOK`: Production URL for email.

**5.3 Mock Mode**
- Built-in failover in `app.js` to handle API quotas or downtime.
- Simulates network delay and returns hardcoded responses for testing.

### 6. Future Enhancements
- [ ] Persist chat history to local storage.
- [ ] Add real-time websocket connection for faster typing streaming.
- [ ] Integrate Calendar API for actual slot selection.
