# Implementation Notes - Production-Grade MVP

## Quick Start Guide

### For Developers

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Add your API keys
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## Key Integration Points

### 1. Theme System Integration

The theme system is automatically initialized through the `AppWrapper` component. All child components can access theme via the `useTheme` hook:

```tsx
import { useTheme } from './contexts/ThemeContext';

function MyComponent() {
  const { theme, variant, colorMode, animationConfig } = useTheme();
  // Use theme colors, check animation settings, etc.
}
```

### 2. Adding New Components with Animations

To add entrance animations to new components:

```tsx
import { AnimatedPage } from './components/animations/AnimatedPage';

function MyNewPage() {
  return (
    <AnimatedPage animation="fadeIn" delay={100}>
      <div data-animate>Content 1</div>
      <div data-animate>Content 2</div>
      {/* Add data-animate for stagger effect */}
    </AnimatedPage>
  );
}
```

### 3. Using the Avatar Guide

Integrate avatar guidance in any step:

```tsx
import { AvatarGuide } from './components/avatar/AvatarGuide';

const guideSteps = [
  {
    expression: 'welcoming',
    message: 'Welcome to this section!',
    duration: 3000
  },
  {
    expression: 'talking',
    message: 'Here\'s how it works...',
    duration: 4000
  }
];

<AvatarGuide
  steps={guideSteps}
  personality="friendly"
  onComplete={() => handleGuideComplete()}
/>
```

### 4. Responsive Layouts

Use the viewport hook for adaptive rendering:

```tsx
import { useViewport } from './contexts/ViewportContext';

function ResponsiveFeature() {
  const { breakpoint, isMobile, isTouchDevice } = useViewport();

  if (isMobile) return <MobileLayout />;
  if (breakpoint === 'tablet') return <TabletLayout />;
  return <DesktopLayout />;
}
```

---

## Database Operations

### Saving User Preferences

User preferences are automatically saved when using the theme context:

```tsx
const { setVariant, updateAnimationConfig } = useTheme();

// Automatically saves to database if user is authenticated
setVariant('cinematic');
updateAnimationConfig({ speed: 'fast' });
```

### Export Tracking

Exports are automatically tracked in the database:

```tsx
// In ExportManager component
await supabase.from('export_history').insert({
  user_id: user.id,
  venture_id: ventureId,
  export_type: 'storyboard',
  export_format: 'pdf',
  status: 'pending'
});
```

### Creating Venture Snapshots

```tsx
await supabase.from('venture_snapshots').insert({
  venture_id: ventureId,
  user_id: userId,
  snapshot_name: 'Before Launch',
  description: 'Final state before going live',
  snapshot_data: currentVentureData
});
```

---

## Customization Guide

### Changing Default Theme

Edit `contexts/ThemeContext.tsx`:

```tsx
const [variant, setVariantState] = useState<ThemeVariant>('minimalist'); // Change here
```

### Adding a New Theme Variant

1. Add to `lib/themes.ts`:

```tsx
export const themes: Record<ThemeVariant, Record<ColorMode, ThemeColors>> = {
  // ... existing themes
  myNewTheme: {
    light: {
      primary: '#your-color',
      // ... other colors
    },
    dark: {
      primary: '#your-dark-color',
      // ... other colors
    }
  }
};
```

2. Update the `ThemeVariant` type:

```tsx
export type ThemeVariant = 'minimalist' | 'cinematic' | 'futuristic' | 'myNewTheme';
```

3. Add to `components/ui/ThemeSelector.tsx`:

```tsx
const variants = [
  // ... existing variants
  { value: 'myNewTheme', label: 'My Theme', icon: '🎨' }
];
```

### Customizing Animation Speeds

Edit `lib/animations.ts`:

```tsx
const durations = {
  fast: 100,    // Make faster
  normal: 250,  // Adjust normal speed
  slow: 500,    // Adjust slow speed
};
```

### Adding New Avatar Personalities

Edit `components/avatar/Avatar.tsx`:

```tsx
const avatarStyles = {
  // ... existing personalities
  mentor: {
    color: '#16a34a',
    icon: '🧙',
    name: 'Morgan',
    greeting: 'Let me guide you with my wisdom...'
  }
};
```

---

## Performance Optimization Tips

### 1. Lazy Loading Components

For heavy components, use React lazy loading:

```tsx
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function MyPage() {
  return (
    <React.Suspense fallback={<LoadingSkeleton />}>
      <HeavyComponent />
    </React.Suspense>
  );
}
```

### 2. Animation Performance

Disable animations on low-end devices:

```tsx
useEffect(() => {
  const isLowEnd = navigator.hardwareConcurrency < 4;
  if (isLowEnd) {
    updateAnimationConfig({ reducedMotion: true });
  }
}, []);
```

### 3. Image Optimization

Use responsive images with srcset:

```tsx
<img
  src="/image-800.jpg"
  srcSet="/image-400.jpg 400w, /image-800.jpg 800w, /image-1600.jpg 1600w"
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1600px"
  alt="Description"
/>
```

---

## Accessibility Testing Checklist

- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Navigate entire app using only keyboard
- [ ] Verify focus indicators are visible
- [ ] Test with animations disabled
- [ ] Check color contrast ratios (use browser DevTools)
- [ ] Test at 200% zoom level
- [ ] Verify all interactive elements have ARIA labels
- [ ] Test with high contrast mode enabled

---

## Common Issues & Solutions

### Issue: Animations not playing

**Solution:** Check if reduced motion is enabled:
```tsx
const { animationConfig } = useTheme();
console.log(animationConfig); // Check reducedMotion value
```

### Issue: Theme not persisting

**Solution:** Ensure localStorage is available and not blocked:
```tsx
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
} catch (e) {
  console.error('LocalStorage unavailable:', e);
}
```

### Issue: Service Worker not updating

**Solution:** Unregister and re-register:
```tsx
import { unregisterServiceWorker } from './lib/pwa';

await unregisterServiceWorker();
window.location.reload();
```

### Issue: Export not saving to database

**Solution:** Check authentication and RLS policies:
```tsx
const { user } = useAuth();
if (!user) {
  console.error('User not authenticated');
  return;
}
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Run `npm run build` successfully
- [ ] Test production build with `npm run preview`
- [ ] Verify all environment variables are set
- [ ] Test on multiple devices and browsers
- [ ] Run accessibility audit
- [ ] Check bundle sizes are acceptable
- [ ] Verify PWA manifest is correct
- [ ] Test offline functionality

### Post-Deployment

- [ ] Verify theme switching works
- [ ] Test animations on various devices
- [ ] Check database connections
- [ ] Verify export functionality
- [ ] Test PWA installation
- [ ] Monitor performance metrics
- [ ] Check error logging
- [ ] Verify analytics tracking

---

## Browser Support

### Fully Supported:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari 14+
- Chrome Android 90+

### Graceful Degradation:
- Older browsers fall back to no animations
- Service worker not available: App still works
- LocalStorage blocked: Session-only preferences

---

## Analytics Integration

To add analytics tracking:

```tsx
// In components/analytics/AnalyticsProvider.tsx
import { supabase } from '../lib/supabase';

export function trackEvent(
  eventType: string,
  category: string,
  metadata?: any
) {
  if (!user) return;

  supabase.from('feature_analytics').insert({
    user_id: user.id,
    venture_id: currentVentureId,
    event_type: eventType,
    event_category: category,
    metadata,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    user_agent: navigator.userAgent
  });
}

// Usage
trackEvent('theme_changed', 'interaction', {
  from: 'minimalist',
  to: 'cinematic'
});
```

---

## Future Enhancement Ideas

### Phase 2 Features:
1. **Voice Control** - Hands-free navigation and input
2. **AR Preview** - Visualize products in real space
3. **Collaborative Editing** - Real-time venture collaboration
4. **AI Chat Assistant** - Conversational venture planning
5. **Template Library** - Pre-built venture templates
6. **Social Sharing** - Share ventures with preview cards
7. **Video Tutorials** - In-app video guides
8. **Gamification** - Achievement system for milestones

### Technical Improvements:
- Server-side rendering (SSR) for better SEO
- GraphQL for optimized data fetching
- WebRTC for real-time collaboration
- WebAssembly for performance-critical features
- Edge functions for serverless processing

---

## Support & Maintenance

### Regular Tasks:
- Update dependencies monthly
- Review and fix security advisories
- Monitor error logs
- Analyze user analytics
- Optimize slow queries
- Clean up expired exports
- Archive inactive ventures

### Monitoring Recommendations:
- Set up error tracking (Sentry/LogRocket)
- Monitor Core Web Vitals
- Track conversion funnels
- Monitor API usage and costs
- Set up uptime monitoring
- Track user engagement metrics

---

## Contributing Guidelines

### Code Style:
- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Write unit tests for utilities
- Test on multiple devices before PR

### Component Guidelines:
- Keep components under 300 lines
- Use composition over inheritance
- Implement error boundaries
- Add loading states
- Include accessibility features

### Animation Guidelines:
- Respect reduced motion preferences
- Target 60fps performance
- Use GPU-accelerated properties (transform, opacity)
- Avoid layout thrashing
- Test on low-end devices

---

**Last Updated:** November 18, 2025
**Maintainer:** Development Team
**Version:** 2.0.0-mvp
