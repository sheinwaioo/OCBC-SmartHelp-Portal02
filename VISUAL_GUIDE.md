# OCBC SmartHelp Portal - Visual Feature Guide

## 🎯 User Journeys

### Journey 1: New User Registration & First Chat

```
┌─────────────────────────────────────────────────────────┐
│  1. User lands on homepage                              │
│     └─> Sees "Welcome to OCBC SmartHelp"                │
│     └─> Chat visible at bottom                          │
└─────────────────────────────────────────────────────────┘
                          │
                          v
┌─────────────────────────────────────────────────────────┐
│  2. User clicks "Login"                                 │
│     └─> Auth modal opens                                │
│     └─> Shows "Create Account" option                   │
└─────────────────────────────────────────────────────────┘
                          │
                          v
┌─────────────────────────────────────────────────────────┐
│  3. User registers                                      │
│     ├─ Enters: Name, Email, Password                    │
│     ├─ Clicks: "Create Account"                         │
│     └─> Auto-generated:                                 │
│        ├─ Account Number (OCBC######)                   │
│        ├─ Balance (S$50,000)                            │
│        └─ JWT Token                                     │
└─────────────────────────────────────────────────────────┘
                          │
                          v
┌─────────────────────────────────────────────────────────┐
│  4. Dashboard updates                                   │
│     ├─ Navbar shows: User Avatar + "PREMIER"           │
│     ├─ Dashboard shows: Balance, Account #, History    │
│     └─ Welcome: "Welcome back, [Name]"                 │
└─────────────────────────────────────────────────────────┘
                          │
                          v
┌─────────────────────────────────────────────────────────┐
│  5. User tries the chat                                 │
│     ├─ Types: "I want to reset my PIN"                 │
│     ├─ Chatbot:                                         │
│     │   ├─ Sends to Gemini AI                          │
│     │   ├─ Detects: "Account & Banking" → "Reset PIN" │
│     │   └─ High confidence (>0.7)                      │
│     └─> Skips category selection!                      │
└─────────────────────────────────────────────────────────┘
                          │
                          v
┌─────────────────────────────────────────────────────────┐
│  6. Chatbot suggests assistance                         │
│     ├─ Displays 3 buttons:                              │
│     │   ├─ "View Tutorial"                             │
│     │   ├─ "Physical Consultation"                     │
│     │   └─ "Online Agent Support"                      │
│     └─> User selects: "Physical Consultation"          │
└─────────────────────────────────────────────────────────┘
                          │
                          v
┌─────────────────────────────────────────────────────────┐
│  7. Branch selection modal opens                        │
│     ├─ Shows 4 branches:                                │
│     │   ├─ Main Branch - CBD (0.2km)                   │
│     │   ├─ Tampines Branch (4.5km)                     │
│     │   ├─ Orchard Branch (2.1km)                      │
│     │   └─ Jurong East Branch (12.3km)                 │
│     └─> User selects: "Main Branch - CBD"              │
└─────────────────────────────────────────────────────────┘
                          │
                          v
┌─────────────────────────────────────────────────────────┐
│  8. QR Code generated & displayed                       │
│     ├─ Modal shows:                                     │
│     │   ├─ Unique consultation ID                      │
│     │   ├─ QR code (encoded with data)                 │
│     │   └─ Instructions                                │
│     ├─ Button: "Download QR Code"                      │
│     └─> User saves QR for branch visit                 │
└─────────────────────────────────────────────────────────┘
```

### Journey 2: Queue Management

```
┌─────────────────────────────────────────────────────────┐
│  1. User types: "I want to talk to an agent"           │
│     └─> Chatbot offers:                                 │
│        ├─ "Join Queue Now"                             │
│        └─ "Schedule Callback"                          │
└─────────────────────────────────────────────────────────┘
                          │
                          v
┌─────────────────────────────────────────────────────────┐
│  2. User selects: "Join Queue Now"                     │
│     └─> Backend:                                        │
│        ├─ Checks if already in queue                   │
│        ├─ Counts current queue entries                 │
│        ├─ Calculates position & wait time              │
│        │  └─ Formula: Position × 8 min (avg handling)  │
│        └─ Inserts queue entry                          │
└─────────────────────────────────────────────────────────┘
                          │
                          v
┌─────────────────────────────────────────────────────────┐
│  3. Queue status displayed                              │
│     ├─ Position: #5                                     │
│     ├─ Estimated wait: 40 minutes                       │
│     └─ Buttons:                                         │
│        ├─ "Check Queue Status"                         │
│        ├─ "Leave Queue & Schedule Callback"            │
│        └─ "Cancel"                                     │
└─────────────────────────────────────────────────────────┘
                          │
           ┌─────────────┴─────────────┐
           v                           v
        Waits              Leaves Queue
           │                           │
           v                           v
    ┌─────────────┐         ┌──────────────────┐
    │ Monitor     │         │ Callback Modal   │
    │ queue       │         │ Opens            │
    │ position    │         ├─ Shows time      │
    │             │         │   slots:         │
    │ Position    │         │   ├─ Today 2PM   │
    │ updates in  │         │   ├─ Today 3PM   │
    │ real-time   │         │   └─ Tomorrow... │
    │             │         ├─ User selects   │
    │ Agent picks │         │   time slot     │
    │ up →        │         ├─ Confirmation   │
    │ Call placed │         │   code shown    │
    │             │         └─ Callback       │
    │ Chat shows: │            scheduled ✓    │
    │ "Connected  │                           │
    │  to agent"  │                           │
    └─────────────┘         └──────────────────┘
```

### Journey 3: Self-Service Tutorial

```
┌─────────────────────────────────────────────────────────┐
│  User asks: "How do I reset my PIN?"                    │
│  Chatbot: "Great! Here are the steps:"                  │
└─────────────────────────────────────────────────────────┘
                          │
                          v
┌─────────────────────────────────────────────────────────┐
│  Tutorial steps displayed:                              │
│                                                          │
│  Step 1: Access Settings                                │
│  Open your OCBC mobile app and navigate to Settings    │
│                                                          │
│  Step 2: Select Your Option                             │
│  Find the relevant section based on your inquiry       │
│                                                          │
│  Step 3: Complete Your Request                          │
│  Follow the on-screen prompts to complete your request │
│                                                          │
│  Step 4: Need More Help?                                │
│  Contact our support team for additional assistance    │
│                                                          │
│  Buttons: [Next Step] [Speak with Agent] [Go Back]     │
└─────────────────────────────────────────────────────────┘
                          │
           ┌──────────────┴──────────────┐
           v                             v
      Issue resolved              Issue NOT resolved
           │                             │
           v                             v
    ┌────────────────┐         ┌──────────────────┐
    │ Chatbot asks:  │         │ Offer escalation │
    │ "Is your      │         │ options:         │
    │ issue         │         │ ├─ Queue         │
    │ resolved?"    │         │ ├─ Callback      │
    │               │         │ ├─ Consultation  │
    │ [Yes] [No]    │         │ └─ Feedback      │
    └────────────────┘         └──────────────────┘
           │
           v
    ┌────────────────┐
    │ Thank you msg  │
    │ Feedback shown │
    └────────────────┘
```

## 📊 UI Component Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         NAVBAR                                   │
│  [O] Nav Links    |    Market Ticker    |  [Login] or [Avatar]  │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────v──────────────┐
                │   MAIN CONTENT AREA        │
                │                            │
                ├─ Welcome Card              │
                │  "Welcome back, John"      │
                │  Portfolio +2.4%           │
                │                            │
                ├─ Summary Cards (3-column) │
                │  ├─ Balance: S$50,000     │
                │  ├─ Account: OCBC######   │
                │  └─ History: 0 enquiries  │
                │                            │
                ├─ AI Support Section       │
                │  │                         │
                │  └─ Chat Frame             │
                │     ├─ Messages area       │
                │     │  ├─ Bot message      │
                │     │  ├─ Quick replies    │
                │     │  └─ User message     │
                │     │                      │
                │     └─ Input bar           │
                │        ├─ Text input       │
                │        └─ Send button      │
                │                            │
                └────────────────────────────┘

MODALS (Appear on top):
├─ auth-modal
│  ├─ login-form
│  └─ register-form
├─ actions-modal
├─ branch-modal
├─ callback-modal
├─ qr-modal
└─ queue-modal

FOOTER (Fixed at bottom)
└─ Links & company info
```

## 🎨 Color Scheme

- **Primary Red**: #ef2b2d (OCBC brand)
- **Dark Text**: #0f172a (High contrast)
- **Light Background**: #f8fafc (Neutral)
- **Border Gray**: #e2e8f0 (Subtle)
- **Accent Colors**:
  - Success: #16a34a (Green)
  - Error: #dc2626 (Red)
  - Info: #3b82f6 (Blue)

## 🔄 Chat Message Types

```
AI Message (Left)
┌──────────────────────────┐
│ How can I help you today?│  [Blue background]
└──────────────────────────┘

User Message (Right)
                    ┌──────────────────────────┐
                    │ I want to reset my PIN  │  [Red background]
                    └──────────────────────────┘

Quick Reply Buttons
[Report Lost Card] [Manage Card Limit] [Lock Card]

Option Buttons
┌─ View Tutorial        ─┐
├─ Physical Consultation ┤
└─ Online Agent Support ─┘
```

## 🔐 Authentication States

### Anonymous User
```
Dashboard
├─ Welcome: "Welcome back, User."
├─ Balance: "S$0.00"
├─ Account: "OCBC****"
├─ History: "0"
└─ Chat: Available but prompts login for protected features

Navbar
├─ "Login" button (visible)
├─ Avatar (hidden)
└─ Tier (hidden)
```

### Authenticated User
```
Dashboard
├─ Welcome: "Welcome back, John."
├─ Balance: "S$50,000.00"
├─ Account: "OCBC001234567890"
├─ History: "5 enquiries"
└─ Chat: Full access to all features

Navbar
├─ "Login" button (hidden)
├─ Avatar: "JD" (visible)
└─ Tier: "PREMIER" (visible)
```

## 📱 Responsive Breakpoints

```
Desktop (>768px)
├─ 3-column layout for cards
├─ Side-by-side components
└─ Full modals

Mobile (<768px)
├─ Stacked layout
├─ Full-width modals
├─ Touch-friendly buttons (48px min)
└─ Optimized chat height

Tablet (768px-1024px)
├─ 2-column layout
└─ Adjusted spacing
```

## ⏱️ User Flow Timings

```
Page Load        → 0s     (html + css loaded)
Chat Initialize  → 0.5s   (greeting shown)
User Typing      → Instant
Send Message     → Network latency + 200ms (server + Gemini)
Display Response → 50ms   (render)

Queue Join       → 100ms  (DB insert)
Callback Book    → 150ms  (DB insert + calc slots)
QR Generate      → 200ms  (unique ID + formatting)
```

## 📧 Email/SMS Notifications (Future)

```
Appointment Confirmation (Callback)
─────────────────────────────────
Subject: OCBC Callback Scheduled - CODE: CB12345

Your callback is scheduled for:
📅 Tomorrow at 2:00 PM
📞 +65 9123 4567
🔑 Confirmation Code: CB12345

Queue Position Update
─────────────────────────────────
You are now at position #3 in queue.
Estimated wait: 24 minutes
```

## 🎯 Success Metrics to Track

```
User Engagement
├─ Chat messages per session
├─ Average session duration
├─ Repeat visitor rate
└─ Feature adoption rate

Support Effectiveness
├─ Self-service resolution rate
├─ Average time to resolution
├─ Customer satisfaction (feedback rating)
└─ Queue abandonment rate

Technical Metrics
├─ Page load time
├─ API response time
├─ Uptime percentage
└─ Error rate
```

---

This visual guide helps users and stakeholders understand the OCBC SmartHelp Portal experience at a glance!
