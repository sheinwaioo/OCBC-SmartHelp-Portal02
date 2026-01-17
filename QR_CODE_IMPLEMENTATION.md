# QR Code Implementation Guide

## Overview
The QR code feature generates a priority queue ticket after the user selects a preferred OCBC branch for physical consultation. The ticket displays:
- An actual QR code image (PNG format)
- A unique consultation ID (e.g., ENQ-8921-X format)
- Branch information
- Validity period (7 working days)
- Instructions for use

## Implementation Details

### 1. Backend Changes

#### Updated File: `back-end/package.json`
- Added `qrcode` package (v1.5.4) for generating QR code images

#### Updated File: `back-end/services/consultationService.js`
- Imported `qrcode` library
- Modified `generateConsultationQR()` function to:
  - Generate consultation IDs in format: `ENQ-XXXX-XXX` (e.g., ENQ-8921-X)
  - Use `QRCode.toDataURL()` to generate actual PNG QR code images
  - Store QR code image as data URL in database
  - Return both the QR image and consultation ID to frontend
  - Provide relevant instructions (scan location, wait time, ID requirement, validity)

**Key Features:**
- High error correction level (H) for better scanning reliability
- 300x300px image size for clarity
- Data includes: consultationId, userId, timestamp, branch

### 2. Frontend Changes

#### Updated File: `front-end/chatbot.js`

**Modified Functions:**

1. **`handleBranchSelection(branchName)`**
   - Calls the `/consultations/qr` endpoint to generate QR code
   - Stores QR data in `lastQRData` variable
   - Shows confirmation message with consultation ID
   - Displays "View QR Code" button for users to view/download ticket

2. **`showQRCodeModal(qrData)`**
   - Displays the priority queue ticket in a professional format
   - Shows:
     - QR code image
     - Consultation ID displayed below QR code
     - "Priority Queue Ticket" heading
     - Validity badge ("Valid for 7 working days")
     - Ticket description
     - Selected branch information
     - Instructions for use
   - "Download QR Code" button for saving ticket as PNG

3. **`downloadQRCode(qrData)`**
   - Downloads the QR code image as PNG file
   - File naming: `OCBC-Priority-Ticket-{consultationId}.png`

4. **`showQuickReplies(replies)`**
   - Updated to handle "View QR Code" button
   - Displays modal when clicked with stored QR data

#### Updated File: `front-end/index.css`

Added comprehensive styling for QR ticket display:
- **`.qr-ticket`**: Main ticket container with dark background gradient
- **`.qr-code-container`**: White container for QR code image
- **`.qr-image`**: QR code image styling (280x280px)
- **`.consultation-id`**: Large, bold consultation ID display in OCBC red
- **`.qr-validity`**: "Valid for 7 working days" badge with red styling
- **`.qr-description`**: Informative text about ticket usage
- **`.qr-branch-info`**: Branch selection display
- **`.qr-instructions-list`**: Instructions for scanning and using the ticket
- **`#download-qr`**: Download button with hover effects

## User Flow

1. **User selects "Physical Consultation"** → Chat prompts for branch selection
2. **User chooses preferred branch** → QR code generation starts
3. **Backend generates:**
   - Unique consultation ID (ENQ format)
   - QR code PNG image
   - Consultation record in database
4. **Frontend displays:**
   - Confirmation message
   - "View QR Code" button
5. **User clicks "View QR Code"** → Modal displays professional ticket
6. **User can download** → PNG file saved with consultation ID

## API Endpoint

### POST `/api/consultations/qr`
**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "enquiryId": "string",
  "branch": "string",
  "category": "string",
  "subcategory": "string"
}
```

**Response:**
```json
{
  "success": true,
  "consultationId": "ENQ-8921-X",
  "qrCode": "data:image/png;base64,...",
  "branch": "Main Branch - CBD",
  "instructions": [
    "Scan or show this QR code at your OCBC branch",
    "Expected wait time: 5-10 minutes from check-in",
    "Bring a valid ID for verification",
    "Code valid for 7 working days"
  ]
}
```

## Database Updates

The consultations table now stores:
- `qr_code_image`: Data URL of the PNG QR code
- `consultation_id`: Unique ID in ENQ format
- `qr_data`: JSON containing all QR metadata

## Installation & Setup

### Backend
```bash
cd back-end
npm install qrcode
```

### Frontend
No additional installations needed - uses native browser APIs

## Testing the Feature

1. **Start the backend server:**
   ```bash
   cd back-end
   npm start
   ```

2. **Open the frontend** and log in

3. **In chatbot:**
   - Say "I need a consultation" or similar
   - Select "Physical Consultation"
   - Choose a branch
   - See QR code generated with your unique ticket

4. **Test download:**
   - Click "View QR Code"
   - Click "Download QR Code"
   - Verify PNG file downloads

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- QR codes generated as data URLs (no server files needed)
- PNG format is universally supported

## Security Considerations

- QR codes contain encrypted consultation metadata
- QR data includes userId, timestamp, and branch info
- Valid for 7 working days (can be extended in consultationService)
- Backend validates user authentication before QR generation

## Future Enhancements

1. **QR Code Scanner**: Add ability to scan QR codes at branch kiosks
2. **Email Delivery**: Send ticket via email to user
3. **SMS Notification**: Send consultation ID via SMS
4. **Expiry Management**: Automatic ticket expiry and re-issuance
5. **Queue Integration**: Show real-time queue position after booking
6. **Mobile-Optimized**: Generate mobile-friendly ticket format
