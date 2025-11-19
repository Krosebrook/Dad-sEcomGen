# Testing Checklist for Refactored Application

## Build & Deployment Tests

- [x] `npm run build` completes without errors
- [x] All imports resolve correctly
- [x] No TypeScript compilation errors
- [x] Bundle sizes are reasonable
- [x] Source maps are generated

## Environment Configuration Tests

### With Valid Configuration
1. Set all environment variables correctly in `.env`
2. Start the development server
3. **Expected**: App loads successfully, no configuration errors

### With Missing Supabase URL
1. Remove or comment out `VITE_SUPABASE_URL` from `.env`
2. Start the development server
3. **Expected**: Configuration error screen with helpful instructions

### With Missing Supabase Key
1. Remove or comment out `VITE_SUPABASE_ANON_KEY` from `.env`
2. Start the development server
3. **Expected**: Configuration error screen with helpful instructions

### With Missing Gemini Key
1. Remove or comment out `VITE_GEMINI_API_KEY` from `.env`
2. Start the development server
3. **Expected**: App loads with warning in console, AI features disabled

### With Placeholder Gemini Key
1. Set `VITE_GEMINI_API_KEY=your-gemini-api-key-here`
2. Start the development server
3. **Expected**: App loads with warning in console about placeholder value

## Application Loading Tests

### Normal Load (Production-like)
1. Clear browser cache and localStorage
2. Load application in production build
3. **Expected**:
   - Splash screen appears
   - Animates smoothly
   - App renders after splash
   - All UI elements visible

### Development Load
1. Start development server (`npm run dev`)
2. Load application
3. **Expected**:
   - No splash screen (skipped in dev mode)
   - App renders immediately
   - Hot reload works

### Subsequent Loads
1. Load app once (splash shown)
2. Reload page
3. **Expected**:
   - Splash screen skipped (session storage works)
   - App loads directly

## Error Handling Tests

### Component Error Simulation
1. Temporarily break a component (e.g., throw new Error())
2. Navigate to that component
3. **Expected**:
   - Error boundary catches error
   - Error screen shows with helpful message
   - "Return to Home" button works
   - "Reload Page" button works
   - In dev mode, error details are visible

### Network Failure Simulation
1. Disconnect network
2. Try to load app
3. **Expected**:
   - App still renders (offline capable)
   - Offline banner appears
   - Local features work
   - Network-dependent features show graceful errors

### LocalStorage Unavailable
1. Test in incognito/private browsing with storage blocked
2. Load application
3. **Expected**:
   - App loads successfully
   - Default theme applied
   - Warnings in console (non-fatal)
   - Core functionality works

## Context Provider Tests

### Theme Context
1. Toggle theme (light/dark)
2. **Expected**:
   - Theme changes immediately
   - Preference saved to localStorage
   - Persists across reloads

### Auth Context
1. Sign up with new account
2. Sign out
3. Sign in again
4. **Expected**:
   - All operations complete successfully
   - User state updates correctly
   - Profile created in database

### Viewport Context
1. Resize browser window
2. Rotate device (mobile)
3. **Expected**:
   - Layout adapts responsively
   - Viewport info updates correctly
   - No performance issues

## Feature Tests

### Venture Creation
1. Enter product idea
2. Generate plan
3. Save venture
4. **Expected**:
   - Plan generates successfully
   - Venture saves to database (if logged in) or localStorage
   - "My Ventures" shows new venture

### Venture Loading
1. Create multiple ventures
2. Open "My Ventures"
3. Load a saved venture
4. **Expected**:
   - All ventures displayed
   - Selected venture loads correctly
   - All data intact

### Venture Management
1. Create venture
2. Rename venture
3. Delete venture
4. **Expected**:
   - All operations succeed
   - UI updates immediately
   - Changes persist

## Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

Each should:
- Load without errors
- Display correctly
- All features work
- No console errors

## Performance Tests

1. Initial load time < 3 seconds (on fast connection)
2. Time to Interactive < 5 seconds
3. Smooth animations (60fps)
4. No memory leaks (use browser dev tools)
5. Responsive input (< 100ms delay)

## Accessibility Tests

1. Keyboard navigation works
2. Screen reader compatible
3. Sufficient color contrast
4. Focus indicators visible
5. ARIA labels present

## Console Log Verification

During normal app initialization, console should show:
```
AppWrapper: Starting initialization...
Environment Validation
  Supabase URL: ✓ Configured
  Supabase Key: ✓ Configured
  Gemini API Key: ✓ Configured (or ⚠ Missing)
AppWrapper: Service worker registered
AppWrapper: Splash skipped, app ready (in dev mode)
ThemeProvider: Initializing...
ThemeProvider: Applying theme variant: minimalist mode: light
ThemeProvider: Ready
AuthProvider: Initializing...
AuthProvider: Getting session...
AuthProvider: Session retrieved: ...
```

No errors should appear during normal initialization.

## Known Issues to Monitor

1. If sessionStorage is disabled, splash screen may show every time (minor)
2. If localStorage is disabled, preferences won't persist (minor)
3. Without Gemini API key, AI features won't work (expected)
4. Service worker may fail in development (non-critical)

## Success Criteria

The application refactoring is successful if:

1. ✓ No white screens under normal conditions
2. ✓ Clear error messages for configuration issues
3. ✓ App works with minimal configuration
4. ✓ Graceful degradation when features unavailable
5. ✓ Build process completes without errors
6. ✓ All core features functional
7. ✓ Good developer experience with helpful logging
8. ✓ Proper error boundaries prevent cascading failures

## Regression Testing

After any future changes, verify:
- App still loads without white screen
- Environment validation still works
- Error boundaries still catch errors
- Build still completes successfully
- All imports still resolve
