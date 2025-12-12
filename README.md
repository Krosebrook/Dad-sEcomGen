# Dad's E-commerce Plan Generator

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

An AI-powered e-commerce business plan generator built with React 19, TypeScript, Google Gemini 2.5 Pro, and Supabase.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Capabilities

- **4-Step Venture Wizard**: Guided business plan creation from idea to launch
- **AI-Powered Generation**: 30+ specialized AI functions using Google Gemini 2.5 Pro
- **Real-time Collaboration**: Supabase backend with Row Level Security
- **PDF Export**: Export complete business plans as professional PDFs
- **Progressive Web App**: Install on any device, works offline

### AI Features

| Feature | Description |
|---------|-------------|
| Product Planning | Generate product descriptions, variants, pricing |
| SMART Goals | AI-generated Specific, Measurable, Achievable, Relevant, Time-bound goals |
| Competitive Analysis | Market research with real-time web grounding |
| Customer Personas | Detailed buyer personas with avatar generation |
| Financial Projections | 3-scenario financial forecasts (pessimistic, realistic, optimistic) |
| Marketing Plans | Social media calendars, ad campaigns, email funnels |
| SEO Strategy | Keyword analysis and content calendars |
| Legal Checklist | Compliance requirements and business setup |

### User Experience

- **3 Theme Variants**: Minimalist, Cinematic, Futuristic
- **Dark/Light Mode**: System-aware with manual override
- **Accessibility**: WCAG 2.1 AA compliant with accessibility panel
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Avatar Guides**: AI personality-driven onboarding

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19.2, TypeScript 5.8 |
| Styling | Tailwind CSS 3 |
| Build | Vite 6.2 |
| Backend | Supabase (PostgreSQL + Auth) |
| AI | Google Gemini 2.5 Pro |
| Export | jsPDF, html2canvas |
| Deployment | Netlify |

### Dependencies

**Production:**
- `react` ^19.2.0
- `@supabase/supabase-js` ^2.81.1
- `@google/genai` ^1.26.0
- `jspdf` ^2.5.1
- `html2canvas` ^1.4.1

**Development:**
- `typescript` ~5.8.2
- `vite` ^6.2.0
- `terser` ^5.44.1

---

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20)
- npm or yarn
- Supabase account
- Google AI Studio API key

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Krosebrook/Dad-sEcomGen.git
cd Dad-sEcomGen
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

4. **Get your Gemini API key**

- Go to [Google AI Studio](https://ai.google.dev/aistudio)
- Click "Get API Key"
- Create or select a project
- Copy the API key to your `.env.local`

5. **Run the development server**

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Project Structure

```
Dad-sEcomGen/
├── components/           # React components (85+)
│   ├── ui/              # Reusable UI primitives
│   ├── steps/           # Wizard step components
│   ├── storyboard/      # Onboarding scenes
│   ├── pwa/             # PWA components
│   └── [Feature Cards]  # 41 specialized cards
├── contexts/            # React Context providers
│   ├── AuthContext.tsx  # Authentication state
│   ├── SafeThemeContext.tsx  # Theme management
│   └── ViewportContext.tsx   # Responsive viewport
├── hooks/               # Custom React hooks
├── services/            # API services
│   └── geminiService.ts # AI generation (64KB, 30+ functions)
├── lib/                 # Core utilities
│   ├── ventureService.ts    # Supabase CRUD
│   ├── themes.ts            # Theme system
│   ├── animations.ts        # Animation engine
│   └── accessibility.ts     # A11y utilities
├── types/               # TypeScript definitions
├── utils/               # Helper functions
├── supabase/            # Database migrations
└── public/              # Static assets & PWA manifest
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | This file - project overview |
| [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) | Detailed setup guide |
| [MVP_IMPLEMENTATION.md](./MVP_IMPLEMENTATION.md) | Feature implementation details |
| [AUDIT_REPORT.md](./AUDIT_REPORT.md) | Comprehensive codebase audit |
| [ROADMAP.md](./ROADMAP.md) | Development roadmap and priorities |
| [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) | Deployment guide |
| [SECURITY_FIXES.md](./SECURITY_FIXES.md) | Security audit and fixes |
| [PWA_FEATURES.md](./PWA_FEATURES.md) | PWA capabilities |
| [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) | QA procedures |
| [IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md) | Developer reference |

---

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npx tsc --noEmit
```

### Code Style

- **Components**: Functional components with TypeScript
- **Styling**: Tailwind CSS utility classes
- **State**: React Context API
- **Types**: Strict TypeScript (recommended)

### Architecture

```
User Input → React Components → Context API → Services → Supabase/Gemini API
                    ↓
            Type-Safe State Management
                    ↓
            Persistent Storage (localStorage fallback)
```

---

## Deployment

### Netlify (Recommended)

1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push

**Build Settings:**
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 20

### Environment Variables (Production)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-key
VITE_ENABLE_ANALYTICS=true
```

See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for detailed instructions.

---

## Current Status

**Version:** 2.0.0 (Production Ready)

### Audit Summary (December 2025)

| Category | Score |
|----------|-------|
| Architecture | 9/10 |
| Documentation | 9/10 |
| Code Organization | 8/10 |
| Performance | 7/10 |
| Accessibility | 7/10 |
| Security | 4/10 |
| Type Safety | 5/10 |
| Testing | 0/10 |

See [AUDIT_REPORT.md](./AUDIT_REPORT.md) for full details.
See [ROADMAP.md](./ROADMAP.md) for planned improvements.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [IMPLEMENTATION_NOTES.md](./IMPLEMENTATION_NOTES.md) for coding guidelines.

---

## License

This project is proprietary software. All rights reserved.

---

## Links

- **AI Studio**: [View in AI Studio](https://ai.studio/apps/drive/1-WM-4UnwcQFp4Hn9HrDKwA2S4fR52gNb)
- **Gemini API**: [Get API Key](https://ai.google.dev/aistudio)
- **Supabase**: [Documentation](https://supabase.com/docs)

---

**Built with React 19 + TypeScript + Gemini AI + Supabase**
