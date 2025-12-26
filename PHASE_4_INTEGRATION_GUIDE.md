# Phase 4 Integration Guide

## Quick Start: Integrating Phase 4 Features

This guide shows how to integrate the newly implemented Phase 4 features into your application.

## 1. Onboarding System

### Add to Main App Component

```tsx
import { OnboardingTour } from './components/onboarding';
import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { onboardingService } from './services/onboardingService';

function App() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      onboardingService.isOnboardingComplete(user.id).then(isComplete => {
        setShowOnboarding(!isComplete);
      });
    }
  }, [user]);

  return (
    <>
      {showOnboarding && (
        <OnboardingTour
          onComplete={() => setShowOnboarding(false)}
        />
      )}
      {/* Rest of app */}
    </>
  );
}
```

### Add Feature Tours to Specific Pages

```tsx
import { FeatureTour } from './components/onboarding';
import { FEATURE_TOURS } from './services/onboardingService';

function ProductScoutPage() {
  return (
    <>
      <FeatureTour
        tour={FEATURE_TOURS.productScout}
        onComplete={() => console.log('Product Scout tour complete')}
      />
      {/* Product Scout UI */}
    </>
  );
}
```

### Add Tour Targets to UI Elements

```tsx
// Add data-tour attributes to elements you want to highlight
<button data-tour="create-venture">
  Create New Venture
</button>

<div data-tour="steps">
  {/* Step navigation */}
</div>

<div data-tour="cards">
  {/* Feature cards */}
</div>
```

## 2. Template Marketplace

### Add to Navigation

```tsx
import { TemplateMarketplace, TemplateCreator } from './components/templates';

// In your navigation/routing
<nav>
  <a href="/templates">Browse Templates</a>
  <a href="/templates/create">My Templates</a>
</nav>

// In your router
<Route path="/templates" element={<TemplateMarketplace />} />
<Route path="/templates/create" element={<TemplateCreator />} />
```

### Use Template in Venture Creation

```tsx
import { templateService } from './services/templateService';

async function createVentureFromTemplate(templateId: string) {
  const template = await templateService.getTemplate(templateId);
  if (template) {
    // Use template.template_data to populate venture form
    const ventureData = {
      name: template.title,
      ...template.template_data
    };
    // Create venture with pre-filled data
  }
}
```

## 3. Mobile Navigation

### Replace Bottom Navigation

```tsx
import { MobileNavigation } from './components/mobile';
import { useMediaQuery } from './hooks/useMediaQuery';

function Layout({ children }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: 'idea', label: 'Idea', icon: '💡' },
    { id: 'blueprint', label: 'Blueprint', icon: '📋' },
    { id: 'market', label: 'Market', icon: '📊' },
    { id: 'launch', label: 'Launch', icon: '🚀' }
  ];

  return (
    <>
      {children}
      {isMobile && (
        <MobileNavigation
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          steps={steps}
        />
      )}
    </>
  );
}
```

### Add Swipeable Cards

```tsx
import { SwipeableCard } from './components/mobile';

function CardView({ cards, onNext, onPrevious }) {
  return (
    <>
      {cards.map(card => (
        <SwipeableCard
          key={card.id}
          onSwipeLeft={onNext}
          onSwipeRight={onPrevious}
          className="p-4 bg-white rounded-lg shadow"
        >
          {card.content}
        </SwipeableCard>
      ))}
    </>
  );
}
```

### Add Mobile Drawer

```tsx
import { MobileDrawer } from './components/mobile';
import { useState } from 'react';

function Settings() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Settings
      </button>

      <MobileDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Settings"
        position="bottom"
      >
        {/* Settings content */}
      </MobileDrawer>
    </>
  );
}
```

## 4. Performance Monitoring

### Add to Settings Page

```tsx
import { PerformanceDashboard } from './components/performance';

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <nav>
        <a href="/settings/profile">Profile</a>
        <a href="/settings/performance">Performance</a>
      </nav>

      <Route path="/settings/performance" element={<PerformanceDashboard />} />
    </div>
  );
}
```

### Track Performance Automatically

```tsx
import { performanceService } from './services/performanceService';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Start tracking page loads
    performanceService.measurePageLoad();

    // Track errors globally
    window.addEventListener('error', (event) => {
      performanceService.trackError(event.error);
    });
  }, []);

  return <>{/* App content */}</>;
}
```

### Track Component Performance

```tsx
import { usePerformanceTracking } from './services/performanceService';
import { useEffect } from 'react';

function ExpensiveComponent() {
  const { trackRender } = usePerformanceTracking('ExpensiveComponent');

  useEffect(() => {
    const stopTracking = trackRender();
    return stopTracking;
  }, []);

  return <>{/* Component content */}</>;
}
```

## 5. Optimization Features

### Lazy Load Images

```tsx
import { LazyImage } from './components/optimization';

function ProductCard({ product }) {
  return (
    <div>
      <LazyImage
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <h3>{product.name}</h3>
    </div>
  );
}
```

### Code Split Large Components

```tsx
import { createLazyComponent } from './components/optimization';

const HeavyChart = createLazyComponent(
  () => import('./components/HeavyChart')
);

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyChart data={chartData} />
    </div>
  );
}
```

### Virtualize Long Lists

```tsx
import { VirtualizedList } from './components/optimization';

function ProductList({ products }) {
  return (
    <VirtualizedList
      items={products}
      itemHeight={80}
      windowHeight={600}
      renderItem={(product, index) => (
        <div className="p-4 border-b">
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>
      )}
      className="border rounded"
    />
  );
}
```

## 6. Offline Support

### Use Offline Manager

```tsx
import { globalOfflineManager } from './lib/offlineManager';
import { useEffect, useState } from 'react';

function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    return globalOfflineManager.subscribe((online) => {
      setIsOnline(online);
    });
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-2 text-center">
      You are offline. Changes will sync when you reconnect.
    </div>
  );
}
```

### Queue Operations When Offline

```tsx
import { globalOfflineManager } from './lib/offlineManager';

async function saveVenture(ventureData) {
  if (!navigator.onLine) {
    await globalOfflineManager.queueOperation({
      type: 'create',
      entity: 'venture',
      data: ventureData
    });
    return;
  }

  // Save normally when online
  await api.saveVenture(ventureData);
}
```

## Testing Your Integration

### Test Checklist

1. **Onboarding**
   - [ ] Tour appears for new users
   - [ ] All steps are highlighted correctly
   - [ ] Progress saves between sessions
   - [ ] Feature tours appear in context

2. **Templates**
   - [ ] Can browse template marketplace
   - [ ] Can create and publish templates
   - [ ] Can download/purchase templates
   - [ ] Ratings and reviews work

3. **Mobile**
   - [ ] Bottom navigation works on mobile
   - [ ] Swipe gestures respond correctly
   - [ ] Drawers slide smoothly
   - [ ] Safe areas respected on notched devices

4. **Performance**
   - [ ] Dashboard shows metrics
   - [ ] Page loads are tracked
   - [ ] Errors are captured
   - [ ] Reports generate correctly

5. **Optimization**
   - [ ] Images lazy load
   - [ ] Components code-split
   - [ ] Lists virtualize
   - [ ] Build size is reasonable

## Common Issues

### Onboarding Tour Not Showing
- Verify user is authenticated
- Check onboarding completion status in database
- Ensure tour targets exist in DOM

### Templates Not Loading
- Verify database migration ran successfully
- Check RLS policies allow access
- Ensure user is authenticated

### Mobile Navigation Conflicts
- Check z-index values don't conflict
- Verify media queries match your breakpoints
- Test on actual mobile devices

### Performance Tracking Not Working
- Check user is authenticated
- Verify database table exists
- Ensure tracking is initialized in App component

## Next Steps

1. Customize onboarding steps for your app flow
2. Create initial template collection
3. Test on various mobile devices
4. Monitor performance metrics
5. Gather user feedback

## Support

For issues or questions:
1. Check the component documentation
2. Review the service API methods
3. Test in isolation before integrating
4. Check browser console for errors
