# QR Code Feature - Visual User Guide

## Step-by-Step Visual Walkthrough

### 📱 Step 1: Chatbot Interaction

```
┌─────────────────────────────────────────────────────────┐
│                    OCBC Dashboard                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Chat Messages                                   │  │
│  ├──────────────────────────────────────────────────┤  │
│  │                                                  │  │
│  │  Bot: Hello! 👋 Welcome to OCBC SmartHelp.    │  │
│  │  I'm here to assist you with your banking     │  │
│  │  inquiries. What can I help you with today?   │  │
│  │                                                  │  │
│  │  [Card Services] [Account & Banking]          │  │
│  │  [Check Enquiry History] [View Consultations] │  │
│  │                                                  │  │
│  │  You: I need a physical consultation           │  │
│  │                                                  │  │
│  │  Bot: Great! Let's schedule your              │  │
│  │  consultation at an OCBC branch.              │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Select Your Preferred Branch:                   │  │
│  │                                                  │  │
│  │  [Main Branch - CBD (0.2km)]                   │  │
│  │  [Tampines Branch (4.5km)]                     │  │
│  │  [Orchard Branch (2.1km)]                      │  │
│  │  [Jurong East Branch (12.3km)]                 │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────┐              │
│  │ User Input: [Type message...]  [Send] │              │
│  └─────────────────────────────────────┘              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### ✅ Step 2: User Selects Branch

```
┌─────────────────────────────────────────────────────────┐
│                    OCBC Dashboard                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Chat Messages                                   │  │
│  ├──────────────────────────────────────────────────┤  │
│  │                                                  │  │
│  │  [Previous messages...]                         │  │
│  │                                                  │  │
│  │  You: Main Branch - CBD                         │  │
│  │                                                  │  │
│  │  Bot: Generating your consultation QR code     │  │
│  │  for Main Branch - CBD...                      │  │
│  │                                                  │  │
│  │  ⏳ [Loading indicator]                         │  │
│  │                                                  │  │
│  │  (Backend processing:                           │  │
│  │   - Generating ENQ-8921-X ID                   │  │
│  │   - Creating PNG QR code                       │  │
│  │   - Storing in database)                        │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 🎉 Step 3: QR Code Generated - Confirmation

```
┌─────────────────────────────────────────────────────────┐
│                    OCBC Dashboard                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Chat Messages                                   │  │
│  ├──────────────────────────────────────────────────┤  │
│  │                                                  │  │
│  │  Bot: ✅ Your consultation has been scheduled! │  │
│  │                                                  │  │
│  │  Consultation ID: ENQ-8921-X                    │  │
│  │                                                  │  │
│  │  Your priority queue ticket is ready. You can   │  │
│  │  download it or view it anytime.                │  │
│  │                                                  │  │
│  │  [View QR Code] [Schedule Another]  [Go Back]   │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  🎯 User can now:                                       │
│     1. Click "View QR Code" to see ticket              │
│     2. Download the ticket                             │
│     3. Show/scan at branch                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 📲 Step 4: User Clicks "View QR Code"

```
┌─────────────────────────────────────────────────────────┐
│                    OCBC Dashboard                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Your Consultation QR Code              [X]     │  │
│  ├──────────────────────────────────────────────────┤  │
│  │                                                  │  │
│  │  ███████████████████████████████████████████    │  │
│  │  ███████████████████████████████████████████    │  │
│  │  ███  ███████████████████████████  ████████    │  │
│  │  ███  █░░░░░░░░░░░░░░░░░░░░░░░█  ████████    │  │
│  │  ███  █░░    QR    CODE    IMG░█  ████████    │  │
│  │  ███  █░░    (Scannable)    ░█  ████████    │  │
│  │  ███  █░░░░░░░░░░░░░░░░░░░░░░░█  ████████    │  │
│  │  ███  ███████████████████████████  ████████    │  │
│  │  ███████████████████████████████████████████    │  │
│  │  ███████████████████████████████████████████    │  │
│  │                                                  │  │
│  │           ENQ-8921-X                            │  │
│  │           (Unique ID)                           │  │
│  │                                                  │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  # Priority Queue Ticket                         │  │
│  │                                                  │  │
│  │  ⏱ Valid for 7 working days                     │  │
│  │                                                  │  │
│  │  This code contains your verified identity      │  │
│  │  and enquiry details. Scan it at any branch     │  │
│  │  kiosk nationwide to get a priority queue       │  │
│  │  number instantly.                              │  │
│  │                                                  │  │
│  │  Selected Branch:                               │  │
│  │  Main Branch - CBD                              │  │
│  │                                                  │  │
│  │  Instructions:                                  │  │
│  │  • Scan or show this QR code at your OCBC      │  │
│  │    branch                                       │  │
│  │  • Expected wait time: 5-10 minutes from        │  │
│  │    check-in                                     │  │
│  │  • Bring a valid ID for verification            │  │
│  │  • Code valid for 7 working days                │  │
│  │                                                  │  │
│  │              [DOWNLOAD QR CODE]                 │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 💾 Step 5: User Downloads Ticket

```
File Downloads:

OCBC-Priority-Ticket-ENQ-8921-X.png
├─ File Type: PNG Image
├─ File Size: ~8 KB
├─ Content: QR code + metadata
├─ Resolution: 300x300 pixels
├─ Can be: Printed, emailed, scanned, shared
└─ Valid: For 7 working days

Browser Download Notification:
┌────────────────────────────────────┐
│ ✅ Download Complete               │
│                                    │
│ OCBC-Priority-Ticket-ENQ-8921...   │
│ From: https://ocbc-smarthelp...   │
│                                    │
│ 8.2 KB • PNG Image                 │
│                                    │
│ [Show in folder] [Open]            │
│                                    │
└────────────────────────────────────┘
```

### 🏢 Step 6: At OCBC Branch - Using the Ticket

```
User arrives at branch with QR code ticket:

Option 1: Show Phone/Printout to Kiosk
┌─────────────────────────────────┐
│  OCBC Branch Kiosk              │
├─────────────────────────────────┤
│  "Scan your QR code ticket"     │
│                                 │
│  📲 [User holds phone/print]    │
│                                 │
│  ✅ Ticket Recognized!          │
│  ID: ENQ-8921-X                 │
│  Customer: John Doe             │
│  Branch: Main Branch - CBD      │
│                                 │
│  [Get Queue Number]             │
│                                 │
└─────────────────────────────────┘

Option 2: Use Phone QR Scanner
┌─────────────────────────────────┐
│  📲 Smartphone Camera            │
│                                 │
│  [Points at kiosk QR reader]    │
│                                 │
│  ✅ Code Scanned!               │
│  ✅ Queue Number Assigned       │
│  ✅ Wait Time: 8 minutes        │
│                                 │
│  Branch staff confirmed         │
│  customer identity              │
│                                 │
└─────────────────────────────────┘

Result:
✅ Customer gets priority queue number
✅ Expected wait time: 5-10 minutes
✅ No need to wait in regular queue
✅ Staff has all customer details
```

## 🎨 Actual Ticket Design (Dark Theme)

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║                                                        ║
║   ┌──────────────────────────────────────────────┐   ║
║   │                                              │   ║
║   │         [QR CODE IMAGE - 280x280px]         │   ║
║   │         ███████████████████████████         │   ║
║   │         ███████████████████████████         │   ║
║   │         ███  [QR ENCODED DATA]  ███         │   ║
║   │         ███████████████████████████         │   ║
║   │         ███████████████████████████         │   ║
║   │                                              │   ║
║   │              ENQ-8921-X                      │   ║
║   │         (Consultation ID - Red Color)       │   ║
║   │                                              │   ║
║   └──────────────────────────────────────────────┘   ║
║                                                        ║
║              # Priority Queue Ticket                   ║
║                                                        ║
║         ⏱ Valid for 7 working days                     ║
║                                                        ║
║   This code contains your verified identity and       ║
║   enquiry details. Scan it at any branch kiosk       ║
║   nationwide to get a priority queue number           ║
║   instantly.                                          ║
║                                                        ║
║   ┌──────────────────────────────────────────────┐   ║
║   │                                              │   ║
║   │ Selected Branch:                             │   ║
║   │ Main Branch - CBD                            │   ║
║   │                                              │   ║
║   │ Instructions:                                │   ║
║   │ • Scan or show at OCBC branch               │   ║
║   │ • Expected wait: 5-10 min from check-in    │   ║
║   │ • Bring valid ID for verification           │   ║
║   │ • Code valid for 7 working days             │   ║
║   │                                              │   ║
║   └──────────────────────────────────────────────┘   ║
║                                                        ║
║              [DOWNLOAD QR CODE BUTTON]                ║
║                (Red Button - Clickable)               ║
║                                                        ║
║  Dark Navy Background (#0f172a → #1e293b gradient)   ║
║  White Content Areas                                  ║
║  OCBC Red Accents (#ef2b2d)                          ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

## 📊 Color Palette Used

```
Primary Colors:
├─ OCBC Red: #ef2b2d (logos, buttons, accents)
├─ Dark Navy: #0f172a (background base)
├─ Navy Gradient: #0f172a → #1e293b (ticket background)
├─ White: #ffffff (QR container, text)
└─ Light Gray: #cbd5e1 (secondary text)

Secondary Colors:
├─ Red Badge: #ff6b6b (validity indicator)
├─ Light Background: #f8fafc (instruction section)
├─ Border Gray: #e2e8f0 (containers)
└─ Text Gray: #475569 (descriptions)
```

## 🎯 Mobile View

```
┌─────────────────────┐
│ Your Consultation   │
│ QR Code        [X]  │
├─────────────────────┤
│                     │
│ ┌─────────────────┐ │
│ │                 │ │
│ │    [QR CODE]    │ │
│ │   (responsive)  │ │
│ │                 │ │
│ │  ENQ-8921-X     │ │
│ │                 │ │
│ └─────────────────┘ │
│                     │
│ Priority Queue      │
│ Ticket             │
│                     │
│ ✓ Valid 7 days     │
│                     │
│ [description...]    │
│                     │
│ Branch:            │
│ Main Branch - CBD  │
│                     │
│ Instructions:      │
│ • Scan at branch   │
│ • 5-10 min wait    │
│ • Bring ID         │
│ • 7 day validity   │
│                     │
│ [DOWNLOAD BUTTON]  │
│                     │
└─────────────────────┘
```

## ✨ User Experience Highlights

### Visual Feedback
- ✅ Clear confirmation message
- ✅ Professional ticket design
- ✅ Easy-to-scan QR code
- ✅ Readable consultation ID
- ✅ Mobile-responsive layout

### Accessibility
- ✅ High contrast colors
- ✅ Clear typography
- ✅ Readable font sizes
- ✅ Touch-friendly buttons
- ✅ Proper color contrast ratios

### Functionality
- ✅ Instant QR generation
- ✅ One-click download
- ✅ No additional steps
- ✅ Works offline after download
- ✅ Compatible with all QR scanners

## 🎓 What Happens Behind the Scenes

```
User Action: Click "View QR Code"
                     │
                     ▼
Frontend checks lastQRData exists
                     │
                     ▼
showQRCodeModal() called
                     │
                     ├─ Generate HTML for ticket
                     ├─ Insert QR image from data URL
                     ├─ Display consultation ID
                     ├─ Show validity badge
                     ├─ List instructions
                     │
                     ▼
Modal appears on screen
                     │
                     ├─ User can view ticket
                     ├─ User can download
                     ├─ User can close modal
                     │
                     ▼
Ticket ready for use at branch
```

---

This visual guide shows exactly what users will experience when using the QR code feature. Everything is professional, intuitive, and easy to use! 🎉
