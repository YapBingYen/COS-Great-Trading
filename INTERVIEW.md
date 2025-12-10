# COS Trading – Interview Prep: Workflows and Frontend

## Overview
- Goal: Build a simple AI sales assistant per the assessment brief. The user chats, n8n classifies intent as SALES or SUPPORT, and the frontend shows a booking CTA for SALES that triggers an email workflow.
- Components:
  - Backend: Two n8n workflows exposed via webhooks.
  - Frontend: Vanilla JS + HTML + Tailwind v4 (browser CDN) served via Vite.
  - Automation: Email booking confirmation with optional structured schedule data.

## Architecture
- User sends a chat message from the web app → Intent Detection API (n8n) → AI reply + intent + confidence → UI renders reply; if SALES, shows inline Book Meeting button.
- User clicks Book Meeting → Frontend posts to Booking Email Sender (n8n) with `customer`, `email`, `date`, `time`, `datetime_iso` → n8n validates inputs, sends email, and responds with JSON confirming the scheduled slot.

---

## Workflow 1: Intent Detection API
- Endpoint: `POST /webhook/intent`
- Purpose: Classify each user message as SALES or SUPPORT and return an AI reply with a numeric confidence.

### Nodes (with Justification)
- `Webhook`
  - Purpose: Entry point for the frontend to submit chat text.
  - Config:
    - Method: `POST`
    - Response Mode: `responseNode` (lets a later node finalize the HTTP response)
    - Input: `{ "message": "..." }` in `body.message`
  - Justification:
    - Keeps the endpoint simple and stateless.
    - Defers response shaping to a dedicated node for clarity and testability.
  - Simple summary: A mailbox where the app drops the user’s message.

- `Message a model` (Google Gemini, `models/gemini-2.0-flash`)
  - Purpose: Generate an AI reply and classify intent.
  - Config:
    - System prompt enforces strict JSON (`reply`, `intent`, `confidence`) and forbids fences/extra text.
    - User message bound to `={{ $('Webhook').item.json.body.message }}`
  - Justification:
    - LLM handles natural language reply; strict prompt reduces downstream parsing burden.
    - Decouples language generation from business rules.
  - Simple summary: A smart helper that answers and says if it’s about buying or support.

- `Code in JavaScript1`
  - Purpose: Normalize the model’s output into a strict schema.
  - Logic:
    - Extract text from multiple possible paths (`content.parts[0].text`, `parts[0].text`, `text`).
    - Remove code fences, parse the first JSON object, default values on failure.
    - Uppercase `intent`; coerce `confidence` to `Number`.
    - Output: `{ reply: string, intent: 'SALES'|'SUPPORT', confidence: number }`
  - Justification:
    - LLMs occasionally vary formatting; defensive parsing avoids runtime errors.
    - Guarantees the frontend receives predictable keys and types every time.
  - Simple summary: A neat-freak that cleans the helper’s answer so the app understands it.

- `Respond to Webhook`
  - Purpose: Return normalized JSON to the client.
  - Config:
    - Respond With: `JSON`
    - Body: `={{ { reply: $json.reply, intent: $json.intent, confidence: $json.confidence } }}`
  - Justification:
    - Expresses a single-item response that matches the assessment contract exactly.
  - Simple summary: Sends a tidy reply back to the app.

### Data Contract
- Input: `{ "message": "pricing for the team package" }`
- Output: `{ "reply": "...", "intent": "SALES", "confidence": 0.92 }`

### Error Handling
- Prompt enforces strict JSON; the Code node strips any accidental fences or prose before parsing.
- Confidence coerced to `0` if missing; intent defaults to `SUPPORT` if unrecognized.

### Justification
- Keeping the workflow linear (Webhook → Model → Parse → Respond) minimizes latency and complexity.
- Post-parse normalization guarantees the frontend receives predictable keys and types.

---

## Workflow 2: Booking Email Sender
- Endpoint: `POST /webhook/send-appointment`
- Purpose: Validate booking inputs, send confirmation email, and respond to the app with a structured schedule object.

### Expected Request Body
```
{
  "customer": "Customer A",
  "email": "user@example.com",
  "date": "YYYY-MM-DD",
  "time": "HH:mm",
  "datetime_iso": "YYYY-MM-DDTHH:mm:00.000Z"
}
```
- Note: The frontend sends `datetime_iso`. If missing, the workflow creates it from `date` and `time`.

### Nodes (with Justification)
- `Webhook`
  - Purpose: Receives booking details from the frontend.
  - Config: `POST`, `responseNode`.
  - Justification: Mirrors the intent webhook; keeps integration simple and stateless.
  - Simple summary: A mailbox where the app drops booking info.

- `NormalizeBooking` (Code)
  - Purpose: Validate and normalize booking inputs.
  - Behavior:
    - Reads from `$json.body ?? $json` (typical Webhook placement).
    - Creates `datetime_iso` from `date`+`time` if missing.
    - Computes `ok` as a real boolean for IF branching.
    - Produces `slot` and `slot_utc` for human-readable email content.
  - Justification:
    - Centralizes input sanitation to avoid scattered checks.
    - Guarantees IF receives a boolean (not a string) to prevent type errors.
  - Simple summary: Checks the booking info and makes a clean package.

- `If`
  - Purpose: Gate processing on valid inputs.
  - Config: Boolean condition `={{ $json.ok }}` → true/false branches.
  - Justification:
    - Makes failure explicit and short-circuits early; avoids sending emails with incomplete data.
  - Simple summary: A traffic light: green if info is good, red if not.

- `Send Email` (SMTP)
  - Purpose: Deliver a confirmation with a meeting link.
  - Config:
    - `fromEmail` via configured SMTP credentials.
    - `toEmail` bound to the original request: `={{ $('Webhook').item.json.body.email }}`.
    - Subject/body include `slot` and `slot_utc`.
  - Justification:
    - Demonstrates the automation outcome clearly; keeps copy simple and deterministic.
  - Simple summary: Sends a “Your meeting is booked” email.

- `PrepareResponse` (Set)
  - Purpose: Assemble a clean success payload for the client.
  - Config: Keep Only Set; fields `ok=true` and nested `scheduled.{date,time,datetime_iso}` sourced from `NormalizeBooking`.
  - Justification:
    - Isolates response shaping from email node scope; avoids fragile `$json` references.
  - Simple summary: Packs the success details neatly for the app.

- `Respond to Webhook` (success)
  - Purpose: Return success JSON to the frontend.
  - Config: Respond With `text`; Body `={{ JSON.stringify($json) }}`; Header `Content-Type=application/json`.
  - Justification:
    - Using a string response sidesteps strict validators while preserving JSON content in the client.
  - Simple summary: Hands the app a receipt of the booked time.

- `Respond to Webhook1` (error)
  - Purpose: Return structured validation errors.
  - Config: Respond With `JSON`; Code `400`; Body includes `ok:false` and message.
  - Justification:
    - Clear API contract for failure; easy to handle in the frontend.
  - Simple summary: Tells the app “we can’t book” and why.

### Branch Behavior
- True (valid): Sends email → prepares success payload → responds to client.
- False (invalid): Short-circuits with a 400 JSON error; no email is sent.

### Testing
- App test: Submit email/date/time; expect success JSON and chat confirmation.
- IF false test: omit `time` (or `date`) to force `ok:false`; expect 400 JSON from error Respond node.
- CLI success:
  - `curl -X POST "<BOOKING_URL>" -H "Content-Type: application/json" -d "{\"customer\":\"Customer A\",\"email\":\"user@example.com\",\"date\":\"2025-12-11\",\"time\":\"10:30\",\"datetime_iso\":\"2025-12-11T10:30:00.000Z\"}"`
- CLI error:
  - `curl -X POST "<BOOKING_URL>" -H "Content-Type: application/json" -d "{\"customer\":\"Customer A\",\"email\":\"user@example.com\",\"date\":\"2025-12-11\"}"`

### Justification
- Normalization and boolean gating reduce accidental string/boolean mismatches and make branching deterministic.
- Using a Set node to assemble the final response avoids referencing downstream node scopes and keeps Respond strictly valid.

---

## Frontend Application
- Tech:
  - HTML + Vanilla JavaScript.
  - Tailwind CSS v4 via `@tailwindcss/browser` script.
  - Dev server: Vite.
  - Fonts: Inter via Google Fonts.

### Files
- `index.html`
  - Navbar, sidebar, chat area, input bar.
  - Booking modal with inputs: `email`, `date`, `time` (15-minute step).
  - Tailwind theme variables for cream/beige/orange/dark.

- `app.js`
  - Config:
    - `webhookUrl`: `import.meta.env.VITE_N8N_INTENT_WEBHOOK` with fallback to production intent URL.
    - `bookingUrl`: `import.meta.env.VITE_N8N_BOOKING_WEBHOOK` with fallback to production booking URL.
  - Conversations/messages state; rendering functions for sidebar and chat bubbles.
  - Chat flow:
    - Add user message → POST to intent webhook.
    - Robust response parsing (handles arrays and stringified payloads) → render AI bubble.
    - SALES detection is case-insensitive and tolerant of either `sales_intent` boolean or `intent:'sales'` string.
  - "Hot Lead" logic:
    - `hotLead = isSales && (confidence >= 0.85 || contains strong purchase phrases)` where strong phrases include `pay now`, `buy`, `purchase`, `checkout`, `subscribe`, `sign up`, `order`, `payment`, `invoice`, `upgrade`.
    - Weak sales terms (`price`, `pricing`, `cost`, `quote`, `plan`, `rates`) do not trigger hot lead unless confidence is very high.
    - UI shows the Book Meeting button inline inside AI bubbles and only shows the "🔥 Hot Lead" badge when `hotLead` is true.
  - Booking flow:
    - Open modal → set `min` date to today.
    - On confirm: validates email/date/time and posts `{ customer, email, date, time, datetime_iso }` to booking webhook.
    - Success: modal closes, fields reset, and chat shows confirmation including selected slot.

### Environment
- `.env`
  - `VITE_N8N_INTENT_WEBHOOK=https://yapbingyen.app.n8n.cloud/webhook/intent`
  - `VITE_N8N_BOOKING_WEBHOOK=https://yapbingyen.app.n8n.cloud/webhook/send-appointment`
- Run:
  - `npm run dev` (Vite) → `http://localhost:5173/`

### Data Contracts
- Intent POST: `{ "message": "..." }` → `{ "reply": "...", "intent": "SALES|SUPPORT", "confidence": number }`.
- Booking POST: `{ "customer", "email", "date", "time", "datetime_iso" }` → `{ "ok": true, "scheduled": { ... } }` or `{ "ok": false, "error": "..." }`.

### Error Handling
- Intent API errors: falls back to mock responses with realistic confidence and intents.
- Booking errors: UI shows error state and re-enables the button; server returns `400` with structured JSON.
- CORS: Respond nodes add `Content-Type: application/json`; `Access-Control-Allow-Origin: *` can be added if browser policies complain.

---

## Alignment With Assessment Requirements
- Intent detection API returns strict JSON with `reply`, `intent`, `confidence` and classifies common examples correctly.
- Frontend shows the Book Meeting button only for SALES and visually highlights strong purchase intent.
- Booking automation sends a confirmation email and returns schedule JSON for client acknowledgment.
- Mobile-friendly chat layout and simple sidebar; direct browser→n8n calls (no custom backend).

---

## Testing Playbook
- App-level:
  - SUPPORT message ("best way to contact support?") → reply only.
  - SALES information ("pricing for team package") → Book Meeting, no Hot Lead.
  - Strong SALES ("I’d like to pay now") → Book Meeting + Hot Lead.
- API-level:
  - `curl` calls for intent and booking with and without required fields.
- n8n-level:
  - Executions tab to confirm webhook inputs, normalize outputs, IF routing, email send results, and Respond payloads.

---

## Design Rationale & Trade-offs
- Robust parsing in the Intent workflow avoids brittle coupling to LLM formatting.
- Boolean gating in booking ensures deterministic branching; string booleans are normalized at source.
- Using Set to stage the final payload isolates Respond from upstream node scopes.
- Returning JSON-string in the success Respond addresses strict validators while preserving client-friendly content type.
- Frontend avoids frameworks for simplicity and faster iteration; Tailwind v4 via CDN keeps CSS light.

---

## Future Enhancements
- Persist conversations to local storage.
- Stream typing indicators via websockets.
- Generate and attach `.ics` calendar invites formally (currently easy to add).
- Add rate limiting and retry logic for webhook calls.
