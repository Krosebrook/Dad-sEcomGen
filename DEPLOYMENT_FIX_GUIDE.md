# Deployment Guide

## Issue: White Screen on Netlify

This guide documents the fix for the white screen issue when deploying to Netlify.

### Root Causes

1. **Tailwind CSS CDN Dependency**: The app was loading Tailwind CSS from a CDN (`https://cdn.tailwindcss.com`), which could be blocked or fail to load in production.
2. **Missing Environment Variables**: The app threw errors when Supabase environment variables were not configured, preventing the app from initializing.

### Solution

#### 1. Bundle Tailwind CSS

Instead of loading Tailwind from a CDN, we now bundle it as a proper dependency:

```bash
npm install -D tailwindcss@^3 postcss autoprefixer
```

Created configuration files:
- `tailwind.config.js` - Tailwind configuration with custom animations
- `postcss.config.js` - PostCSS configuration
- `index.css` - Import Tailwind directives

Updated `index.tsx` to import `index.css`.

Updated `index.html` to remove:
- `<script src="https://cdn.tailwindcss.com"></script>`
- Inline Tailwind configuration script
- CDN preconnect links

#### 2. Graceful Degradation for Missing Environment Variables

Updated the following files to handle missing environment variables gracefully:

**`lib/supabase.ts`:**
- Changed from throwing an error to logging a warning
- Returns `null` when env vars are missing
- App runs in "demo mode" without database features

**`contexts/AuthContext.tsx`:**
- Check if Supabase is available before initialization
- Return early if not configured
- Auth methods return error messages instead of crashing

**`lib/safeSupabase.ts`:**
- Updated export to not throw on module load
- Returns `null` safely when env vars are missing

### Deployment to Netlify

#### Environment Variables Setup

In your Netlify dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add the following variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

#### Build Configuration

The `netlify.toml` is already configured:

```toml
[build]
command = "npx vite build"
publish = "dist"

[build.environment]
NODE_VERSION = "20"
```

#### Deploy Process

1. **Connect Repository**: Link your GitHub repository to Netlify
2. **Configure Build**:
   - Build command: `npx vite build` (or `npm run build`)
   - Publish directory: `dist`
   - Node version: 20
3. **Add Environment Variables**: Add the required environment variables
4. **Deploy**: Trigger a new deployment

### Testing Locally

To test the production build locally:

```bash
# Install dependencies
npm install

# Build the app
npm run build

# Preview the production build
npm run preview
```

Visit `http://localhost:4173` to test the production build.

### Demo Mode

The app can run without environment variables in "demo mode":
- A warning banner shows that some features are not configured
- The landing page and UI work correctly
- Authentication and data persistence are disabled
- AI features require the Gemini API key

### Verification Checklist

After deploying to Netlify:

- [ ] Site loads without white screen
- [ ] Landing page displays correctly
- [ ] Navigation works
- [ ] Configuration warning shows (if env vars not set)
- [ ] Forms and buttons are interactive
- [ ] Tailwind CSS styles are applied
- [ ] No console errors related to Tailwind
- [ ] Check Network tab for no failed CDN requests

### Troubleshooting

**White screen persists:**
1. Check browser console for errors
2. Verify `dist` folder is being deployed
3. Check that `index.html` loads
4. Verify no CDN resources are blocked

**Configuration warning shows:**
- This is expected if environment variables are not set
- Add environment variables in Netlify dashboard
- Redeploy the site

**Styles not loading:**
- Check that `index-*.css` file exists in `dist/assets/`
- Verify the CSS file is referenced in `dist/index.html`
- Clear browser cache

### Performance Notes

Bundle sizes after optimization:
- CSS: ~60 KB (9.5 KB gzipped)
- Total bundle: ~1.5 MB (~500 KB gzipped)

The bundled Tailwind CSS adds about 60 KB to the initial load, but ensures reliable styling in all environments.

### Security

Content Security Policy in `netlify.toml` has been updated to remove `cdn.tailwindcss.com` from the allowed sources.

### Support

For issues, check:
1. Browser console for JavaScript errors
2. Network tab for failed resource loads
3. Netlify deploy logs for build errors
4. Environment variables are correctly set in Netlify
