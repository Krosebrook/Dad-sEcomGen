# Setup Instructions

## Issue Fixed

The blank screen issue was caused by a missing Google Gemini API key configuration.

## What Was Changed

1. **Added Gemini API key to .env file**: Added `VITE_GEMINI_API_KEY` environment variable
2. **Updated geminiService.ts**: Changed from `process.env.API_KEY` to `import.meta.env.VITE_GEMINI_API_KEY`
3. **Added error handling**: The app now gracefully handles missing API keys with helpful error messages
4. **Improved error messages**: Users will see clear instructions when the API key is not configured

## How to Get Started

### Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy your API key

### Step 2: Add Your API Key

1. Open the `.env` file in the project root
2. Replace `your-gemini-api-key-here` with your actual API key:
   ```
   VITE_GEMINI_API_KEY=your-actual-api-key-here
   ```

### Step 3: Start the Development Server

The dev server should already be running. If you need to restart it:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## What the App Does

This is an AI-powered E-commerce Plan Generator that helps you:

- Generate product ideas and S.M.A.R.T. goals
- Create detailed product blueprints
- Analyze market competition
- Build marketing strategies
- Plan financial projections
- Develop launch strategies

## Features

- Product idea generation with AI
- Customer persona development
- Brand identity creation
- Marketing campaign planning
- Financial projections
- SEO strategy
- Social media calendar
- Email marketing funnels
- And much more!

## Next Steps

Once you've added your API key and the app is running:

1. Enter a product idea in the input field
2. Choose your brand voice
3. Click "Generate Plan & Goals"
4. Follow the step-by-step wizard to build your complete e-commerce plan

## Important Notes

- The Gemini API has usage limits on the free tier
- Your API key should be kept private and never committed to version control
- The `.env` file is already in `.gitignore` to prevent accidental commits

## Troubleshooting

If you still see a blank screen:

1. Check the browser console (F12) for any error messages
2. Verify your API key is correct in the `.env` file
3. Restart the dev server
4. Clear your browser cache and reload

If you see "API key not configured" errors:

1. Double-check your `.env` file has the correct variable name: `VITE_GEMINI_API_KEY`
2. Make sure there are no spaces around the `=` sign
3. Restart the dev server after changing the `.env` file
