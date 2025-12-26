# Storyboard System - Quick Reference

## Access the Demo

**From the Main App:**
Click the **"View Storyboard"** button in the header (top right area)

## Navigation

| Control | Function |
|---------|----------|
| Scene Buttons | Jump to: Splash, Onboarding, Dashboard, Interaction, Completion |
| Theme Button | Cycle through: Minimalist → Cinematic → Futuristic |
| Play/Pause | Auto-play all scenes with transitions |
| Show Export | Toggle export panel |
| Close (X) | Return to main app |

## 5 Workflow Scenes

1. **Splash** - Animated logo reveal with brand introduction
2. **Onboarding** - Avatar-guided 4-step user journey
3. **Dashboard** - Interactive cards and statistics
4. **Interaction** - Drag-and-drop task management demo
5. **Completion** - Celebration with confetti and achievements

## Export Production Package

### Quick Export

1. Click **"Show Export"**
2. Click **"Export Production Package"** (all options selected by default)
3. Wait for processing
4. Download ZIP file

### Custom Export

Select specific modules:
- ☑️ Storyboard PDF
- ☑️ UI Components (@1x, @2x, @3x)
- ☑️ Video Frames (16:9, 9:16)
- ☑️ Documentation
- ☑️ Style Guide

## What's Included in Export

```
📦 Production Package ZIP
├── 📄 Storyboard PDF (all scenes annotated)
├── 🖼️ UI Components (high-res PNGs)
├── 🎬 Video Frames (ready for compilation)
├── 📝 Documentation (README, specs, quick start)
└── 🎨 Style Guide (design system)
```

## Theme Variants

### Minimalist Flat
Clean, modern design with subtle shadows
- Best for: Corporate, professional projects
- Colors: Blue primary, green secondary

### Cinematic Realism
Rich, immersive experience with depth
- Best for: Premium products, storytelling
- Colors: Red primary, purple secondary

### Futuristic Neon
Bold, vibrant design with glowing effects
- Best for: Tech products, gaming, innovation
- Colors: Cyan primary, purple secondary

## Avatar System

**3 Personalities:**
- **Professional** - Formal, business-focused
- **Friendly** - Casual, approachable
- **Expert** - Technical, knowledgeable

**Features:**
- Lip-sync animation
- Voice waveform visualization
- Auto-play narration
- Multiple sizes

## Video Export

### Aspect Ratios

**16:9 (Landscape - 1920×1080)**
- YouTube videos
- Presentations
- Website headers

**9:16 (Portrait - 1080×1920)**
- Instagram Stories
- TikTok
- Mobile-first content

### Create Video from Frames

```bash
# Using FFmpeg (install from ffmpeg.org)
ffmpeg -framerate 60 -pattern_type glob -i '*.png' \
  -c:v libx264 -pix_fmt yuv420p output.mp4
```

## Accessibility Features

✅ WCAG 2.1 AA compliant
✅ Colorblind-safe palettes
✅ Keyboard navigation
✅ Screen reader support
✅ Reduced motion respected

## Responsive Breakpoints

- 📱 Mobile: 320px - 768px
- 💻 Tablet: 768px - 1024px
- 🖥️ Desktop: 1024px+

## Common Use Cases

### Client Presentations
1. Export storyboard PDF
2. Open in presentation software
3. Walk through each scene
4. Share PDF with stakeholders

### Marketing Materials
1. Export video frames (16:9 or 9:16)
2. Import into video editor
3. Add music and transitions
4. Publish to social media

### Developer Handoff
1. Export complete package
2. Share ZIP with dev team
3. Reference style guide
4. Implement per technical specs

### Investor Pitches
1. Use storyboard PDF in deck
2. Show interactive demo live
3. Include UI screenshots
4. Reference documentation

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Esc | Close storyboard |
| Space | Play/Pause |
| 1-5 | Jump to scene |
| T | Cycle theme |
| E | Toggle export |

## Performance Tips

- Export at lower resolutions for faster processing
- Disable video frames if not needed
- Close other browser tabs during export
- Use Chrome/Edge for best compatibility

## Troubleshooting

**Export is slow:**
- Reduce selected options
- Close other apps
- Clear browser cache

**Video frames missing:**
- Ensure all scenes are visible
- Check browser console for errors
- Try refreshing page

**Theme not changing:**
- Click theme button multiple times
- Refresh if stuck
- Check reduced motion settings

**Storyboard won't close:**
- Press Esc key
- Click X button again
- Refresh browser if needed

## Quick Stats

- **5** Professional scenes
- **3** Style variants (6 with light/dark)
- **Multiple** Export formats
- **@3x** Maximum resolution
- **60 FPS** Animation target
- **AA** WCAG accessibility

## Support

For issues or questions:
1. Check `STORYBOARD_PRODUCTION_READY.md`
2. Review main `README.md`
3. Contact development team

---

**Pro Tip:** Try all three themes before exporting to see which fits your brand best!

**Last Updated:** December 26, 2024
