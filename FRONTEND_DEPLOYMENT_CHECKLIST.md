# Frontend Build & Deployment Verification Checklist

## Pre-Deployment Checklist

### Environment Configuration
- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Update `VITE_API_URL` to backend deployment URL
- [ ] Update `VITE_ML_API_URL` to ML API deployment URL
- [ ] Set `NODE_ENV=production`
- [ ] Verify all environment variables are set

### Code Quality
- [ ] Remove all `console.log()` statements (or use log level filtering)
- [ ] Remove all `debugger` statements
- [ ] Fix any TypeScript/JavaScript errors from build
- [ ] Verify no unused imports
- [ ] Check for hardcoded localhost URLs

### Build Verification
```bash
cd frontend
npm run build
```
- [ ] Build completes without errors
- [ ] No critical warnings in build output
- [ ] dist/ folder is generated correctly
- [ ] Bundle size is reasonable (<2MB gzipped preferred)

### Testing Before Deployment
```bash
# Preview production build locally
npm run preview
```
- [ ] Frontend loads without errors
- [ ] Can connect to backend API
- [ ] Can connect to ML API
- [ ] Real-time WebSocket connection works
- [ ] PDF export functionality works
- [ ] All UI components render correctly
- [ ] Responsive design works on mobile/tablet/desktop

## Deployment Steps

### For Vercel
```bash
vercel deploy --prod
```
- [ ] Deployment URL created
- [ ] Environment variables configured in Vercel dashboard
- [ ] Build succeeds on Vercel
- [ ] All functions working in production

### For Render
1. [ ] Create Render account and connect GitHub
2. [ ] Create Web Service from GitHub repository
3. [ ] Set environment variables in Render dashboard
4. [ ] Configure build command: `npm install && npm run build`
5. [ ] Configure start command: `npm run preview`
6. [ ] Deploy and monitor logs
7. [ ] Verify deployment URL working

### For Netlify
1. [ ] Connect GitHub repository to Netlify
2. [ ] Set build command: `npm run build`
3. [ ] Set publish directory: `dist`
4. [ ] Configure environment variables
5. [ ] Deploy and monitor
6. [ ] Set up automatic deployments from main branch

## Post-Deployment Verification

### Health Checks
```bash
# Check Frontend
curl https://your-frontend-url/

# Check Backend Health
curl https://satellite-change-detection-system-1.onrender.com/health

# Check ML API Health
curl https://satellite-change-detection-system.onrender.com/health
```
- [ ] Frontend responds with HTML
- [ ] Backend /health returns 200 OK
- [ ] ML API /health returns 200 OK

### Feature Testing
- [ ] Page loads without CORS errors
- [ ] Console has no JavaScript errors
- [ ] Can analyze a region
- [ ] Can perform temporal comparison
- [ ] Can export PDF
- [ ] WebSocket real-time updates work
- [ ] Email alerts send (if configured)

### Performance Monitoring
- [ ] Lighthouse score: >80 (Performance)
- [ ] First Contentful Paint: <3s
- [ ] Time to Interactive: <5s
- [ ] Bundle size optimized (check Network tab)
- [ ] No 4xx/5xx errors in logs

### API Integration Testing
```javascript
// Test backend connectivity
fetch('https://satellite-change-detection-system-1.onrender.com/health')
  .then(r => r.json())
  .then(data => console.log('Backend OK:', data))

// Test ML connectivity
fetch('https://satellite-change-detection-system.onrender.com/health')
  .then(r => r.json())
  .then(data => console.log('ML OK:', data))
```
- [ ] Both APIs accessible from frontend
- [ ] No CORS errors
- [ ] Responses are valid JSON

### Logging & Monitoring
- [ ] Vercel/Render/Netlify dashboard shows successful deployment
- [ ] No critical errors in deployment logs
- [ ] Monitor Google Analytics (if configured)
- [ ] Monitor error tracking (if Sentry configured)

## Troubleshooting

### CORS Errors
- [ ] Verify backend `.env.production` has correct `CORS_ORIGIN`
- [ ] Verify ML API CORS configuration
- [ ] Check browser console for exact error message
- [ ] Temporary solution: Use CORS proxy for testing

### API Connection Errors
- [ ] Verify `VITE_API_URL` points to correct backend
- [ ] Verify `VITE_ML_API_URL` points to correct ML API
- [ ] Check that backend/ML services are running
- [ ] Verify network connectivity in browser DevTools

### WebSocket Connection Issues
- [ ] Check that backend initializes Socket.io correctly
- [ ] Verify WebSocket not blocked by network/firewall
- [ ] Check browser console for connection errors
- [ ] Verify `initializeWebSocket()` called in server.js

### Build Size Issues
- [ ] Run `npm run build -- --debug` for detailed info
- [ ] Analyze bundle with: `npm install -g vite-bundle-visualizer`
- [ ] Remove unused dependencies
- [ ] Enable code splitting for large imports

## Production Best Practices

### Security
- [ ] No sensitive keys in `.env.production` file
- [ ] HTTPS enabled (automatically on Vercel/Render/Netlify)
- [ ] CSP headers configured
- [ ] Input validation on all forms
- [ ] XSS protection enabled

### Performance
- [ ] Images optimized and lazy-loaded
- [ ] Code splitting for routes
- [ ] CDN caching configured
- [ ] Gzip compression enabled
- [ ] Service worker caching (optional)

### Monitoring
- [ ] Error tracking (Sentry/Rollbar) configured
- [ ] Analytics enabled
- [ ] Uptime monitoring set up
- [ ] Log aggregation configured
- [ ] Performance monitoring active

### Documentation
- [ ] Keep deployment URLs documented
- [ ] Document environment variables
- [ ] Document deployment procedure
- [ ] Keep changelog updated
- [ ] Document backend/ML API contracts

## Rollback Procedure

### If Deployment Has Issues
1. Check error logs in Vercel/Render/Netlify
2. Identify the issue (API, build, configuration)
3. Revert to previous Git commit if code issue
4. Re-deploy previous version immediately
5. Fix issue in development and test locally
6. Deploy fixed version

```bash
# If deployed via Vercel
vercel rollback

# If deployed via Render
# Use Render dashboard to redeploy previous version
```

## Success Indicators

✅ **Green Status Signals:**
- Frontend loads instantly
- All API calls complete <200ms
- No console errors (only info/warnings)
- Real-time updates work smoothly
- PDF exports generate correctly
- Mobile responsive layout works
- No 404/500 errors in logs

🟡 **Yellow Warning Signals:**
- Build takes >30 seconds
- Large bundle chunks (>500KB)
- Network requests >500ms
- Occasional CORS warnings
- Third-party scripts slow

🔴 **Red Alert Signals:**
- Frontend blank/white screen
- Cannot connect to backend/ML
- Repeated API 500 errors
- WebSocket connection refused
- Critical JavaScript errors
- Deployment failed

## Next Steps After Successful Deployment

1. Set up automated monitoring
2. Configure error alerting
3. Set up performance budgets
4. Enable CloudFlare (optional for extra CDN)
5. Set up CI/CD pipeline for auto-deployments
6. Configure staging environment
7. Set up database backups
8. Plan capacity scaling strategy
