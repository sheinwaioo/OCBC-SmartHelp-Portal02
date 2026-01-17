# OCBC SmartHelp Portal - MVP

An intelligent chatbot-powered customer support website for OCBC Bank. This MVP demonstrates modern UX practices with intelligent intent classification, structured support flows, and seamless customer journeys.

## 🎯 Key Features

### Authentication & Security
- JWT-based authentication system
- User registration and login
- Protected routes for sensitive operations
- Session persistence with localStorage

### Intelligent Chatbot
- **Intent Classification**: Uses Gemini AI to understand customer intent naturally
- **Structured Flows**: Automatically guides users through optimal support journeys
- **Smart Routing**: Suggests self-service, physical consultation, or online agent support
- **UX Optimization**: 
  - Auto-detects intent to skip unnecessary steps
  - Combines related steps for efficiency
  - Graceful fallbacks for unclear requests

### Support Channels
1. **Self-Service Tutorials**: Step-by-step guidance within the chat
2. **Physical Consultation**: 
   - Schedule at preferred OCBC branch
   - Generate QR code for check-in
   - Feedback collection post-visit
   - **Login Required**

3. **Online Agent Support**:
   - Join queue with position tracking
   - Estimated wait time display
   - Schedule callbacks at preferred times
   - Leave queue with alternative suggestions
   - **Login Required**

### Enquiry Management
- Track all customer inquiries by category and sub-category
- View enquiry history (logged-in users)
- Persistent conversation state

### Branch & Slot Management
- Display available OCBC branches with distance info
- Pre-configured callback time slots
- Queue position tracking with estimated wait times

## 📋 Support Categories

### Card Services
- Report Lost Card
- Manage Card Limit
- Link Account to Card
- Lock / Unlock Card

### Account & Banking
- Reset Login PIN
- Check Balance
- Update Personal Details

### Loan & Finances (Expandable)
- Loan Inquiry
- Investment Advisory
- Savings Plans

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT
- **AI**: Google Generative AI (Gemini)
- **Dependencies**: 
  - `cors`: Cross-origin requests
  - `dotenv`: Environment variables
  - `jsonwebtoken`: JWT handling
  - `@supabase/supabase-js`: Database client
  - `@google/generative-ai`: Gemini API

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern responsive design
- **JavaScript**: Vanilla ES6+
- **API Communication**: Fetch API with Bearer tokens
- **State Management**: LocalStorage + JavaScript objects

## 📦 Project Structure

```
.
├── back-end/
│   ├── controllers/
│   │   ├── authController.js      # Login, register, profile
│   │   └── chatbotController.js   # Chatbot orchestration
│   ├── middlewares/
│   │   └── authMiddleware.js      # JWT verification
│   ├── services/
│   │   ├── intentEngine.js        # Gemini intent classification
│   │   ├── enquiryService.js      # Enquiry CRUD
│   │   ├── queueService.js        # Queue & callback management
│   │   └── consultationService.js # QR code & consultations
│   ├── utils/
│   │   └── jwtUtils.js            # Token generation/verification
│   ├── app.js                      # Express app setup
│   ├── server.js                   # Server entry point
│   ├── package.json
│   └── supabaseClient.js           # Supabase initialization
├── front-end/
│   ├── index.html                  # Main page
│   ├── index.css                   # Global styles + modals
│   ├── utils.js                    # Utility functions
│   ├── auth.js                     # Authentication UI/logic
│   ├── chatbot.js                  # Chatbot UI/logic
│   └── index.js                    # Page initialization
├── database/
│   └── schema.sql                  # Database migration
└── README.md
```

## 🚀 Setup & Installation

### Prerequisites
- Node.js 16+ with npm
- Supabase account (free tier works)
- Google Gemini API key

### 1. Backend Setup

```bash
cd back-end

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your credentials:
# - SUPABASE_URL
# - SUPABASE_SERVICE_KEY
# - GEMINI_API_KEY
# - JWT_SECRET (generate a secure key)
```

### 2. Database Setup

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Go to SQL Editor
4. Run all queries from `database/schema.sql`
5. Copy your project URL and API key to `.env`

### 3. Frontend Setup

```bash
cd front-end

# Open index.html in browser or use a local server:
# Python
python -m http.server 8080

# Or Node.js (http-server)
npx http-server -p 8080
```

### 4. Start Backend Server

```bash
cd back-end
npm start

# Server will run at http://localhost:3000
```

### 5. Access the Application

Open browser to `http://localhost:8080` (frontend) or your frontend server URL

## 🔑 Getting API Keys

### Supabase
1. Sign up at https://supabase.com
2. Create a new project
3. Go to Settings → API Keys
4. Copy `Project URL` and `Service Role Key`

### Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key

## 📱 Demo Credentials

Pre-seeded demo users (after running schema.sql):

```
Email: john@example.com
Password: password123

Email: jane@example.com
Password: password123
```

## 🔐 Authentication Flow

1. User clicks "Login" → Opens auth modal
2. User enters credentials → POST `/api/auth/login`
3. Backend validates → Returns JWT token + user data
4. Frontend stores token in localStorage and authHeader
5. All subsequent requests include `Authorization: Bearer <token>`
6. Protected endpoints validate token via `authMiddleware`

## 💬 Chatbot Flow

### 1. Initial Intent Classification
```
User: "I want to reset my login PIN"
↓
Gemini AI: Classifies as "Account & Banking" → "Reset Login PIN"
↓
Skip category selection, move directly to assistance options
```

### 2. Assistance Options
After identifying the inquiry, chatbot presents:
- **View Tutorial** (Self-service)
- **Physical Consultation** (Branch visit with QR code)
- **Online Agent Support** (Queue or callback)

### 3. Queue Management (Login Required)
- User joins queue → Gets position + estimated wait time
- Real-time position tracking
- Option to leave queue + schedule callback

### 4. Callback Scheduling
- Shows available time slots (business hours, next 7 days)
- Generates confirmation code
- SMS/Email notification (future enhancement)

### 5. Physical Consultation (Login Required)
- Shows branch list with distance/accessibility
- Generates unique QR code with consultation ID
- Allows download/save
- Post-visit feedback collection

## 🎨 UX Enhancements & Refinements

### Implemented Optimizations
1. **Smart Intent Detection**: 
   - Avoids unnecessary form filling
   - Directly routes to relevant content when intent is clear

2. **Graceful Authentication**:
   - Politely prompts login for restricted features
   - Clear messaging about why login is needed
   - One-click access to login from chat

3. **Better Error Handling**:
   - User-friendly error messages
   - Suggestions for next steps
   - Fallback mechanisms

4. **Queue UX**:
   - Show real-time position
   - Display estimated wait time
   - Offer callback alternative immediately
   - Show queue alternatives when leaving

5. **Simplified Forms**:
   - Pre-fill known information
   - Single-field focused inputs
   - Clear CTAs and next steps

## 🔒 Security Considerations

### Current Implementation
- JWT tokens with expiration
- Bearer token in Authorization header
- Protected API endpoints with `authMiddleware`

### Production Recommendations
- Use bcrypt for password hashing (currently plain-text for demo)
- Implement HTTPS/TLS
- Add CSRF protection
- Implement rate limiting
- Use environment variables for all secrets
- Add request validation and sanitization
- Implement database-level RLS policies

## 🧪 Testing the MVP

### Test Scenarios

1. **Anonymous User**:
   - View homepage
   - Start chat → Can ask questions
   - Try to schedule consultation → Prompted to login ✅

2. **New User Registration**:
   - Click Login → Switch to Register
   - Create account with email/password
   - Auto-logged in after registration ✅

3. **Intent Classification**:
   - Say "I lost my card" → Auto-detects Card Services
   - Say "Reset my PIN" → Auto-detects Account & Banking
   - Ask vague question → Shows category options ✅

4. **Queue Management**:
   - Join queue → Shows position & wait time
   - Leave queue → Offers callback scheduling ✅

5. **Consultation Booking**:
   - Select Physical Consultation
   - Choose branch → Generates QR code
   - Download and save QR ✅

## 📊 Future Enhancements

### Phase 2
- [ ] SMS/Email notifications for queue/callbacks
- [ ] Admin dashboard for queue monitoring
- [ ] Live chat with actual agents
- [ ] Multi-language support
- [ ] Video tutorials in chat
- [ ] AI training on OCBC-specific FAQs

### Phase 3
- [ ] Mobile app
- [ ] Voice interface
- [ ] Integration with banking APIs
- [ ] Real transaction processing
- [ ] Analytics and reporting

## 📞 Support

For issues or questions:
1. Check database connection in Supabase dashboard
2. Verify API keys in .env file
3. Check browser console for errors
4. Check server logs: `npm start` output

## 📄 License

© 2024 OCBC Bank. MVP for demonstration purposes.