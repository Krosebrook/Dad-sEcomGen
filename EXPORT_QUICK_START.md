# Export System - Quick Start Guide

## 🚀 Quick Start

### Basic Usage (5 minutes)

#### 1. Import the Service
```typescript
import { ExportService } from './services/exportService';
```

#### 2. Export a Single Element as PDF
```typescript
const canvas = await ExportService.captureElement('my-element-id');
const pdfBlob = await ExportService.exportToPDF([canvas], 'my-document');
ExportService.downloadBlob(pdfBlob, 'my-document.pdf');
```

#### 3. Export Multiple Elements as Images
```typescript
const canvases = await ExportService.captureMultipleElements([
  'element1',
  'element2',
  'element3'
]);

const imageBlobs = await ExportService.exportAsImages(canvases, 'export');

// Downloads: export-1.png, export-2.png, export-3.png
imageBlobs.forEach((blob, i) => {
  ExportService.downloadBlob(blob, `export-${i + 1}.png`);
});
```

#### 4. Create a Complete Export Package
```typescript
const canvases = await ExportService.captureMultipleElements([
  'scene1',
  'scene2'
]);

const pdfBlob = await ExportService.exportToPDF(canvases, 'storyboard');
const imageBlobs = await ExportService.exportAsImages(canvases, 'scene');

const files = [
  { name: 'storyboard.pdf', blob: pdfBlob },
  { name: 'scene-1.png', blob: imageBlobs[0] },
  { name: 'scene-2.png', blob: imageBlobs[1] }
];

await ExportService.createZipBundle(files, 'complete-export.zip');
```

## 🎨 Using the UI Components

### Enhanced Export Manager
```tsx
import { EnhancedExportManager } from './components/export';

function MyComponent() {
  return (
    <EnhancedExportManager
      elementIds={['element1', 'element2']}
      baseFilename="my-export"
      ventureId="optional-venture-id"
      onExportComplete={() => console.log('Done!')}
    />
  );
}
```

### Export Analytics Dashboard
```tsx
import { ExportAnalyticsDashboard } from './components/export';

function AnalyticsPage() {
  return <ExportAnalyticsDashboard />;
}
```

## 📊 Tracking Exports

### Save Export to History
```typescript
import { ExportService } from './services/exportService';
import { useAuth } from './contexts/AuthContext';

const { user } = useAuth();

// After creating an export
await ExportService.trackExport(
  user.id,
  'pdf',           // export type
  'pdf',           // export format
  pdfBlob.size,    // file size
  3,               // number of assets
  { quality: 0.95, pages: 3 }, // custom metadata
  ventureId        // optional venture link
);
```

### View Export History
```typescript
const history = await ExportService.getExportHistory(user.id, 50);

history.forEach(exp => {
  console.log(`${exp.export_type} - ${exp.export_format}`);
  console.log(`Size: ${ExportService.formatFileSize(exp.file_size)}`);
  console.log(`Date: ${new Date(exp.created_at).toLocaleDateString()}`);
});
```

### Get Analytics
```typescript
const analytics = await ExportService.getExportAnalytics(user.id);

console.log(`Total Exports: ${analytics.totalExports}`);
console.log(`Total Size: ${ExportService.formatFileSize(analytics.totalSize)}`);
console.log('By Type:', analytics.exportsByType);
console.log('By Format:', analytics.exportsByFormat);
```

## 💾 Template System

### Save a Template
```typescript
await ExportService.saveTemplate(
  user.id,
  'High Quality PDF',           // name
  'pdf',                         // export type
  {                              // settings
    quality: 0.95,
    scale: 2,
    paperSize: 'a4',
    orientation: 'portrait',
    includeAnnotations: true
  },
  'For client presentations',   // description
  true                          // set as default
);
```

### Load Templates
```typescript
const templates = await ExportService.getTemplates(user.id, 'pdf');

templates.forEach(template => {
  console.log(template.name);
  console.log(template.description);
  console.log(template.settings);
});
```

### Use a Template
```typescript
const templates = await ExportService.getTemplates(user.id, 'pdf');
const myTemplate = templates[0];

// Apply template settings
const options = myTemplate.settings as ExportOptions;

const canvases = await ExportService.captureMultipleElements(
  ['element1', 'element2'],
  options
);

const pdfBlob = await ExportService.exportToPDF(
  canvases,
  'templated-export',
  options
);
```

## ⚙️ Advanced Configuration

### Custom Export Options
```typescript
const options: ExportOptions = {
  type: 'storyboard',
  format: 'pdf',
  includeAnnotations: true,
  includeMetadata: true,
  quality: 0.95,           // 95% quality
  scale: 2,                // 2x for retina
  paperSize: 'a4',
  orientation: 'landscape'
};

const canvases = await ExportService.captureMultipleElements(
  ['scene1', 'scene2'],
  options
);

const pdfBlob = await ExportService.exportToPDF(
  canvases,
  'custom-export',
  options
);
```

### Quality vs Size Trade-offs
```typescript
// High quality (larger file)
const highQuality = { quality: 1.0, scale: 3 };

// Balanced (recommended)
const balanced = { quality: 0.95, scale: 2 };

// Smaller file (faster)
const compressed = { quality: 0.7, scale: 1 };
```

## 🔐 Security Notes

### Authentication Required
```typescript
// Always check user authentication
import { useAuth } from './contexts/AuthContext';

const { user } = useAuth();

if (!user) {
  console.error('User must be authenticated for export tracking');
  return;
}

// Proceed with tracked export
await ExportService.trackExport(user.id, ...);
```

### RLS Policies
All database operations automatically enforce:
- Users can only see their own exports
- Users can only create exports under their account
- Users can only modify/delete their own data

## 🎯 Common Patterns

### Pattern 1: Quick PDF Export
```typescript
async function quickPdfExport(elementId: string, filename: string) {
  const canvas = await ExportService.captureElement(elementId);
  const pdf = await ExportService.exportToPDF([canvas], filename);
  ExportService.downloadBlob(pdf, `${filename}.pdf`);
}

// Usage
await quickPdfExport('my-content', 'document');
```

### Pattern 2: Multi-Page Report
```typescript
async function generateReport(sections: string[]) {
  const canvases = await ExportService.captureMultipleElements(sections);

  const pdf = await ExportService.exportToPDF(
    canvases,
    'report',
    {
      includeAnnotations: true,
      paperSize: 'letter',
      orientation: 'portrait'
    }
  );

  ExportService.downloadBlob(pdf, 'report.pdf');
}

// Usage
await generateReport([
  'cover-page',
  'summary',
  'details',
  'conclusion'
]);
```

### Pattern 3: Complete Asset Package
```typescript
async function exportCompletePackage(
  elementIds: string[],
  baseName: string,
  userId: string
) {
  const canvases = await ExportService.captureMultipleElements(elementIds);

  // Create PDF
  const pdf = await ExportService.exportToPDF(canvases, baseName);

  // Create images
  const images = await ExportService.exportAsImages(canvases, baseName);

  // Bundle everything
  const files = [
    { name: `${baseName}.pdf`, blob: pdf },
    ...images.map((blob, i) => ({
      name: `${baseName}-${i + 1}.png`,
      blob
    }))
  ];

  await ExportService.createZipBundle(files, `${baseName}-complete.zip`);

  // Track the export
  const totalSize = files.reduce((sum, f) => sum + f.blob.size, 0);
  await ExportService.trackExport(
    userId,
    'full_package',
    'zip',
    totalSize,
    files.length
  );
}
```

## 🐛 Troubleshooting

### Element Not Found
```typescript
// Problem: Element doesn't exist
await ExportService.captureElement('non-existent-id');
// Error: Element with id "non-existent-id" not found

// Solution: Check element exists
const element = document.getElementById('my-id');
if (element) {
  await ExportService.captureElement('my-id');
}
```

### Empty Canvas
```typescript
// Problem: Element has no content or is hidden
await ExportService.captureElement('hidden-element');

// Solution: Make element visible temporarily
const element = document.getElementById('my-element');
element.style.display = 'block';
await ExportService.captureElement('my-element');
element.style.display = 'none';
```

### Large File Sizes
```typescript
// Problem: Export files too large
const pdf = await ExportService.exportToPDF(canvases, 'big');

// Solution: Reduce quality or scale
const pdf = await ExportService.exportToPDF(
  canvases,
  'optimized',
  { quality: 0.7, scale: 1 }
);
```

## 📚 API Reference

### ExportService Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `captureElement(id, options)` | Capture single element | `Promise<HTMLCanvasElement>` |
| `captureMultipleElements(ids, options)` | Capture multiple elements | `Promise<HTMLCanvasElement[]>` |
| `exportToPDF(canvases, filename, options)` | Generate PDF | `Promise<Blob>` |
| `exportAsImages(canvases, filename, options)` | Generate images | `Promise<Blob[]>` |
| `createZipBundle(files, filename)` | Create ZIP | `Promise<void>` |
| `downloadBlob(blob, filename)` | Download file | `void` |
| `trackExport(...)` | Save to history | `Promise<ExportHistory>` |
| `getExportHistory(userId, limit)` | Get history | `Promise<ExportHistory[]>` |
| `deleteExportHistory(id)` | Delete history | `Promise<boolean>` |
| `saveTemplate(...)` | Save template | `Promise<ExportTemplate>` |
| `getTemplates(userId, type)` | Get templates | `Promise<ExportTemplate[]>` |
| `deleteTemplate(id)` | Delete template | `Promise<boolean>` |
| `getExportAnalytics(userId)` | Get analytics | `Promise<Analytics>` |
| `formatFileSize(bytes)` | Format size | `string` |

### ExportOptions Interface

```typescript
interface ExportOptions {
  type: 'pdf' | 'components' | 'assets' | 'storyboard' | 'full_package';
  format: 'pdf' | 'png' | 'svg' | 'zip' | 'json';
  includeAnnotations?: boolean;
  includeMetadata?: boolean;
  quality?: number;           // 0.5 - 1.0
  scale?: number;             // 1 - 3
  paperSize?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
}
```

## 🎓 Examples Repository

All examples are available in:
- `services/exportService.ts` - Complete implementation
- `components/export/EnhancedExportManager.tsx` - UI integration
- `components/ExportControls.tsx` - Real-world usage
- `components/storyboard/StoryboardDemo.tsx` - Advanced usage

## 💬 Need Help?

1. Check `PHASE_1_EXPORT_SYSTEM.md` for technical details
2. Review inline code comments
3. Examine working examples in components
4. Check TypeScript types for available options

---

**Quick Start Complete! You're ready to build amazing export features! 🎉**
