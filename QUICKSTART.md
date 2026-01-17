# OCBC SmartHelp - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd back-end
npm install
```

### Step 2: Setup Environment
```bash
# Copy template
cp .env.example .env

# Edit .env with your credentials:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
GEMINI_API_KEY=your-gemini-key
JWT_SECRET=generate-a-secure-random-string
```

### Step 3: Setup Database
1. Go to [Supabase Console](https://app.supabase.com)
2. Create new project
3. Copy URL and Service Key to .env
4. Go to SQL Editor
5. Paste contents of `database/schema.sql`
6. Run SQL

### Step 4: Start Backend
```bash
npm start
# Server running at http://localhost:3000
```

### Step 5: Open Frontend
```bash
# In another terminal, serve the frontend
cd front-end
python -m http.server 8080
# Or: npx http-server -p 8080
```

Open: **http://localhost:8080**

## 🧪 Test It Out

### 1. Try the Chat (No Login Needed)
- Type: "I lost my card"
- Chat auto-detects: Card Services → Report Lost Card
- View tutorial steps

### 2. Register a New Account
- Click "Login" button
- Switch to "Register"
- Fill in: Name, Email, Password
- Auto-logged in!
- See your account details on dashboard

### 3. Schedule Consultation
- Type in chat: "I want to schedule a consultation"
- Select: "Physical Consultation"
- Choose branch (shows distance)
- Get QR code
- Download QR for check-in

### 4. Try Queue System
- Type: "Connect me with an agent"
- Click: "Join Queue Now"
- See your position & wait time
- Option to leave & schedule callback

### 5. Demo Credentials
```
Email: john@example.com
Password: password123

Email: jane@example.com
Password: password123
```

## 📁 File Structure

```
├── back-end/
│   ├── controllers/     # Business logic
│   ├── services/        # Database & AI operations
│   ├── middlewares/     # Auth validation
│   ├── utils/           # Helper functions
│   ├── app.js           # Express setup
│   └── server.js        # Entry point
├── front-end/
│   ├── index.html       # Main page
│   ├── index.css        # Styles
│   ├── auth.js          # Login/Register
│   ├── chatbot.js       # Chat logic
│   └── utils.js         # Frontend helpers
├── database/
│   └── schema.sql       # Database setup
└── README.md            # Full documentation
```

## 🔑 API Endpoints

### Auth
```
POST /api/auth/register          # Create account
POST /api/auth/login             # Login
GET  /api/auth/profile           # Get profile (auth required)
```

### Chat
```
POST /api/chat                   # Send message to chatbot
```

### Queue
```
POST /api/queue/join             # Join queue (auth required)
POST /api/queue/leave            # Leave queue (auth required)
GET  /api/queue/position         # Check position (auth required)
```

### Callbacks
```
POST /api/callbacks/schedule     # Schedule callback (auth required)
```

### Consultations
```
POST /api/consultations/qr       # Generate QR code (auth required)
```

## 💡 Key Features

✅ **Smart Chatbot** - Detects intent with Gemini AI  
✅ **Auth System** - JWT login/register  
✅ **Queue Management** - Real-time position tracking  
✅ **Callback Scheduling** - Book agents at preferred times  
✅ **Physical Consultations** - QR code for branch visits  
✅ **Enquiry History** - Track all interactions  
✅ **Responsive UI** - Works on mobile & desktop  

## 🐛 Troubleshooting

### "Cannot connect to backend"
- Is backend running? `npm start` in back-end/
- Check port 3000 is not blocked

### "Chatbot not responding"
- Check GEMINI_API_KEY in .env
- Check internet connection

### "Login fails"
- Verify Supabase credentials
- Check JWT_SECRET in .env
- Clear browser localStorage (DevTools → Application → Storage)

### "Database error"
- Run schema.sql in Supabase SQL Editor
- Check SUPABASE_URL and SUPABASE_SERVICE_KEY

## 📱 User Flows

### New User Journey
1. Land on homepage → See chat
2. Click Login → Registration
3. Create account → Auto-logged in
4. See dashboard with account info
5. Use chat to get support

### Support Journey
1. Ask question in chat
2. Chatbot detects intent
3. Choose support method:
   - Self-service tutorial
   - Physical consultation (QR code)
   - Online agent (queue or callback)

### Queue Journey
1. Join queue → See position
2. If too long → Leave & schedule callback
3. Agent calls at scheduled time
4. Provide feedback after call

## 🎓 Code Examples

### Send Chat Message
```javascript
const response = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: 'I want to reset my PIN',
    flowState: { category: null }
  })
});
const data = await response.json();
console.log(data.message); // Bot response
```

### Schedule Callback
```javascript
const response = await fetch('http://localhost:3000/api/callbacks/schedule', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    enquiryId: 'xxxx-yyyy-zzzz',
    preferredTime: '2024-01-20T14:00:00'
  })
});
```

## 📞 Get Help

1. Check README.md for full documentation
2. Review IMPLEMENTATION_SUMMARY.md for feature list
3. Check browser console (F12) for errors
4. Check terminal output for server logs

## 🎉 You're Ready!

Your OCBC SmartHelp Portal is up and running. Start testing with:

```
Frontend: http://localhost:8080
Backend:  http://localhost:3000
```

**Have fun exploring!** 🚀
