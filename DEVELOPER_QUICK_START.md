# Developer Quick Start - Phase 2 & 3 Features

## Setup

```bash
npm install
npm run build
```

## Phase 2: Collaboration Features

### 1. Team Management

```tsx
import { TeamManagement } from './components/collaboration';

// In your component
<TeamManagement
  ventureId={currentVenture.id}
  isOwner={user.id === venture.userId}
/>
```

**Features:**
- Invite collaborators by email
- Assign roles (owner/editor/viewer)
- Remove team members
- View invitation status

---

### 2. Real-time Presence

```tsx
import { PresenceIndicator } from './components/collaboration';

// Shows who's currently viewing
<PresenceIndicator
  ventureId={currentVenture.id}
  className="ml-4"
/>
```

**Auto-cleanup:** Presence removed after 5 minutes of inactivity

---

### 3. Comments System

```tsx
import { CommentsPanel } from './components/collaboration';

// Add comments to any section
<CommentsPanel
  ventureId={currentVenture.id}
  sectionType="financials"
  sectionId="projections-2025"
/>
```

**Features:**
- Threaded replies
- @mentions with notifications
- Real-time updates
- Edit tracking

---

### 4. Version Control

```tsx
import { VersionHistory } from './components/collaboration';

<VersionHistory
  ventureId={currentVenture.id}
  currentData={appData}
  onRestore={(version) => {
    setAppData(version.snapshot);
  }}
/>
```

**Features:**
- Create manual checkpoints
- Compare versions
- Restore previous versions
- Add version labels

---

### 5. Notifications

```tsx
import { NotificationsCenter } from './components/collaboration';

// In your header/navigation
<NotificationsCenter />
```

**Notification Types:**
- Team invitations
- @mentions in comments
- Venture updates
- System alerts

---

## Phase 3: Analytics & Operations

### 1. Inventory Management

```tsx
import { InventoryDashboard } from './components/inventory/InventoryDashboard';

<InventoryDashboard />
```

**Track:**
- Stock levels
- Reorder points
- Location tracking
- Cost per unit
- Inventory value

---

### 2. Marketing ROI

```tsx
import { MarketingROIDashboard } from './components/marketing/MarketingROIDashboard';

<MarketingROIDashboard />
```

**Analytics:**
- Campaign performance
- ROI by channel
- Cost per acquisition
- Conversion tracking
- Budget utilization

---

### 3. Bulk Operations

```tsx
import { BulkOperationsPanel } from './components/bulk/BulkOperationsPanel';

<BulkOperationsPanel
  ventures={allVentures}
  onRefresh={() => loadVentures()}
/>
```

**Operations:**
- CSV import/export
- Bulk archive
- Bulk delete
- Multi-select

---

### 4. Enhanced Exports

```tsx
import { EnhancedExportPanel } from './components/export/EnhancedExportPanel';

<EnhancedExportPanel
  ventureName={venture.name}
  data={venture.data}
/>
```

**Formats:**
- PDF (business plan)
- JSON (raw data)
- ZIP (complete package)

---

## Service Layer Usage

### Collaboration Service

```typescript
import { collaborationService } from './services';

// Invite a collaborator
await collaborationService.inviteCollaborator({
  ventureId: 'venture-uuid',
  email: 'colleague@example.com',
  role: 'editor'
});

// Check access
const hasAccess = await collaborationService.checkAccess(
  'venture-uuid',
  'editor' // required role
);

// Get all collaborators
const team = await collaborationService.getCollaborators('venture-uuid');
```

---

### Comments Service

```typescript
import { commentsService } from './services';

// Create a comment
await commentsService.createComment({
  ventureId: 'venture-uuid',
  sectionType: 'financials',
  sectionId: 'q1-2025',
  content: 'Great projections!',
  mentions: ['user-uuid'] // optional
});

// Subscribe to real-time updates
const subscription = commentsService.subscribeToComments(
  'venture-uuid',
  (payload) => {
    console.log('New comment:', payload);
    loadComments();
  }
);

// Cleanup
subscription.unsubscribe();
```

---

### Notifications Service

```typescript
import { notificationsService } from './services';

// Get unread count
const count = await notificationsService.getUnreadCount();

// Mark as read
await notificationsService.markAsRead('notification-uuid');

// Subscribe to new notifications
notificationsService.subscribeToNotifications((payload) => {
  console.log('New notification:', payload.new);
  showToast(payload.new.title);
});
```

---

### Presence Service

```typescript
import { presenceService } from './services';

// Update presence (call periodically)
await presenceService.updatePresence('venture-uuid', {
  x: mouseX,
  y: mouseY,
  section: 'financials'
});

// Start heartbeat (auto-updates every 30s)
const stopHeartbeat = presenceService.startHeartbeat('venture-uuid');

// Cleanup
stopHeartbeat();
await presenceService.removePresence('venture-uuid');
```

---

### Version Control Service

```typescript
import { versionControlService } from './services';

// Create version
await versionControlService.createVersion(
  'venture-uuid',
  currentAppData,
  'Before major changes' // optional label
);

// Get version history
const versions = await versionControlService.getVersions('venture-uuid', 20);

// Compare versions
const diffs = versionControlService.compareVersions(oldData, newData);

// Format diff for display
diffs.forEach(diff => {
  console.log(versionControlService.formatDiff(diff));
});
```

---

## Database Access

### Check User Permissions

```typescript
import { supabase } from './lib/safeSupabase';

const { data: venture } = await supabase
  .from('ventures')
  .select('user_id')
  .eq('id', ventureId)
  .single();

const isOwner = venture.user_id === currentUserId;

const { data: collaborator } = await supabase
  .from('venture_collaborators')
  .select('role')
  .eq('venture_id', ventureId)
  .eq('user_id', currentUserId)
  .eq('status', 'accepted')
  .maybeSingle();

const canEdit = isOwner || (collaborator && ['owner', 'editor'].includes(collaborator.role));
```

---

## Real-time Subscriptions

### Pattern

```typescript
// Setup subscription
const channel = supabase
  .channel('unique-channel-name')
  .on(
    'postgres_changes',
    {
      event: 'INSERT', // or 'UPDATE', 'DELETE', '*'
      schema: 'public',
      table: 'table_name',
      filter: `column=eq.${value}`
    },
    (payload) => {
      // Handle real-time update
      console.log('Change:', payload);
    }
  )
  .subscribe();

// Cleanup
return () => {
  channel.unsubscribe();
};
```

---

## Error Handling

```typescript
import { handleError, getUserFriendlyMessage } from './utils/errors';
import { ErrorRetry } from './components/ui/ErrorRetry';

try {
  await someAsyncOperation();
} catch (err) {
  const appError = handleError(err);

  // Show user-friendly message
  toast.error(appError.userMessage);

  // Or render retry UI
  return <ErrorRetry error={err} onRetry={() => someAsyncOperation()} />;
}
```

---

## Validation

```typescript
import { validateField, emailSchema, ventureNameSchema } from './lib/schemas';

// Validate email
const emailResult = validateField(emailSchema, userInput);
if (!emailResult.isValid) {
  setError(emailResult.error);
  return;
}

// Use validated data
const cleanEmail = emailResult.data;
```

---

## Rate Limiting

```typescript
import { RateLimitBanner } from './components/ui/RateLimitBanner';
import { checkRateLimit, geminiRateLimiter } from './lib/rateLimiter';

// Check before API call
const rateLimitCheck = checkRateLimit(geminiRateLimiter, userId);
if (!rateLimitCheck.allowed) {
  return <RateLimitBanner retryAfterMs={5000} />;
}

// Make API call
await generateWithAI();
```

---

## Testing

### Manual Tests

1. **Collaboration**
   ```
   1. Invite a collaborator
   2. Accept invitation in incognito window
   3. Verify presence indicators show both users
   4. Add comment and verify real-time update
   5. Create version checkpoint
   ```

2. **Analytics**
   ```
   1. Add inventory items
   2. Adjust stock levels
   3. View marketing campaigns
   4. Check ROI calculations
   ```

3. **Bulk Operations**
   ```
   1. Download CSV template
   2. Add venture data
   3. Import CSV
   4. Select multiple ventures
   5. Export as CSV
   ```

---

## Common Patterns

### Protected Actions

```typescript
const canPerformAction = async (ventureId: string, requiredRole: CollaboratorRole) => {
  const hasAccess = await collaborationService.checkAccess(ventureId, requiredRole);
  if (!hasAccess) {
    throw new Error('Insufficient permissions');
  }
};
```

### Optimistic Updates

```typescript
// Update UI immediately
setComments([...comments, newComment]);

// Then sync with server
try {
  await commentsService.createComment(newComment);
} catch (err) {
  // Rollback on error
  setComments(comments);
  toast.error('Failed to post comment');
}
```

### Cleanup Pattern

```typescript
useEffect(() => {
  const subscription = subscribeToUpdates();
  const heartbeat = startHeartbeat();

  return () => {
    subscription.unsubscribe();
    heartbeat.stop();
  };
}, [ventureId]);
```

---

## Environment Variables

Required in `.env`:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_GEMINI_API_KEY=your-gemini-key
```

---

## Debugging

### Enable Supabase Logs

```typescript
import { supabase } from './lib/safeSupabase';

// In development
if (import.meta.env.DEV) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event, session);
  });
}
```

### Real-time Debug

```typescript
channel
  .on('system', {}, (status) => {
    console.log('Channel status:', status);
  })
  .subscribe();
```

---

## Performance Tips

1. **Pagination:** Always limit query results
   ```typescript
   .limit(50)
   ```

2. **Selective Loading:** Only fetch needed fields
   ```typescript
   .select('id, name, updated_at')
   ```

3. **Debounce:** Use for presence updates
   ```typescript
   import { useDebounce } from './hooks';
   const debouncedUpdate = useDebounce(updatePresence, 1000);
   ```

4. **Cleanup:** Always unsubscribe from channels
   ```typescript
   useEffect(() => {
     const sub = subscribe();
     return () => sub.unsubscribe();
   }, []);
   ```

---

## Security Checklist

- ✅ All inputs validated with Zod schemas
- ✅ All outputs sanitized with DOMPurify
- ✅ RLS policies on all tables
- ✅ Permission checks before mutations
- ✅ Rate limiting on API calls
- ✅ CSRF protection (Supabase handles)
- ✅ SQL injection prevention (Supabase handles)

---

## Support & Resources

- **Documentation:** See `PHASE_2_AND_3_IMPLEMENTATION.md`
- **Migrations:** `supabase/migrations/`
- **Services:** `services/`
- **Components:** `components/collaboration/`, `components/inventory/`, etc.
- **Types:** `types.ts`, `types/*.ts`

---

**Happy Coding! 🚀**
