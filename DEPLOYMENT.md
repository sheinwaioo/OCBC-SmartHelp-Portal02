# OCBC SmartHelp - Deployment Guide

## Production Deployment Checklist

### Pre-Deployment Security Fixes

Before deploying to production, implement these critical security enhancements:

#### 1. Password Hashing
```javascript
// Install bcrypt
npm install bcrypt

// In authController.js, replace password handling:
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 10);

// During login:
const isPasswordValid = await bcrypt.compare(password, user.password);
```

#### 2. Environment Variables
- Never commit `.env` file
- Use platform-specific secrets management:
  - **Vercel/Heroku**: Add secrets in dashboard
  - **AWS**: Use AWS Secrets Manager
  - **Google Cloud**: Use Secret Manager
  - **Docker**: Use Docker secrets

#### 3. HTTPS/TLS
- Install SSL certificate (Let's Encrypt for free)
- Redirect HTTP to HTTPS
- Set HSTS header
- Update CORS to allow only your domain

```javascript
// Add to app.js
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
});
```

#### 4. Rate Limiting
```javascript
// Install express-rate-limit
npm install express-rate-limit

import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5 // 5 attempts
});

app.post('/api/auth/login', authLimiter, login);
app.post('/api/auth/register', authLimiter, register);
```

#### 5. CORS Configuration
```javascript
// In app.js
const allowedOrigins = [
  'https://your-domain.com',
  'https://www.your-domain.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));
```

### Deployment Options

## Option 1: Heroku Deployment

### Backend Deployment
1. Install Heroku CLI
2. Create new app:
   ```bash
   heroku create your-ocbc-api
   ```

3. Add environment variables:
   ```bash
   heroku config:set SUPABASE_URL=your_url
   heroku config:set SUPABASE_SERVICE_KEY=your_key
   heroku config:set GEMINI_API_KEY=your_key
   heroku config:set JWT_SECRET=your_secret
   ```

4. Deploy:
   ```bash
   git push heroku main
   ```

5. Monitor:
   ```bash
   heroku logs --tail
   ```

### Frontend Deployment
Deploy static files to Netlify or Vercel:

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --dir=front-end --prod
```

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

## Option 2: Docker Deployment

### Create Dockerfile
```dockerfile
# Dockerfile for backend
FROM node:16-alpine

WORKDIR /app

COPY back-end/package*.json ./
RUN npm ci --only=production

COPY back-end/ .

EXPOSE 3000

CMD ["npm", "start"]
```

### Build and Run
```bash
docker build -t ocbc-smarthelp-api .
docker run -p 3000:3000 \
  -e SUPABASE_URL=$SUPABASE_URL \
  -e SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY \
  -e GEMINI_API_KEY=$GEMINI_API_KEY \
  -e JWT_SECRET=$JWT_SECRET \
  ocbc-smarthelp-api
```

## Option 3: AWS Deployment

### Backend on EC2
1. Launch EC2 instance (t2.micro for free tier)
2. Install Node.js and npm
3. Clone repository
4. Install dependencies
5. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start back-end/server.js
   pm2 startup
   pm2 save
   ```

### Frontend on S3 + CloudFront
1. Build static files
2. Upload to S3 bucket
3. Create CloudFront distribution
4. Point domain via Route 53

## Option 4: Google Cloud Run

### Deploy Backend
```bash
# Create app.yaml
gcloud run deploy ocbc-smarthelp-api \
  --source . \
  --region us-central1 \
  --set-env-vars SUPABASE_URL=$SUPABASE_URL,\
    SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY,\
    GEMINI_API_KEY=$GEMINI_API_KEY,\
    JWT_SECRET=$JWT_SECRET
```

### Deploy Frontend
```bash
gcloud app deploy front-end/app.yaml
```

## Monitoring & Maintenance

### 1. Error Tracking
Install Sentry:
```bash
npm install @sentry/node @sentry/tracing

// Add to server.js
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### 2. Performance Monitoring
Use New Relic:
```bash
npm install newrelic
# Add require('newrelic'); at top of server.js
```

### 3. Database Backups
- Supabase: Automatic daily backups (included)
- Enable Point-in-Time Recovery (PITR)
- Set up alerts for backup failures

### 4. Logging
Use structured logging with Winston:
```bash
npm install winston

import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 5. Health Checks
Configure automated health checks:
```javascript
// Already implemented at GET /api/health
// Set up monitoring service to ping every 5 minutes
```

## Performance Optimization

### 1. Caching
```javascript
// Redis caching for frequently accessed data
npm install redis

import redis from 'redis';
const redisClient = redis.createClient();

// Cache user profiles
app.get('/api/auth/profile', async (req, res) => {
  const cacheKey = `user:${req.user.userId}`;
  const cached = await redisClient.get(cacheKey);
  
  if (cached) return res.json(JSON.parse(cached));
  
  // Fetch from DB
  const user = await fetchUser(req.user.userId);
  
  // Cache for 1 hour
  await redisClient.setEx(cacheKey, 3600, JSON.stringify(user));
  res.json(user);
});
```

### 2. Database Query Optimization
- Use query results caching
- Implement pagination for large result sets
- Add database query monitoring

### 3. Frontend Optimization
- Minify CSS and JavaScript
- Enable Gzip compression
- Use CDN for static assets
- Implement lazy loading for images

### 4. API Response Caching
```javascript
// Browser caching headers
app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=3600');
  }
  next();
});
```

## Scaling Considerations

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Upgrade database tier
- Increase concurrent connections limit

### Horizontal Scaling
- Load balancing (Nginx, HAProxy)
- Multiple backend instances
- Database read replicas
- Queue service (Bull, RabbitMQ)

### Recommendations for Future Growth
1. Add caching layer (Redis)
2. Implement job queues for async operations
3. Separate read/write database instances
4. Use CDN for static assets
5. Implement API rate limiting per user

## Disaster Recovery

### Backup Strategy
```bash
# Daily Supabase backups (automatic)
# Weekly full database dumps
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Store in S3
aws s3 cp backup_*.sql s3://your-backup-bucket/
```

### Recovery Plan
1. Restore database from latest backup
2. Redeploy backend service
3. Verify data integrity
4. Test all critical flows
5. Notify users if necessary

## Post-Deployment Checklist

- [ ] Security audit completed
- [ ] All environment variables set correctly
- [ ] SSL/TLS certificate installed
- [ ] Database backed up
- [ ] Monitoring services active
- [ ] Error tracking configured
- [ ] Performance baseline established
- [ ] Load testing completed
- [ ] User acceptance testing passed
- [ ] Documentation updated
- [ ] Support team trained
- [ ] Runbooks created

## Rollback Plan

If issues arise:

1. **Quick Rollback** (< 5 minutes):
   - Heroku: `heroku rollback`
   - Vercel: Redeploy previous version
   - Docker: Deploy previous image

2. **Database Rollback**:
   - Restore from backup
   - Point to previous API version
   - Clear cached data

3. **Communication**:
   - Update status page
   - Notify stakeholders
   - Document incident

## Support & Escalation

### Escalation Matrix
- **Level 1**: Frontend issues → Check browser console, clear cache
- **Level 2**: Backend down → Check server logs, restart service
- **Level 3**: Database issues → Contact Supabase support
- **Level 4**: Infrastructure issues → Contact hosting provider

### Contacts
- Supabase Support: support@supabase.com
- Gemini API Issues: Google Cloud Support
- Hosting Platform Support: See documentation

---

**Deployment Guide Complete!**

For detailed information, refer to:
- README.md - Full project documentation
- QUICKSTART.md - Quick setup guide
- IMPLEMENTATION_SUMMARY.md - Feature overview
