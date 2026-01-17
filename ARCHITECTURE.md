# OCBC SmartHelp Portal - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  HTML5 Page  │  │  CSS3 Styles │  │ JavaScript   │           │
│  │  (Semantic)  │  │ (Responsive) │  │ (ES6+ Vanilla)          │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│         │                │                │                      │
│         └────────────────┴────────────────┘                      │
│                        │                                         │
│         ┌──────────────v──────────────┐                          │
│         │   Frontend JavaScript       │                          │
│         │  - auth.js                  │                          │
│         │  - chatbot.js               │                          │
│         │  - utils.js                 │                          │
│         │  - index.js                 │                          │
│         └──────────────┬──────────────┘                          │
└────────────────────────┼──────────────────────────────────────────┘
                         │
                 ┌───────v────────┐
                 │  HTTP/HTTPS    │
                 │  (Fetch API)   │
                 │  Bearer Token  │
                 └───────┬────────┘
                         │
┌────────────────────────┼──────────────────────────────────────────┐
│                    API LAYER (Express)                            │
│  ┌─────────────────────v─────────────────────────────────────┐   │
│  │              Express Application                          │   │
│  │                                                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │              Global Middleware                     │  │   │
│  │  │  - CORS                                           │  │   │
│  │  │  - JSON Parser                                    │  │   │
│  │  │  - Optional Auth Middleware                       │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────────┐ │   │
│  │  │            Route Handlers                           │ │   │
│  │  │                                                      │ │   │
│  │  │  POST /api/auth/register       ──────────────┐      │ │   │
│  │  │  POST /api/auth/login          ──────────────┤      │ │   │
│  │  │  GET  /api/auth/profile  (auth)──────────────┤      │ │   │
│  │  │                                               │      │ │   │
│  │  │  POST /api/chat                ──────────────┤      │ │   │
│  │  │                                               │      │ │   │
│  │  │  POST /api/queue/join    (auth)──────────────┤      │ │   │
│  │  │  POST /api/queue/leave   (auth)──────────────┤      │ │   │
│  │  │  GET  /api/queue/position (auth)─────────────┤      │ │   │
│  │  │                                               │      │ │   │
│  │  │  POST /api/callbacks/schedule (auth)──────────┤      │ │   │
│  │  │                                               │      │ │   │
│  │  │  POST /api/consultations/qr   (auth)─────────┤      │ │   │
│  │  │                                               │      │ │   │
│  │  │  GET  /api/health               ──────────────┤      │ │   │
│  │  │                                               │      │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  │                                      │                 │   │
│  └──────────────────────────────────────┼─────────────────┘   │
│                                         │                      │
└─────────────────────────────────────────┼──────────────────────┘
                                          │
                 ┌────────────────────────v────────────────────┐
                 │      Controllers (Business Logic)           │
                 │                                             │
                 │  ┌─────────────────────────────────────┐   │
                 │  │ authController.js                   │   │
                 │  │  - register()                       │   │
                 │  │  - login()                          │   │
                 │  │  - getProfile()                     │   │
                 │  └─────────────────────────────────────┘   │
                 │                                             │
                 │  ┌─────────────────────────────────────┐   │
                 │  │ chatbotController.js                │   │
                 │  │  - chatWithAI()                     │   │
                 │  │  - handleQueueAction()              │   │
                 │  │  - handleCallbackRequest()          │   │
                 │  │  - requestConsultationQR()          │   │
                 │  └─────────────────────────────────────┘   │
                 │                                             │
                 └────────────────┬────────────────────────────┘
                                  │
                 ┌────────────────v────────────────────┐
                 │   Services (Data & AI Operations)   │
                 │                                     │
                 │  ┌───────────────────────────────┐ │
                 │  │ intentEngine.js               │ │
                 │  │  - classifyIntent()           │ │
                 │  │  - getFlowStep()              │ │
                 │  │  - mapSelection()             │ │
                 │  │  - getAssistanceDetails()     │ │
                 │  └───────────────────────────────┘ │
                 │                                     │
                 │  ┌───────────────────────────────┐ │
                 │  │ enquiryService.js             │ │
                 │  │  - createEnquiry()            │ │
                 │  │  - getEnquiryHistory()        │ │
                 │  │  - updateEnquiryStatus()      │ │
                 │  └───────────────────────────────┘ │
                 │                                     │
                 │  ┌───────────────────────────────┐ │
                 │  │ queueService.js               │ │
                 │  │  - joinQueue()                │ │
                 │  │  - getQueuePosition()         │ │
                 │  │  - leaveQueue()               │ │
                 │  │  - scheduleCallback()         │ │
                 │  │  - getCallbackTimeSlots()     │ │
                 │  └───────────────────────────────┘ │
                 │                                     │
                 │  ┌───────────────────────────────┐ │
                 │  │ consultationService.js        │ │
                 │  │  - generateConsultationQR()   │ │
                 │  │  - getAvailableBranches()     │ │
                 │  │  - submitConsultationFeedback()
                 │  └───────────────────────────────┘ │
                 │                                     │
                 └────────────┬────────────────────────┘
                              │
                 ┌────────────v────────────────────┐
                 │  Middleware & Utils             │
                 │                                 │
                 │  ┌───────────────────────────┐ │
                 │  │ authMiddleware.js         │ │
                 │  │  - authMiddleware()       │ │
                 │  │  - optionalAuthMiddleware()
                 │  └───────────────────────────┘ │
                 │                                 │
                 │  ┌───────────────────────────┐ │
                 │  │ jwtUtils.js               │ │
                 │  │  - generateToken()        │ │
                 │  │  - verifyToken()          │ │
                 │  └───────────────────────────┘ │
                 │                                 │
                 └────────────┬────────────────────┘
                              │
┌─────────────────────────────v────────────────────────────────────┐
│                    DATA & EXTERNAL SERVICES                       │
│                                                                   │
│  ┌──────────────────────┐  ┌──────────────────────┐              │
│  │  Supabase / PostgreSQL                         │              │
│  │  - users table                                 │              │
│  │  - enquiries table                             │              │
│  │  - queue_entries table                         │              │
│  │  - callbacks table                             │              │
│  │  - consultations table                         │              │
│  │  - Indexes & Foreign Keys                      │              │
│  └──────────────────────┘  └──────────────────────┘              │
│                                                                   │
│  ┌──────────────────────────────────────────────┐                │
│  │  Google Gemini AI                            │                │
│  │  - Intent Classification                     │                │
│  │  - Natural Language Understanding            │                │
│  │  - Fallback Responses                        │                │
│  └──────────────────────────────────────────────┘                │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Authentication Flow
```
User Login
    │
    v
┌──────────────────────┐
│ POST /api/auth/login │
└──────────────────────┘
    │
    ├─> authController.login()
    │   ├─> Fetch user from DB
    │   ├─> Verify password
    │   └─> Generate JWT token
    │
    v
┌──────────────────────┐
│ Return token + user  │
└──────────────────────┘
    │
    v
Frontend stores token in localStorage
    │
    v
All subsequent requests include:
Authorization: Bearer <token>
    │
    v
authMiddleware verifies token
    │
    v
Request processed with user context
```

### 2. Chatbot Intent Flow
```
User Message
    │
    v
┌──────────────────────┐
│  POST /api/chat      │
└──────────────────────┘
    │
    v
┌──────────────────────────────────┐
│ classifyIntent(userMessage)      │
│ (Gemini AI)                      │
└──────────────────────────────────┘
    │
    v
Detect:
├─ Category (Card Services, Account & Banking, etc.)
├─ Subcategory (specific issue)
└─ Confidence score
    │
    v
┌──────────────────────────────────┐
│ getFlowStep(category, subcat)    │
└──────────────────────────────────┘
    │
    v
Return structured response:
├─ Bot message
├─ Next action (tutorial, consultation, queue)
├─ Quick reply options
└─ Flow state update
```

### 3. Queue Management Flow
```
User clicks "Join Queue"
    │
    v
POST /api/queue/join (requires auth)
    │
    v
┌──────────────────────────────────┐
│ joinQueue(userId, enquiryId)     │
└──────────────────────────────────┘
    │
    v
├─ Check if already in queue
├─ Get current queue length
├─ Calculate position & wait time
└─ Insert queue entry
    │
    v
Return to user:
├─ Position: #N
├─ Estimated wait: M minutes
└─ Option to leave/schedule callback
    │
    v
User leaves queue or waits...
```

## Technology Stack Details

### Backend
```
Node.js (v16+)
├─ Express.js (REST API)
├─ jsonwebtoken (JWT auth)
├─ @supabase/supabase-js (Database)
├─ @google/generative-ai (Gemini API)
├─ cors (Cross-origin requests)
└─ dotenv (Environment config)
```

### Frontend
```
HTML5 + CSS3 + JavaScript (ES6+)
├─ Vanilla JavaScript (no frameworks)
├─ Fetch API (HTTP requests)
├─ LocalStorage (State persistence)
├─ CSS Grid & Flexbox (Responsive layout)
└─ Modal UI patterns
```

### Database
```
Supabase (PostgreSQL)
├─ Users table (authentication)
├─ Enquiries (inquiry tracking)
├─ Queue entries (queue management)
├─ Callbacks (callback scheduling)
├─ Consultations (branch consultations)
└─ Indexes (performance optimization)
```

### External APIs
```
Google Gemini API
├─ Intent classification
├─ Natural language processing
└─ Confidence scoring

Supabase API
├─ REST endpoints
├─ Real-time subscriptions
└─ Authentication
```

## Key Design Decisions

### 1. Vanilla JavaScript Frontend
**Why?** No build step required, easier deployment, smaller bundle
**Trade-off:** Less advanced state management than React/Vue

### 2. Gemini for Intent Only
**Why?** Cost-effective, good for classification, doesn't bypass security
**Trade-off:** Relies on structured flows after classification

### 3. JWT Tokens
**Why?** Stateless, scalable, standard for APIs
**Trade-off:** Token revocation requires additional mechanism

### 4. Supabase
**Why?** PostgreSQL + Auth + Real-time + Free tier
**Trade-off:** Vendor lock-in, but fully managed

### 5. Structured Flows Over Freeform AI
**Why?** Predictable UX, better security, measurable success
**Trade-off:** Less flexible for edge cases

## Scalability Considerations

### Current Limits
- Single Node.js instance: ~1,000 concurrent connections
- Supabase free tier: 500,000 queries/month
- No caching layer

### Scaling Path
1. **Phase 1 (1K-10K users)**: Current architecture + monitoring
2. **Phase 2 (10K-100K users)**: Add Redis caching, load balancer
3. **Phase 3 (100K+ users)**: Database replicas, microservices, CDN

## Security Architecture

### Authentication
```
User credentials
    │
    v
JWT token (HS256 algorithm)
    │
    v
Stored in localStorage
    │
    v
Sent in Authorization: Bearer header
    │
    v
Verified by authMiddleware on each request
    │
    v
Attaches user context to request
```

### Protected Data
```
SQL queries filtered by user_id
    │
    v
RLS (Row Level Security) policies in Supabase
    │
    v
API responses only contain user's data
    │
    v
Sensitive operations require auth
```

## Performance Architecture

### Current Optimizations
- Database indexes on frequently queried fields
- Middleware for fast routing
- Minimal API response payloads
- Client-side state caching

### Future Optimizations
- Redis for session/data caching
- CDN for static assets
- Database query result caching
- API response compression (gzip)
- Lazy loading for chat history

## Error Handling Architecture

```
Error occurs at any layer
    │
    v
┌─────────────────────────────┐
│ Error caught & logged       │
└─────────────────────────────┘
    │
    v
    ├─ Client error (4xx)?
    │  └─> Return user-friendly message
    │
    ├─ Server error (5xx)?
    │  ├─> Log error details
    │  └─> Return generic error + support info
    │
    └─ Validation error?
       └─> Return specific field errors
    │
    v
Frontend shows notification
    │
    v
User can retry or escalate
```

## Deployment Architecture

### Development
```
Local machine
├─ Backend: localhost:3000 (npm start)
├─ Frontend: localhost:8080 (http-server)
└─ Database: Supabase cloud
```

### Production
```
Option 1: Heroku
├─ Backend: Heroku dyno
├─ Frontend: Vercel/Netlify CDN
└─ Database: Supabase

Option 2: AWS
├─ Backend: EC2 + ELB
├─ Frontend: S3 + CloudFront
└─ Database: Supabase

Option 3: Docker
├─ Backend: Docker container
├─ Frontend: Static file server
└─ Database: Supabase
```

## Conclusion

The OCBC SmartHelp Portal is built with:
- **Simplicity**: Vanilla JS, no complex frameworks
- **Security**: JWT auth, protected endpoints
- **Scalability**: Database indexing, stateless design
- **Reliability**: Error handling, fallback mechanisms
- **Maintainability**: Clear separation of concerns

This architecture supports MVP requirements while providing a solid foundation for future enhancements and scaling.
