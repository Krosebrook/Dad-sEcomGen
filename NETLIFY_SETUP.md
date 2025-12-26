# Netlify Deployment Setup

## Configure Environment Variables

Your published site needs these environment variables configured in Netlify:

### Step 1: Go to Netlify Dashboard
1. Log in to [Netlify](https://app.netlify.com)
2. Select your site
3. Go to **Site configuration** → **Environment variables**

### Step 2: Add These Variables

Click **Add a variable** and add each of these:

```
VITE_SUPABASE_URL
Value: (your Supabase project URL)

VITE_SUPABASE_ANON_KEY
Value: (your Supabase anonymous key)

VITE_GEMINI_API_KEY
Value: (your Google Gemini API key)
```

### Step 3: Redeploy Your Site

After adding the environment variables:

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the build to complete

**IMPORTANT**: Environment variables only apply to NEW builds. Your existing deployed version won't have them until you redeploy.

## Getting Your Keys

### Supabase Keys
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_ANON_KEY`

### Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the key → Use for `VITE_GEMINI_API_KEY`

## After Setup

Once configured and redeployed:
- The yellow warning banner will disappear
- All features will work properly
- Authentication will be enabled
- AI features will be functional
