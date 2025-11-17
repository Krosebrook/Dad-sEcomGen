# Production Deployment Guide

## Prerequisites

1. **Node.js** v20 or higher
2. **Supabase Account** with a configured project
3. **Google Gemini API Key**
4. **Netlify Account** (or other hosting platform)

## Environment Setup

### 1. Configure Environment Variables

Copy `.env.example` to `.env.production`:

```bash
cp .env.example .env.production
```

Update with your production values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_GEMINI_API_KEY=your-production-gemini-key
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
```

### 2. Database Setup

The application uses Supabase for database management. All migrations are in `/supabase/migrations/`.

**Production Checklist:**
- ✅ All migrations applied
- ✅ RLS policies enabled on all tables
- ✅ Database indexes created
- ✅ Backup strategy configured
- ✅ Connection pooling enabled

### 3. Build for Production

```bash
# Install dependencies
npm ci --production=false

# Run production build
npm run build

# Test the build locally
npm run preview
```

The production build will:
- Minify all JavaScript and CSS
- Remove console.log statements
- Split code into optimized chunks
- Generate sourcemaps (optional)
- Optimize assets

## Deployment Options

### Option 1: Netlify (Recommended)

1. Connect your repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables in Netlify dashboard
4. Deploy!

The `netlify.toml` file is pre-configured with:
- Security headers
- Caching strategies
- SPA routing
- Build optimization

### Option 2: Vercel

```bash
npm install -g vercel
vercel --prod
```

### Option 3: Custom Server

Build the app and serve the `dist` folder with any static file server:

```bash
npm run build
npx serve dist -p 80
```

## Security Checklist

- [x] Environment variables secured (not in source code)
- [x] HTTPS enabled
- [x] Security headers configured
- [x] CSP (Content Security Policy) enabled
- [x] XSS protection enabled
- [x] CORS properly configured
- [x] Rate limiting implemented
- [x] Input validation and sanitization
- [x] SQL injection protection (via Supabase RLS)
- [x] Authentication session management

## Performance Optimizations

### Applied Optimizations:

1. **Code Splitting**
   - React vendor bundle
   - Supabase vendor bundle
   - Gemini AI vendor bundle
   - PDF generation vendor bundle

2. **Caching Strategy**
   - Static assets: 1 year cache
   - HTML: No cache
   - API responses: Session-based

3. **Build Optimizations**
   - Tree shaking enabled
   - Dead code elimination
   - Minification (Terser)
   - Gzip compression

4. **Database Optimizations**
   - Indexes on frequently queried columns
   - Composite indexes for complex queries
   - Automatic timestamp updates
   - Query optimization via RLS

## Monitoring and Logging

### Recommended Tools:

1. **Error Tracking**: Sentry, LogRocket, or Bugsnag
2. **Analytics**: Google Analytics, Plausible, or Mixpanel
3. **Performance**: Lighthouse CI, WebPageTest
4. **Uptime**: UptimeRobot, Pingdom

### Built-in Error Boundary

The app includes a production-ready error boundary that:
- Catches and logs all React errors
- Displays user-friendly error messages
- Provides recovery options
- Logs errors to console (dev) or external service (prod)

## Post-Deployment Checklist

- [ ] Test all authentication flows
- [ ] Verify AI generation works
- [ ] Test venture creation and loading
- [ ] Check mobile responsiveness
- [ ] Verify all environment variables
- [ ] Test error handling
- [ ] Check loading states
- [ ] Verify rate limiting
- [ ] Test dark mode
- [ ] Check all export features
- [ ] Verify database queries
- [ ] Test edge cases

## Rollback Strategy

If issues occur in production:

1. **Immediate**: Revert to previous deployment via hosting platform
2. **Database**: Restore from latest backup
3. **Monitoring**: Check error logs and metrics
4. **Communication**: Notify users if needed

## Scaling Considerations

### Database

- Enable connection pooling in Supabase
- Monitor query performance
- Add indexes as needed
- Consider read replicas for high traffic

### API Rate Limits

Built-in rate limiting:
- Gemini API: 10 requests/minute per user
- Auth operations: 5 requests/5 minutes per user

Adjust in `lib/rateLimiter.ts` based on your API quotas.

### CDN

Consider adding Cloudflare or similar CDN for:
- DDoS protection
- Edge caching
- Geographic distribution
- Additional security layer

## Cost Optimization

### Supabase

- Use connection pooling
- Archive old ventures periodically
- Monitor database size
- Use proper indexes to reduce query costs

### Gemini API

- Implement request caching
- Use rate limiting
- Monitor usage via Google Cloud Console
- Consider upgrading for higher quotas

## Support and Maintenance

### Regular Maintenance

- Update dependencies monthly
- Review security advisories
- Monitor error rates
- Analyze user feedback
- Optimize slow queries
- Review and update documentation

### Backup Strategy

- Automated daily database backups (Supabase)
- Environment variable backups
- Code repository backups (Git)
- User data export functionality

## Troubleshooting

### Common Issues

**Issue**: White screen on deployment
- Check browser console for errors
- Verify environment variables
- Check build logs

**Issue**: API calls failing
- Verify API keys are correct
- Check CORS settings
- Verify Supabase RLS policies

**Issue**: Slow performance
- Check bundle size
- Review database query performance
- Enable caching
- Check CDN configuration

## Contact and Support

For production support:
- Check error logs in hosting platform
- Review Supabase logs
- Check Google Cloud Console for Gemini API issues

---

Last Updated: 2025-11-17
Version: 1.0.0
