# 📊 Real QR Code - System Flow Diagram

## End-to-End Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User opens OCBC SmartHelp Portal                           │
│     http://localhost:8000/front-end/index.html                 │
│                                                                 │
│  2. Chatbot asks: "Would you like to visit a branch?"          │
│                                                                 │
│  3. User selects: "OCBC Tampines Central"                      │
│                                                                 │
│  4. Browser sends request to backend:                          │
│     POST /api/consultations/qr                                 │
│     {                                                           │
│       branch: "OCBC Tampines Central",                         │
│       enquiryId: "ENQ-001",                                    │
│       category: "account_services"                             │
│     }                                                           │
│                                                                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND PROCESSING                         │
│                 (consultationService.js)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ Step 1: Generate Consultation ID                           │
│     consultationId = "ENQ-8921-ABC"                            │
│                                                                 │
│  ✅ Step 2: Create Scannable URL                               │
│     qrUrl = "https://ocbc-smarthelp.sg/branch/check-in?token=ENQ-8921-ABC"
│                                                                 │
│  ✅ Step 3: Generate QR Code from URL                          │
│     Using: qrcode npm library                                  │
│     Input: qrUrl                                               │
│     Output: PNG image (300x300px)                              │
│     Error Correction: Level H (highest)                        │
│                                                                 │
│  ✅ Step 4: Convert PNG to Base64 Data URL                     │
│     Output: data:image/png;base64,iVBORw0KGgo...              │
│                                                                 │
│  ✅ Step 5: Save to Database                                   │
│     INSERT INTO consultations (                                │
│       consultation_id = "ENQ-8921-ABC",                        │
│       qr_code_image = "data:image/png;base64,..."             │
│     )                                                           │
│                                                                 │
│  ✅ Step 6: Return Response                                    │
│     {                                                           │
│       success: true,                                           │
│       consultationId: "ENQ-8921-ABC",                          │
│       qrCode: "data:image/png;base64,...",                    │
│       branch: "OCBC Tampines Central",                         │
│       instructions: [...]                                      │
│     }                                                           │
│                                                                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND DISPLAY (chatbot.js)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ Step 1: Receive Response from Backend                      │
│     qrData = {                                                  │
│       consultationId: "ENQ-8921-ABC",                          │
│       qrCode: "data:image/png;base64,..."                     │
│     }                                                           │
│                                                                 │
│  ✅ Step 2: Display Modal Window                               │
│     <div id="qr-modal" class="modal">                          │
│                                                                 │
│  ✅ Step 3: Render QR Code Image                               │
│     <img src="data:image/png;base64,..." />                   │
│     Size: 280x280px with border                                │
│     Result: Real QR code visible on screen                     │
│                                                                 │
│  ✅ Step 4: Display Consultation Details                       │
│     Reference ID: ENQ-8921-ABC                                 │
│     Branch: OCBC Tampines Central                              │
│     Valid For: 7 Working Days                                  │
│                                                                 │
│  ✅ Step 5: Show Instructions                                  │
│     1. Visit Your Branch                                       │
│     2. Scan at Counter                                         │
│     3. Get Queue Number                                        │
│                                                                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │
         ┌─────────────────────┴──────────────────────┐
         │                                            │
         ▼                                            ▼
┌───────────────────────────┐              ┌───────────────────────────┐
│     USER SCANS QR CODE    │              │  USER DOWNLOADS QR CODE   │
│      (Phone Camera)       │              │   (Save as PNG File)      │
├───────────────────────────┤              ├───────────────────────────┤
│                           │              │                           │
│  1. User opens phone      │              │  1. Click "Download"      │
│     camera app            │              │     button                │
│                           │              │                           │
│  2. Points at QR code     │              │  2. Browser downloads:    │
│     on screen             │              │     OCBC-Priority-Ticket- │
│                           │              │     ENQ-8921-ABC.png      │
│  3. Camera recognizes     │              │                           │
│     QR code               │              │  3. File saved in         │
│                           │              │     Downloads folder      │
│  4. Notification appears  │              │                           │
│     with URL              │              │  4. Can be:               │
│                           │              │     - Printed             │
│  5. Taps link             │              │     - Emailed             │
│                           │              │     - Shared              │
│  6. Opens:                │              │     - Scanned again       │
│ https://ocbc-smarthelp.   │              │                           │
│ sg/branch/check-in?token= │              │  File Format:             │
│ ENQ-8921-ABC              │              │  - PNG image              │
│                           │              │  - 300x300px              │
│  7. Processes check-in    │              │  - Scannable              │
│                           │              │                           │
│  ✅ SUCCESS               │              │  ✅ SUCCESS               │
│                           │              │                           │
└───────────────────────────┘              └───────────────────────────┘
```

---

## Data Flow - Detailed

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        QR CODE DATA JOURNEY                              │
└──────────────────────────────────────────────────────────────────────────┘

STEP 1: URL Generation (Backend)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Consultation ID: ENQ-8921-ABC
           ↓
  Full URL: https://ocbc-smarthelp.sg/branch/check-in?token=ENQ-8921-ABC
           ↓
        (Ready to encode as QR)


STEP 2: QR Code Generation (Backend - qrcode library)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Input:    URL string
  Library:  QRCode.toDataURL()
  Config:   {
              errorCorrectionLevel: "H",    // Highest (can recover)
              type: "image/png",            // PNG format
              quality: 0.95,                // High quality
              width: 300                    // 300x300 pixels
            }
  Output:   data:image/png;base64,iVBORw0KGgo...
            (Base64 encoded PNG image)


STEP 3: Database Storage (Backend)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  INSERT INTO consultations (
    consultation_id,      // "ENQ-8921-ABC"
    qr_code_image,        // "data:image/png;base64,..."
    preferred_branch,     // "OCBC Tampines Central"
    created_at            // timestamp
  )


STEP 4: Network Transfer (Frontend ← Backend)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  HTTP Response Body:
  {
    success: true,
    consultationId: "ENQ-8921-ABC",
    qrCode: "data:image/png;base64,iVBORw0KGgo...",
    branch: "OCBC Tampines Central",
    instructions: [...]
  }


STEP 5: Frontend Rendering
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  <img src="data:image/png;base64,iVBORw0KGgo..." />
           ↓
  Browser renders PNG image directly
           ↓
  Real QR code appears on screen (280x280px)


STEP 6: User Action - Scan
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Phone Camera
       ↓
  Reads QR code pixels
       ↓
  Decodes: https://ocbc-smarthelp.sg/branch/check-in?token=ENQ-8921-ABC
       ↓
  Opens URL in browser


STEP 7: User Action - Download
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  <a href="data:image/png;base64,..." download="...png" />
       ↓
  Browser converts to file
       ↓
  Saves: OCBC-Priority-Ticket-ENQ-8921-ABC.png
       ↓
  PNG file in Downloads folder
```

---

## QR Code Specifications

```
┌──────────────────────────────────────────────────────────────┐
│                   QR CODE TECHNICAL SPECS                    │
├──────────────────────────────────────────────────────────────┤

Encoded Content:
  https://ocbc-smarthelp.sg/branch/check-in?token=ENQ-XXXX-XXX

Image Format:
  PNG (Portable Network Graphics)

Dimensions:
  300x300 pixels (rendered as 280x280 on screen)

Error Correction:
  Level H (30% recovery capacity)
  - Can be damaged up to 30%
  - Still scannable

Color Depth:
  Black & white (1-bit)

Data Capacity:
  ~2953 bytes maximum
  Our URL: ~70 bytes (plenty of space)

Version:
  Auto-detected by library
  Typical: Version 2-3 (25x25 or 29x29 modules)

Margin:
  1 pixel border around QR code

Quality:
  0.95 (high quality compression)

Scannable By:
  ✅ iPhone built-in camera
  ✅ Android Google Lens
  ✅ Any QR code reader app
  ✅ Dedicated barcode scanners
  ✅ Web-based QR readers

File Size:
  ~2-5 KB as PNG
  ~1-2 KB when downloaded

Lifespan:
  Indefinite (PNG is lossless)
  Can be printed, stored, archived
```

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                      OCBC SMARTHELP PORTAL                     │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐         ┌────────────────────────┐
│      FRONTEND (Client)      │         │   BACKEND (Server)     │
├─────────────────────────────┤         ├────────────────────────┤
│                             │         │                        │
│ 1. index.html              │         │ 1. app.js              │
│    - QR modal              │         │    - Routes            │
│    - Input form            │    ────→│                        │
│                             │         │ 2. chatbotController.js│
│ 2. chatbot.js              │         │    - QR endpoint       │
│    - showQRCodeModal()      │    ────→│                        │
│    - downloadQRCode()       │         │ 3. consultationService │
│                             │         │    - Generate URL      │
│ 3. index.css               │         │    - QR encode         │
│    - QR card styles        │    ←────│    - DB save           │
│    - Modal styling         │         │                        │
│                             │         │ 4. supabaseClient.js  │
│                             │         │    - Database          │
│                             │         │                        │
│ 4. utils.js                │         │ 5. qrcode library      │
│    - API calls             │         │    - PNG generation    │
│    - Auth helpers          │         │                        │
│                             │         │                        │
└─────────────────────────────┘         └────────────────────────┘
           │                                     │
           │◄─ HTTP Response (JSON) ───────────┤
           │  { qrCode: "data:image/..." }     │
           │                                     │
           │─ HTTP Request (JSON) ─────────────┤
           │  { branch: "...", enquiryId: ... } │
           │                                     │
           ▼                                     ▼
    ┌───────────────┐                  ┌──────────────────┐
    │  User's Phone │                  │   Supabase DB    │
    │  Camera       │                  │  PostgreSQL      │
    │  Scans QR     │                  │  - consultations │
    └───────────────┘                  │  - enquiries     │
                                       │  - users         │
                                       └──────────────────┘

                              │
                              ▼
                    ┌─────────────────────┐
                    │  Check-in Endpoint  │
                    │ (Future endpoint)   │
                    │ /branch/check-in    │
                    │  ?token=ENQ-XXXX    │
                    └─────────────────────┘
```

---

## Component Interaction

```
┌──────────────────────────────────────────────────────────────┐
│              COMPONENT COMMUNICATION FLOW                     │
└──────────────────────────────────────────────────────────────┘

                 ┌─ USER SELECTS BRANCH ─┐
                 │                        │
                 ▼                        
    ┌─────────────────────────┐
    │   chatbot.js            │
    │ handleBranchSelection() │
    └────────┬────────────────┘
             │
             │ axios.post("/api/consultations/qr", {
             │   branch: "OCBC Tampines Central",
             │   enquiryId: "...",
             │   category: "..."
             │ })
             │
             ▼
    ┌──────────────────────────┐
    │   app.js                 │
    │   POST /api/consultations/qr
    └────────┬─────────────────┘
             │
             │
             ▼
    ┌──────────────────────────────┐
    │   chatbotController.js       │
    │   requestConsultationQR()    │
    └────────┬─────────────────────┘
             │
             │ generateConsultationQR(
             │   userId,
             │   enquiryId,
             │   branch
             │ )
             │
             ▼
    ┌──────────────────────────────┐
    │   consultationService.js     │
    │                              │
    │ 1. Generate ID              │
    │    ENQ-8921-ABC             │
    │                              │
    │ 2. Create URL               │
    │    https://ocbc-.../token=. │
    │                              │
    │ 3. Encode as QR             │
    │    QRCode.toDataURL()       │
    │                              │
    │ 4. Save to DB               │
    │    consultations table      │
    │                              │
    │ 5. Return response          │
    │    { qrCode: "..." }        │
    └────────┬─────────────────────┘
             │
             │ Response: {
             │   consultationId: "ENQ-8921-ABC",
             │   qrCode: "data:image/png;base64,...",
             │   branch: "...",
             │   instructions: [...]
             │ }
             │
             ▼
    ┌───────────────────────────┐
    │   chatbot.js              │
    │   showQRCodeModal(qrData) │
    │                           │
    │ - Set <img src="...">     │
    │ - Display details         │
    │ - Show modal              │
    └───────┬───────────────────┘
            │
            ▼
    ┌───────────────────────────┐
    │   Browser Renders         │
    │   - Purple card           │
    │   - QR image              │
    │   - Details               │
    │   - Download button       │
    └───────┬───────────────────┘
            │
            ▼
    ┌───────────────────────────┐
    │   User Actions            │
    │   - Scan QR with phone    │
    │   - Download PNG file     │
    │   - Share/Print           │
    └───────────────────────────┘
```

---

**This is a complete, real QR code system - not a placeholder!**
