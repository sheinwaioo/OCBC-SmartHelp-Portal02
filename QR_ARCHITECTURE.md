# QR Code Feature - Architecture Diagram

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Chatbot: "Select preferred branch"                             │
│     ├─ Main Branch - CBD                                           │
│     ├─ Tampines Branch                                             │
│     ├─ Orchard Branch                                              │
│     └─ Jurong East Branch                                          │
│                                                                     │
│  2. User clicks: "Main Branch - CBD"                               │
│                                                                     │
│  3. Chatbot: "Generating QR code..."                               │
│                                                                     │
└─────────────────┬───────────────────────────────────────────────────┘
                  │
                  │ POST /consultations/qr
                  │ {enquiryId, branch, category, subcategory}
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND API LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  chatbotController.requestConsultationQR()                         │
│  │                                                                  │
│  ├─ Validate user authentication                                   │
│  ├─ Create enquiry if needed                                       │
│  └─ Call generateConsultationQR()                                  │
│                                                                     │
└─────────────────┬───────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CONSULTATION SERVICE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  generateConsultationQR(userId, enquiryId, branch)                │
│  │                                                                  │
│  ├─ Generate unique ID:     "ENQ-8921-ABC"                        │
│  │                                                                  │
│  ├─ Create QR data JSON:    {                                      │
│  │                            consultationId: "ENQ-8921-ABC",       │
│  │                            userId: "user123",                    │
│  │                            timestamp: "2026-01-17T...",         │
│  │                            branch: "Main Branch - CBD"           │
│  │                          }                                       │
│  │                                                                  │
│  └─ Generate QR PNG image:  data:image/png;base64,...             │
│     (using QRCode.toDataURL())                                     │
│                                                                     │
│     ┌─ QR Code Settings                                            │
│     ├─ Error Correction: High                                      │
│     ├─ Format: PNG (300x300px)                                     │
│     └─ Quality: 0.95                                               │
│                                                                     │
└─────────────────┬───────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  consultations table INSERT:                                       │
│  {                                                                  │
│    user_id: userId,                                                │
│    enquiry_id: enquiryId,                                          │
│    consultation_id: "ENQ-8921-ABC",                                │
│    qr_code_image: "data:image/png;base64,...",                   │
│    qr_data: "{...json...}",                                        │
│    preferred_branch: "Main Branch - CBD",                          │
│    status: "scheduled",                                            │
│    created_at: timestamp                                           │
│  }                                                                  │
│                                                                     │
└─────────────────┬───────────────────────────────────────────────────┘
                  │
                  │ Return: {
                  │   success: true,
                  │   consultationId: "ENQ-8921-ABC",
                  │   qrCode: "data:image/png;base64,...",
                  │   branch: "Main Branch - CBD",
                  │   instructions: [...]
                  │ }
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND DISPLAY                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  handleBranchSelection() receives response                         │
│  │                                                                  │
│  ├─ Store in lastQRData                                            │
│  ├─ Show: "✅ Consultation scheduled!"                             │
│  ├─ Show: "Consultation ID: ENQ-8921-ABC"                         │
│  └─ Show: "View QR Code" button                                    │
│                                                                     │
│  User clicks: "View QR Code"                                       │
│     │                                                               │
│     ▼                                                               │
│  showQRCodeModal(lastQRData) opens modal with:                    │
│  │                                                                  │
│  ├─ ┌─────────────────────────────────┐                           │
│  │  │  [QR CODE IMAGE]                │                           │
│  │  │  ENQ-8921-ABC                   │                           │
│  │  │  Priority Queue Ticket          │                           │
│  │  │  ✓ Valid 7 working days         │                           │
│  │  │  Branch: Main Branch - CBD      │                           │
│  │  │  [Download Button]              │                           │
│  │  └─────────────────────────────────┘                           │
│  │                                                                  │
│  └─ User can download: "OCBC-Priority-Ticket-ENQ-8921-ABC.png"    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                    OCBC SmartHelp Portal                            │
│                                                                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─ Frontend Layer ─────────────────────────────────────────────┐ │
│  │                                                              │ │
│  │  index.html (QR Modal Structure)                           │ │
│  │      ↑                                                       │ │
│  │      └─ chatbot.js (QR Logic & Display)                    │ │
│  │           ├─ handleBranchSelection()                        │ │
│  │           ├─ showQRCodeModal()                              │ │
│  │           ├─ showQuickReplies()                             │ │
│  │           └─ downloadQRCode()                               │ │
│  │           │                                                  │ │
│  │           └─ index.css (QR Styling)                        │ │
│  │                ├─ .qr-ticket                                │ │
│  │                ├─ .qr-code-container                        │ │
│  │                ├─ .qr-image                                 │ │
│  │                ├─ .qr-validity                              │ │
│  │                ├─ .qr-description                           │ │
│  │                ├─ .qr-branch-info                           │ │
│  │                ├─ .qr-instructions-list                     │ │
│  │                └─ #download-qr                              │ │
│  │                                                              │ │
│  └──────────────────┬──────────────────────────────────────────┘ │
│                     │                                              │
│                     │ HTTP POST                                    │
│                     │ /consultations/qr                           │
│                     ▼                                              │
│  ┌─ Backend Layer ──────────────────────────────────────────────┐ │
│  │                                                              │ │
│  │  app.js (Route Definition)                                 │ │
│  │      ↓                                                       │ │
│  │  chatbotController.js (Request Handler)                    │ │
│  │      └─ requestConsultationQR()                            │ │
│  │           │                                                  │ │
│  │           ▼                                                  │ │
│  │  consultationService.js (Business Logic)                   │ │
│  │      └─ generateConsultationQR()                           │ │
│  │           ├─ Generate ENQ-XXXX-XXX ID                      │ │
│  │           ├─ Create QR data JSON                            │ │
│  │           ├─ Call QRCode.toDataURL()                        │ │
│  │           │   (requires: qrcode npm package)               │ │
│  │           ├─ Insert to Supabase                             │ │
│  │           └─ Return formatted response                      │ │
│  │                                                              │ │
│  └──────────────────┬──────────────────────────────────────────┘ │
│                     │                                              │
│                     │ SQL INSERT                                   │
│                     ▼                                              │
│  ┌─ Database Layer ─────────────────────────────────────────────┐ │
│  │                                                              │ │
│  │  Supabase PostgreSQL                                        │ │
│  │      └─ consultations table                                 │ │
│  │           ├─ id (primary key)                               │ │
│  │           ├─ user_id                                        │ │
│  │           ├─ enquiry_id                                     │ │
│  │           ├─ consultation_id (ENQ-XXXX-XXX)                │ │
│  │           ├─ qr_code_image (PNG data URL)                  │ │
│  │           ├─ qr_data (JSON)                                 │ │
│  │           ├─ preferred_branch                               │ │
│  │           ├─ status                                         │ │
│  │           └─ created_at                                     │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Input (Branch Selection)
         │
         ▼
Frontend Event Listener (chatbot.js)
         │
         ├─ Collect: enquiryId, branch, category, subcategory
         │
         ▼
API Call: POST /consultations/qr
         │
         ├─ Auth Validation (authMiddleware)
         │
         ▼
chatbotController.requestConsultationQR()
         │
         ├─ Create enquiry if needed
         │
         ▼
consultationService.generateConsultationQR()
         │
         ├─ Step 1: Generate ID (ENQ-XXXX-XXX)
         │
         ├─ Step 2: Create QR data object
         │
         ├─ Step 3: Generate PNG QR code
         │    └─ QRCode.toDataURL(data, options)
         │
         ├─ Step 4: Insert to database
         │
         ▼
Return Response
         │
         ├─ consultationId
         ├─ qrCode (data URL)
         ├─ branch
         ├─ instructions
         │
         ▼
Frontend Receives Response
         │
         ├─ Store in lastQRData
         ├─ Show confirmation
         ├─ Display "View QR Code" button
         │
         ▼
User Clicks "View QR Code"
         │
         ▼
showQRCodeModal(lastQRData)
         │
         ├─ Render qr-ticket
         ├─ Display QR image
         ├─ Show consultation ID
         ├─ Show instructions
         │
         ▼
User Can Download or Share
         │
         ├─ Download: OCBC-Priority-Ticket-{ID}.png
         ├─ Share: Send PNG to others
         └─ Scan: Any QR reader can scan
```

## File Dependencies

```
Package Dependencies
├─ npm packages
│  └─ qrcode (v1.5.4)
│     └─ Used in: consultationService.js
│
Frontend Dependencies
├─ index.html
│  ├─ CSS: index.css (QR styling)
│  └─ JS: chatbot.js (QR logic)
│
Backend Dependencies
├─ consultationService.js
│  ├─ Imports: qrcode, supabase
│  └─ Exported: generateConsultationQR()
│
├─ chatbotController.js
│  ├─ Imports: consultationService
│  └─ Exported: requestConsultationQR()
│
└─ app.js
   ├─ Routes: POST /api/consultations/qr
   └─ Calls: requestConsultationQR()
```

## QR Code Generation Process

```
Input Data
├─ consultationId: "ENQ-8921-ABC"
├─ userId: "user123"
├─ timestamp: "2026-01-17T10:30:00Z"
└─ branch: "Main Branch - CBD"
    │
    ▼
JSON Stringify
│
├─ {"consultationId":"ENQ-8921-ABC",...}
│
    ▼
QRCode.toDataURL() with options
│
├─ errorCorrectionLevel: "H"
├─ type: "image/png"
├─ quality: 0.95
├─ width: 300 (pixels)
└─ margin: 1
    │
    ▼
PNG Image Generated
│
├─ Scanned by: Any QR code reader
├─ Encoded data: JSON object
└─ Data URL: data:image/png;base64,...
    │
    ▼
Output
└─ Base64 PNG string (stored in DB + sent to frontend)
```

This architecture ensures:
- ✅ Secure QR generation on backend
- ✅ Professional display on frontend
- ✅ Persistent storage in database
- ✅ Easy download/sharing for users
- ✅ Scalable to multiple branches
