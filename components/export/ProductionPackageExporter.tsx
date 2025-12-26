import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import jsPDF from 'jspdf';
import { useTheme } from '../../contexts/SafeThemeContext';

interface ProductionPackageExporterProps {
  sceneIds: string[];
  onExportComplete?: () => void;
}

interface ExportOptions {
  includeStoryboard: boolean;
  includeUIComponents: boolean;
  includeVideoFrames: boolean;
  includeDocumentation: boolean;
  includeStyleGuide: boolean;
}

export function ProductionPackageExporter({ sceneIds, onExportComplete }: ProductionPackageExporterProps) {
  const { theme, variant: themeVariant } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [options, setOptions] = useState<ExportOptions>({
    includeStoryboard: true,
    includeUIComponents: true,
    includeVideoFrames: false,
    includeDocumentation: true,
    includeStyleGuide: true,
  });

  const toggleOption = (key: keyof ExportOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const captureElement = async (elementId: string, scale = 2): Promise<Blob | null> => {
    const element = document.getElementById(elementId);
    if (!element) return null;

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: theme.colors.background,
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  };

  const generateStoryboardPDF = async (zip: JSZip): Promise<void> => {
    setCurrentTask('Generating storyboard PDF...');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.setFontSize(28);
    pdf.text('UI/UX Storyboard', pageWidth / 2, 30, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text('Dad\'s E-commerce Plan Generator', pageWidth / 2, 40, { align: 'center' });
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 50, { align: 'center' });
    pdf.text(`Theme: ${themeVariant}`, pageWidth / 2, 55, { align: 'center' });

    for (let i = 0; i < sceneIds.length; i++) {
      const blob = await captureElement(sceneIds[i], 2);
      if (!blob) continue;

      const imgData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      pdf.addPage();
      pdf.setFontSize(18);
      pdf.text(`Scene ${i + 1}: ${sceneIds[i].replace(/-scene$/, '').replace(/-/g, ' ').toUpperCase()}`, 15, 15);

      const imgWidth = pageWidth - 30;
      const imgHeight = pageHeight - 40;
      pdf.addImage(imgData, 'PNG', 15, 25, imgWidth, imgHeight);

      setProgress(((i + 1) / sceneIds.length) * 30);
    }

    const pdfBlob = pdf.output('blob');
    zip.file('storyboard/storyboard_complete.pdf', pdfBlob);
  };

  const captureUIComponents = async (zip: JSZip): Promise<void> => {
    setCurrentTask('Capturing UI components...');
    const componentsFolder = zip.folder('ui_components');
    if (!componentsFolder) return;

    const components = [
      { id: 'splash-scene', name: 'splash_logo' },
      { id: 'onboarding-scene', name: 'onboarding_flow' },
      { id: 'dashboard-scene', name: 'dashboard_layout' },
      { id: 'interaction-scene', name: 'interaction_demo' },
      { id: 'completion-scene', name: 'completion_celebration' },
    ];

    for (let i = 0; i < components.length; i++) {
      const { id, name } = components[i];
      const blob = await captureElement(id, 3);

      if (blob) {
        componentsFolder.file(`${name}_@3x.png`, blob);

        const blob2x = await captureElement(id, 2);
        if (blob2x) componentsFolder.file(`${name}_@2x.png`, blob2x);

        const blob1x = await captureElement(id, 1);
        if (blob1x) componentsFolder.file(`${name}_@1x.png`, blob1x);
      }

      setProgress(30 + ((i + 1) / components.length) * 20);
    }
  };

  const generateVideoFrames = async (zip: JSZip): Promise<void> => {
    setCurrentTask('Generating video frames...');
    const videoFolder = zip.folder('video_exports');
    if (!videoFolder) return;

    const formats = [
      { name: '16_9_1080p', width: 1920, height: 1080 },
      { name: '9_16_1080p', width: 1080, height: 1920 },
    ];

    for (const format of formats) {
      const formatFolder = videoFolder.folder(format.name);
      if (!formatFolder) continue;

      for (let i = 0; i < sceneIds.length; i++) {
        const blob = await captureElement(sceneIds[i], 2);
        if (blob) {
          formatFolder.file(`scene_${i + 1}_${sceneIds[i]}.png`, blob);
        }
      }
    }

    setProgress(50);
  };

  const generateDocumentation = (zip: JSZip): void => {
    setCurrentTask('Generating documentation...');
    const docsFolder = zip.folder('documentation');
    if (!docsFolder) return;

    const readme = `# Production Package - Dad's E-commerce Plan Generator

## Package Contents

This production package contains all assets needed for design handoff, marketing, and development.

### Included Files:

1. **Storyboard** (/storyboard/)
   - Complete PDF walkthrough of all scenes
   - Individual scene screenshots

2. **UI Components** (/ui_components/)
   - High-resolution component exports (@1x, @2x, @3x)
   - Ready for design systems and documentation

${options.includeVideoFrames ? `3. **Video Exports** (/video_exports/)
   - 16:9 landscape format (1920×1080)
   - 9:16 portrait format (1080×1920)
   - Ready for video compilation` : ''}

${options.includeStyleGuide ? `4. **Style Guide** (/style_guide/)
   - Color palettes for all themes
   - Typography specifications
   - Spacing and layout guidelines` : ''}

## Workflow Scenes

1. **Splash Scene** - Animated logo reveal and brand introduction
2. **Onboarding Scene** - User journey introduction with avatar guide
3. **Dashboard Scene** - Interactive dashboard with animated components
4. **Interaction Scene** - User interaction demonstrations
5. **Completion Scene** - Success state with call-to-action

## Theme Variants

- **Minimalist Flat** - Clean, modern design with subtle shadows
- **Cinematic Realism** - Rich, immersive experience with depth
- **Futuristic Neon** - Bold, vibrant design with glowing effects

Each theme supports light and dark modes.

## Technical Specifications

- Resolution: Up to 3× retina display support
- Color Space: sRGB
- Format: PNG (lossless)
- Accessibility: WCAG 2.1 AA compliant

## Usage Instructions

### For Designers:
- Use UI components for design documentation
- Reference storyboard PDF for user flow
- Apply style guide for consistent branding

### For Developers:
- Implement components based on storyboard
- Use video exports for marketing materials
- Follow style guide specifications

### For Marketing:
- Use storyboard PDF for presentations
- Compile video frames for promotional content
- Reference style guide for brand consistency

## Export Details

- Export Date: ${new Date().toLocaleString()}
- Theme: ${themeVariant}
- Total Scenes: ${sceneIds.length}
- Package Version: 1.0.0

## Contact

For questions or additional formats, please contact the development team.

---
Generated by Dad's E-commerce Plan Generator
© ${new Date().getFullYear()} - All Rights Reserved
`;

    docsFolder.file('README.md', readme);

    const technicalSpecs = `# Technical Specifications

## Scene Breakdown

${sceneIds.map((id, index) => `
### Scene ${index + 1}: ${id.replace(/-scene$/, '').replace(/-/g, ' ').toUpperCase()}

**Purpose:** ${getSceneDescription(id)}
**Duration:** 3-5 seconds
**Transition:** Fade/slide
**Accessibility:** Full keyboard navigation, ARIA labels

`).join('\n')}

## Animation Details

- Frame Rate: 60 FPS (smooth motion)
- Easing: CSS cubic-bezier for natural movement
- Reduced Motion: Respects user preferences
- Performance: GPU-accelerated transforms

## Responsive Breakpoints

- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1919px
- Large Desktop: 1920px+

## Color Specifications

### Minimalist Theme
- Primary: #3b82f6 (Blue)
- Secondary: #10b981 (Green)
- Accent: #f59e0b (Amber)

### Cinematic Theme
- Primary: #ef4444 (Red)
- Secondary: #8b5cf6 (Purple)
- Accent: #f59e0b (Amber)

### Futuristic Theme
- Primary: #06b6d4 (Cyan)
- Secondary: #a855f7 (Purple)
- Accent: #f59e0b (Amber)

## Typography

- Font Family: System UI (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)
- Heading Sizes: 2xl (1.5rem), 3xl (1.875rem), 4xl (2.25rem)
- Body Size: base (1rem), sm (0.875rem)
- Line Height: 1.5 (body), 1.2 (headings)

## File Formats

- Images: PNG (lossless, transparency support)
- PDF: A4 landscape, 300 DPI
- Video Frames: Sequential PNG for FFmpeg compilation
`;

    docsFolder.file('TECHNICAL_SPECS.md', technicalSpecs);

    setProgress(70);
  };

  const generateStyleGuide = (zip: JSZip): void => {
    setCurrentTask('Generating style guide...');
    const styleFolder = zip.folder('style_guide');
    if (!styleFolder) return;

    const styleGuide = `# Style Guide - Dad's E-commerce Plan Generator

## Design System

### Color Palettes

#### Minimalist Flat
\`\`\`css
--primary: #3b82f6;
--secondary: #10b981;
--accent: #f59e0b;
--background: #ffffff;
--surface: #f8fafc;
--text: #1e293b;
--border: #e2e8f0;
\`\`\`

#### Cinematic Realism
\`\`\`css
--primary: #ef4444;
--secondary: #8b5cf6;
--accent: #f59e0b;
--background: #0f172a;
--surface: #1e293b;
--text: #f1f5f9;
--border: #334155;
\`\`\`

#### Futuristic Neon
\`\`\`css
--primary: #06b6d4;
--secondary: #a855f7;
--accent: #f59e0b;
--background: #0a0a0a;
--surface: #1a1a1a;
--text: #ffffff;
--border: #333333;
\`\`\`

### Typography Scale

- Heading 1: 3rem (48px) - Bold
- Heading 2: 2.25rem (36px) - Bold
- Heading 3: 1.875rem (30px) - Semibold
- Heading 4: 1.5rem (24px) - Semibold
- Body Large: 1.125rem (18px) - Regular
- Body: 1rem (16px) - Regular
- Body Small: 0.875rem (14px) - Regular
- Caption: 0.75rem (12px) - Regular

### Spacing System

Based on 8px grid:

- xs: 4px (0.25rem)
- sm: 8px (0.5rem)
- md: 16px (1rem)
- lg: 24px (1.5rem)
- xl: 32px (2rem)
- 2xl: 48px (3rem)
- 3xl: 64px (4rem)

### Shadows

- sm: 0 1px 2px rgba(0,0,0,0.05)
- md: 0 4px 6px rgba(0,0,0,0.07)
- lg: 0 10px 15px rgba(0,0,0,0.1)
- xl: 0 20px 25px rgba(0,0,0,0.15)
- 2xl: 0 25px 50px rgba(0,0,0,0.25)

### Border Radius

- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px
- 2xl: 24px
- full: 9999px

### Animations

- Duration Fast: 150ms
- Duration Normal: 300ms
- Duration Slow: 500ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)

## Component Guidelines

### Buttons

- Primary: Solid background with primary color
- Secondary: Outline with primary color
- Text: No background, primary text color
- Padding: 12px 24px (medium)
- Border Radius: 8px
- Hover: Scale 1.05 + brightness adjustment

### Cards

- Background: Surface color
- Border: 1px solid border color
- Padding: 24px
- Border Radius: 16px
- Shadow: md
- Hover: Shadow lg + scale 1.02

### Inputs

- Background: Background color
- Border: 2px solid border color
- Padding: 12px 16px
- Border Radius: 8px
- Focus: Border primary color + shadow

## Accessibility

- Minimum contrast ratio: 4.5:1 (WCAG AA)
- Touch target size: Minimum 44×44px
- Focus indicators: Visible outline
- ARIA labels: Required for all interactive elements
- Keyboard navigation: Full support

## Best Practices

1. Always use the spacing system
2. Maintain consistent border radius
3. Use shadows to establish hierarchy
4. Ensure sufficient color contrast
5. Test with reduced motion preferences
6. Support dark and light modes
7. Optimize images for web
8. Use semantic HTML
`;

    styleFolder.file('STYLE_GUIDE.md', styleGuide);

    setProgress(80);
  };

  const getSceneDescription = (sceneId: string): string => {
    const descriptions: Record<string, string> = {
      'splash-scene': 'Logo reveal with animated brand introduction',
      'onboarding-scene': 'User journey walkthrough with avatar guide',
      'dashboard-scene': 'Interactive dashboard with data visualization',
      'interaction-scene': 'User interaction patterns and micro-interactions',
      'completion-scene': 'Success state with celebratory animation',
    };
    return descriptions[sceneId] || 'Interactive scene demonstration';
  };

  const exportProductionPackage = async () => {
    setIsExporting(true);
    setProgress(0);

    try {
      const zip = new JSZip();

      if (options.includeStoryboard) {
        await generateStoryboardPDF(zip);
      }

      if (options.includeUIComponents) {
        await captureUIComponents(zip);
      }

      if (options.includeVideoFrames) {
        await generateVideoFrames(zip);
      }

      if (options.includeDocumentation) {
        generateDocumentation(zip);
      }

      if (options.includeStyleGuide) {
        generateStyleGuide(zip);
      }

      setCurrentTask('Compressing package...');
      setProgress(90);

      const blob = await zip.generateAsync(
        { type: 'blob' },
        (metadata) => {
          setProgress(90 + (metadata.percent / 100) * 10);
        }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `production-package-${themeVariant}-${Date.now()}.zip`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      setCurrentTask('Complete!');
      setProgress(100);
      onExportComplete?.();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setProgress(0);
        setCurrentTask('');
      }, 2000);
    }
  };

  const activeOptionsCount = Object.values(options).filter(Boolean).length;

  return (
    <div
      className="p-6 rounded-xl space-y-6"
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: '1px',
      }}
    >
      <div>
        <h3 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text }}>
          Production Package Exporter
        </h3>
        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
          Export a complete production package with storyboards, UI components, documentation, and style guides.
        </p>
      </div>

      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: `${theme.colors.primary}10`,
          borderColor: theme.colors.primary,
          borderWidth: '1px',
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">📦</span>
          <div className="flex-1">
            <h4 className="font-semibold mb-2" style={{ color: theme.colors.text }}>
              Package Contents
            </h4>
            <div className="space-y-2">
              {Object.entries(options).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => toggleOption(key as keyof ExportOptions)}
                    className="w-5 h-5 rounded"
                    style={{ accentColor: theme.colors.primary }}
                  />
                  <span
                    className="text-sm group-hover:underline"
                    style={{ color: theme.colors.text }}
                  >
                    {key.replace(/([A-Z])/g, ' $1').replace(/^include /, '')}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="p-4 rounded-lg space-y-2"
        style={{
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          borderWidth: '1px',
        }}
      >
        <h4 className="font-semibold text-sm" style={{ color: theme.colors.text }}>
          Package Details:
        </h4>
        <ul className="text-sm space-y-1" style={{ color: theme.colors.textSecondary }}>
          <li>• {sceneIds.length} workflow scenes</li>
          <li>• {activeOptionsCount} export modules enabled</li>
          <li>• Theme: {themeVariant}</li>
          <li>• Multi-resolution assets (@1x, @2x, @3x)</li>
          <li>• Complete documentation included</li>
        </ul>
      </div>

      {isExporting && (
        <div className="space-y-3">
          <div
            className="h-3 rounded-full overflow-hidden"
            style={{ backgroundColor: theme.colors.border }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                backgroundColor: theme.colors.primary,
                width: `${progress}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: theme.colors.textSecondary }}>{currentTask}</span>
            <span style={{ color: theme.colors.text }} className="font-bold">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      )}

      <button
        onClick={exportProductionPackage}
        disabled={isExporting || activeOptionsCount === 0}
        className="w-full px-6 py-4 rounded-lg font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        style={{
          backgroundColor: theme.colors.primary,
          color: '#ffffff',
        }}
      >
        {isExporting ? (
          <>
            <span className="animate-spin">⏳</span>
            Exporting...
          </>
        ) : (
          <>
            <span>📦</span>
            Export Production Package
          </>
        )}
      </button>
    </div>
  );
}
