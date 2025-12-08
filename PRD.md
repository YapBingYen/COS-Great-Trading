# Product Requirements Document (PRD)
## Smart Sales Agent – AI-Powered Chat + Booking

### 1. Introduction
This document outlines the requirements for building a "Smart Sales Agent," a simplified AI-powered sales assistant. The system consists of a chat interface where users interact with an AI. The system detects user intent (Sales vs. Support) and triggers specific actions, such as enabling appointment bookings for sales leads.

### 2. Objective
The primary goal is to demonstrate an end-to-end flow integrating a frontend chat application with an n8n-based backend that leverages LLMs for intent detection and automation.

**Key Capabilities:**
- Use n8n to expose an API that calls an LLM.
- Connect a frontend chat UI to the API.
- Trigger an email booking workflow for sales-qualified leads.

**Success Metrics:**
- ≥90% accuracy on sample intent test set.
- Booking button only appears for SALES intents.
- Email workflow fires correctly each time.
- Full demo works 3 times consecutively without failures.

### 3. System Architecture

#### 3.1 Components
1.  **Frontend**: A dashboard-style chat interface (React or Vanilla JS).
2.  **Backend**: n8n workflows exposing Webhook APIs.
3.  **AI Engine**: LLM node within n8n for intent classification and response generation.
4.  **Automation**: Email service (Gmail/Outlook/SMTP) integration via n8n.

### 4. Functional Requirements

#### 4.1 Backend (n8n)

**4.1.1 Intent Detection API**
- **Endpoint**: `POST /webhook/intent`
- **Input Payload**: `{ "message": "user text here" }`
- **Logic**:
    - Analyze the message using an LLM node.
    - Classify intent as either `SALES` or `SUPPORT`.
    - Generate an appropriate text response.
- **Output Format**:
  ```json
  {
    "reply": "The AI response text...",
    "intent": "SALES", // or "SUPPORT"
    "confidence": 0.98
  }
  ```

**4.1.2 Booking API**
- **Endpoint**: `POST /webhook/send-appointment`
- **Input Payload**: `{}` or simple customer details.
- **Logic**:
    - Trigger an email node.
    - Send a confirmation email with a subject "Appointment Confirmed" and a body containing a mock meeting link.
- **Output**: Success status to the frontend.

#### 4.2 Frontend (Chat UI)

**4.2.1 Layout**
- **Sidebar**: List of mock users (e.g., "Customer A", "Customer B"). Clicking switches the active conversation.
- **Chat Area**:
    - Message bubbles (User right, AI left).
    - Scrollable history.
    - Input box and Send button.

**4.2.2 Interaction Logic**
1.  **Sending Messages**:
    - User types and sends a message.
    - UI displays the user message immediately.
    - Application POSTs the message to the **Intent Detection API**.
    - UI displays the returned `reply` from the AI.

2.  **Intent Handling**:
    - If `intent` is `SALES`: Display a **"Book Appointment"** button in the chat interface.
    - If `intent` is `SUPPORT`: Do not show the button.
    - **Hot Lead Visuals**: Optionally highlight messages indicating high purchase intent (e.g., "I'd like to pay now").

3.  **Booking Action**:
    - User clicks **"Book Appointment"**.
    - Application POSTs to the **Booking API**.
    - Upon success, UI displays a system message: *"Booking Confirmed – A confirmation email has been sent."*

#### 4.3 Mobile Responsiveness
- On small screens:
    - Sidebar should be collapsible or displayed as a top menu.
    - Chat interface must remain usable and readable.

### 5. Scenarios & Expected Behavior

| User Input | Expected Intent | System Behavior |
| :--- | :--- | :--- |
| "What is the best way to contact support?" | **SUPPORT** | Show AI reply only. No booking button. |
| "What is the pricing for the team package?" | **SALES** | Show AI reply + **Book Appointment** button. |
| "I'd like to pay now." | **SALES** | Show AI reply + **Book Appointment** button + Hot Lead highlight. |

### 6. Technical Constraints & Risks

**Constraints:**
- **Frontend**: React or Plain JavaScript (HTML/CSS).
- **Backend**: n8n (Cloud or Self-hosted).
- **No Database Required**: Frontend can rely on local state/mock data for the session.

**Risks & Mitigations:**
- **LLM Misclassification**: Implement confidence thresholding in the backend if possible, or refine prompt instructions.
- **API Limits**: Ensure n8n workflow handles timeouts gracefully.
- **Data Persistence**: Since no database is required, refreshing the page will reset the chat. This is acceptable for the POC.

### 7. Future Enhancements
- Real calendar scheduling integration (e.g., Calendly).
- CRM integration (e.g., HubSpot, Salesforce).
- Rich UI themes and customization.
- Multi-intent support.
- Conversation history storage.
