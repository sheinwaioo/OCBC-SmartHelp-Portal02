# QR Code Feature - What to Expect When Testing

## 🎬 Test Scenario: Complete User Journey

### Step 1: Login to Dashboard
```
User Action: Open app and log in
Expected: Dashboard loads with welcome message
Status: ✅ Existing functionality
```

### Step 2: Open Chatbot
```
User Action: Scroll to "OCBC Intelligent Navigator" section
Expected: Chat interface appears with greeting
Status: ✅ Existing functionality
```

### Step 3: Request Consultation
```
User Action: Type "I need a physical consultation" in chat
           OR "I want to meet at a branch"
           OR Similar consultation request

Bot Response Expected:
  "Great! Let's schedule your consultation at an OCBC branch."
  
  Displays 4 branch options:
  • Main Branch - CBD (0.2km)
  • Tampines Branch (4.5km)
  • Orchard Branch (2.1km)
  • Jurong East Branch (12.3km)

Status: ✅ NEW - Enhanced from previous version
```

### Step 4: Select Branch
```
User Action: Click on "Main Branch - CBD" (or any branch)
            
Bot Response Expected:
  "Generating your consultation QR code for Main Branch - CBD..."
  [Brief loading animation]
  
  Then:
  "✅ Your consultation has been scheduled!"
  "Consultation ID: ENQ-8921-X"
  (Note: Actual ID will vary like ENQ-1234-ABC)
  "Your priority queue ticket is ready. You can download it 
   or view it anytime."
  
  Displays quick reply buttons:
  • View QR Code ← NEW
  • Schedule Another Consultation
  • Go Back

Status: ✅ NEW - QR generated here
```

### Step 5: View QR Code
```
User Action: Click "View QR Code" button

Modal Expected to Open:
┌────────────────────────────────────────────┐
│     Your Consultation QR Code              │
│     [X close button]                       │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │      [QR CODE IMAGE HERE]            │ │
│  │      (280x280 pixels)                │ │
│  │                                      │ │
│  │      ENQ-8921-X                      │ │
│  │      (Consultation ID)               │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  # Priority Queue Ticket                   │
│                                            │
│  ⏱ Valid for 7 working days               │
│                                            │
│  This code contains your verified identity │
│  and enquiry details. Scan it at any branch│
│  kiosk nationwide to get a priority queue  │
│  number instantly.                         │
│                                            │
│  Selected Branch:                          │
│  Main Branch - CBD                         │
│                                            │
│  Instructions:                             │
│  • Scan or show this QR code at your OCBC │
│    branch                                  │
│  • Expected wait time: 5-10 minutes from   │
│    check-in                                │
│  • Bring a valid ID for verification       │
│  • Code valid for 7 working days           │
│                                            │
│  [DOWNLOAD QR CODE] button                 │
│                                            │
└────────────────────────────────────────────┘

Styling Details:
  • Dark navy background with gradient
  • White QR container
  • Red OCBC colors for accent
  • Professional modern design
  • Clear typography hierarchy

Status: ✅ NEW - Professional ticket display
```

### Step 6: Download QR Code
```
User Action: Click "DOWNLOAD QR CODE" button

Expected Result:
  • Browser downloads file
  • Filename: OCBC-Priority-Ticket-ENQ-8921-X.png
  • File size: ~5-10 KB (PNG image)
  • File location: Default downloads folder
  • Can be opened in any image viewer
  • Can be printed
  • Can be emailed

Status: ✅ NEW - Download functionality

Note: File name varies based on consultation ID
```

### Step 7: Close Modal
```
User Action: Click [X] button or click outside modal

Expected Result:
  • Modal closes smoothly
  • Returns to chat interface
  • Chat history remains intact
  • Can still see "View QR Code" button in history

Status: ✅ Smooth interaction
```

## 🧪 Test Scenarios for Quality Assurance

### Scenario 1: Multiple Consultations
```
Test: Create multiple consultations in same session

Expected:
✅ Each consultation gets unique ID (ENQ-XXXX-XXX)
✅ Each QR code is unique
✅ No duplicates or errors
✅ All stored in database
✅ User can view/download any of them
```

### Scenario 2: Different Branches
```
Test: Create consultations for different branches

Expected:
✅ Each ticket shows correct branch name
✅ Branch info displayed in modal
✅ All QR codes different despite same user
✅ Database entries have correct branch data
```

### Scenario 3: Browser Download
```
Test: Download QR code in different browsers

Expected Chrome:
✅ Downloads to Downloads folder
✅ File name correct
✅ Can open in default image viewer

Expected Firefox:
✅ Downloads to Downloads folder
✅ File name correct
✅ Can open in default image viewer

Expected Safari:
✅ Downloads or opens in Preview
✅ File name correct
✅ Can save to device

Expected Edge:
✅ Downloads to Downloads folder
✅ File name correct
✅ Can open in default image viewer
```

### Scenario 4: Mobile Testing
```
Test: QR code on mobile device

Expected:
✅ Modal responsive on small screen
✅ QR code visible and clear
✅ Download button works
✅ Consult ID readable
✅ All text visible
✅ Modal scrollable if needed
```

### Scenario 5: QR Code Scanner
```
Test: Scan generated QR code with phone

Expected:
✅ Smartphone QR scanner reads code
✅ Decodes to JSON: {"consultationId":"ENQ-8921-X",...}
✅ Can verify data in decoded output
✅ Proof of encryption working

Note: To test:
  1. Download QR code (PNG)
  2. Use phone camera app
  3. Point at PNG displayed on screen
  4. Should decode successfully
```

### Scenario 6: Unauthenticated User
```
Test: Try to generate QR without logging in

Expected:
✅ Chat prompts for login
✅ Cannot proceed to consultation
✅ No QR code generated
✅ Error handled gracefully
```

### Scenario 7: Logged Out During Process
```
Test: Log out mid-process and try to generate QR

Expected:
✅ Session expires
✅ API returns 401 error
✅ Frontend redirects to login
✅ No QR code created
✅ User must log in again
```

## 📊 Expected API Responses

### Success Response (200 OK)
```json
{
  "success": true,
  "consultationId": "ENQ-8921-X",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAAN...",
  "branch": "Main Branch - CBD",
  "instructions": [
    "Scan or show this QR code at your OCBC branch",
    "Expected wait time: 5-10 minutes from check-in",
    "Bring a valid ID for verification",
    "Code valid for 7 working days"
  ]
}
```

### Error Response (401 Unauthorized)
```json
{
  "error": "Login required"
}
```

### Error Response (500 Server Error)
```json
{
  "error": "Failed to generate QR code",
  "details": "Error message here"
}
```

## 🎯 Visual Verification Checklist

During testing, verify these visual elements:

### QR Code Image
- [ ] Visible and clear
- [ ] 280x280 pixels (takes up good space)
- [ ] Black and white (no colors)
- [ ] Square shape
- [ ] Center positioned
- [ ] Has white margin
- [ ] Scannable with phone camera

### Consultation ID
- [ ] Format: ENQ-XXXX-XXX
- [ ] Bold and large (18px+)
- [ ] OCBC red color (#ef2b2d)
- [ ] Positioned below QR code
- [ ] Easy to read and copy

### Ticket Container
- [ ] Dark background (navy blue)
- [ ] White QR container
- [ ] Padding around elements
- [ ] Rounded corners
- [ ] Professional appearance
- [ ] Good contrast

### Text Elements
- [ ] "Priority Queue Ticket" heading visible
- [ ] "Valid for 7 working days" badge visible
- [ ] Red badge color
- [ ] Description text readable
- [ ] Branch info displayed
- [ ] Instructions listed clearly

### Download Button
- [ ] Red color (OCBC red)
- [ ] Readable text
- [ ] Clickable
- [ ] Hover effect (darker on hover)
- [ ] Positioned at bottom

## 🐛 Common Issues to Watch For

### Issue 1: QR Code Not Showing
```
Symptoms: Modal opens but QR image blank
Solution: 
  - Check browser console for errors
  - Verify backend running
  - Check network tab for API response
  - Ensure qrcode package installed
```

### Issue 2: Download Not Working
```
Symptoms: Click download but nothing happens
Solution:
  - Check browser download settings
  - Try different browser
  - Check browser console for errors
  - Ensure pop-up blocker not blocking
```

### Issue 3: Modal Won't Open
```
Symptoms: Click "View QR Code" but nothing happens
Solution:
  - Check browser console for errors
  - Verify JavaScript loaded
  - Check if lastQRData has data
  - Reload page and try again
```

### Issue 4: Wrong Consultation ID Format
```
Symptoms: ID shows as "CONS..." instead of "ENQ-..."
Solution:
  - Backend code not updated correctly
  - Check consultationService.js
  - Verify ENQ format in line: consultationId = `ENQ-${...}`
  - Restart backend after code change
```

## 🎓 Success Indicators

When everything is working correctly, you should see:

✅ **After selecting branch:**
- Confirmation message appears
- Consultation ID shown
- "View QR Code" button available

✅ **When viewing QR code:**
- Professional modal appears
- QR code image visible and scannable
- All text readable
- Styling matches screenshot

✅ **When downloading:**
- PNG file downloads successfully
- File named correctly
- File opens in image viewer
- Can print or share

✅ **In database:**
- New consultation record created
- QR code image stored
- Consultation ID saved
- Branch info recorded

## 🎉 Final Testing Checklist

Before considering feature complete:

- [ ] Backend runs without errors
- [ ] QR codes generate successfully
- [ ] Consultation IDs unique each time
- [ ] Frontend modal displays correctly
- [ ] Styling matches requirements
- [ ] Download functionality works
- [ ] Works on all browsers tested
- [ ] Mobile responsive
- [ ] QR codes scannable
- [ ] Database stores records
- [ ] Error handling in place
- [ ] No console errors
- [ ] User flow smooth and intuitive

---

**Expected Testing Time**: 15-20 minutes
**Difficulty Level**: Easy (just follow the flow)
**Success Rate**: Should be 100% if all steps completed

Good luck with testing! 🚀
