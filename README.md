# PastorAid 🙏

> AI-powered pastoral assistant for sermon preparation, Bible research, and ministry management

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Claude AI](https://img.shields.io/badge/Claude-Sonnet%204.5-purple)](https://anthropic.com/)

PastorAid is a comprehensive web application designed to help pastors, church leaders, and seminary students with sermon preparation, biblical research, and ministry organization. Built with modern web technologies and powered by AI, it streamlines the pastoral workflow.

## ✨ Features

### 🎤 Sermon Tools
- **Sermon Ideas Generator** - AI-powered sermon topic suggestions based on themes and scripture
- **Sermon Outline Generator** - Create detailed, multi-point sermon outlines instantly
- **Sermon Writer** - Full sermon drafting with AI assistance
- **Sermon Library** - Save and organize your sermons

### 📖 Bible & Research
- **AI Bible Search** - Find relevant verses by topic, theme, or concept
- **Theology Research** - Deep theological study with AI assistance
- **Notes System** - Organize study notes, research, and reflections

### 🎵 Hymn Finder
- Search 100,000+ hymns from Hymnary.org
- Filter by theme, season, and scripture reference
- AI-powered hymn suggestions
- Save favorite hymns to your collection

### 📅 Ministry Management
- **Calendar** - Track ministry events, services, and commitments
- **Community Board** - Connect and collaborate with other ministers
- **Settings** - Customize preferences and manage your profile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)
- Anthropic API key (Claude AI)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/klatt42/pastoraid-genesis.git
   cd pastoraid-genesis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Anthropic AI
   ANTHROPIC_API_KEY=your-anthropic-api-key

   # Optional: Google Gemini (alternative AI provider)
   GOOGLE_API_KEY=your-google-gemini-api-key

   # App Config
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Set up Supabase database**

   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the schema file: `supabase-schema.sql`
   - This creates all necessary tables with Row Level Security (RLS)

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**

   Visit [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### API Keys Setup

#### Anthropic Claude AI
1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Create an account or log in
3. Generate an API key
4. Add to `.env.local` as `ANTHROPIC_API_KEY`

#### Supabase
1. Create a project at [supabase.com](https://supabase.com/)
2. Get your project URL and API keys from Settings → API
3. Run the database schema (`supabase-schema.sql`) in SQL Editor
4. Add credentials to `.env.local`

#### Optional: Google Gemini
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create an API key
3. Add to `.env.local` as `GOOGLE_API_KEY`

### Database Schema

The application uses the following main tables:
- `profiles` - User profiles
- `sermons` - Sermon library
- `sermon_ideas` - AI-generated sermon ideas
- `notes` - User notes and research
- `calendar_events` - Ministry calendar
- `hymns` - Hymn database
- `community_posts` - Community board posts

All tables have Row Level Security (RLS) enabled for data protection.

## 🧪 Testing

### Test Scripts

```bash
# Test all API endpoints
node test-api.js

# Test database connectivity
node test-db.js

# Test Claude AI integration
node test-claude-live.js
```

### Development Mode

The app includes authentication bypass for development testing. To restore full authentication, search for `// TEMPORARY: Bypass auth for development` and remove those sections.

## 📁 Project Structure

```
pastoraid-genesis/
├── app/
│   ├── api/              # API routes (13 endpoints)
│   ├── auth/             # Authentication actions
│   ├── dashboard/        # Protected dashboard pages
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── layout.tsx        # Root layout
├── components/           # Reusable UI components
├── lib/
│   ├── ai/              # AI provider (Claude + Gemini)
│   └── supabase/        # Supabase client utilities
├── public/              # Static assets
├── .env.local           # Environment variables (not committed)
└── supabase-schema.sql  # Database schema
```

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **AI:** Anthropic Claude Sonnet 4.5, Google Gemini
- **Styling:** Tailwind CSS v4
- **Authentication:** Supabase Auth
- **Forms:** React Hook Form + Zod
- **Date Handling:** date-fns
- **Notifications:** Sonner

## 📚 Documentation

- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Complete project overview and roadmap
- [TESTING_REPORT.md](./TESTING_REPORT.md) - Test results and validation
- [API_CREDENTIALS_STATUS.md](./API_CREDENTIALS_STATUS.md) - API setup guide
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database configuration
- [SUPABASE_AUTH_FIX.md](./SUPABASE_AUTH_FIX.md) - Authentication troubleshooting

## 🗺️ Roadmap

### Current Status (v1.0)
- ✅ Core AI features (sermon ideas, outlines, Bible search)
- ✅ Hymn finder with Hymnary.org integration
- ✅ Authentication system
- ✅ Database schema with RLS

### Planned Features
- 🔄 Enhanced calendar views (month/week/day)
- 🔄 Rich text editor for notes
- 🔄 Community features (comments, discussions)
- 🔄 Mobile app version
- 🔄 Export sermons to PDF/DOCX
- 🔄 Integration with church management systems

## 🤝 Contributing

This is a private project, but suggestions and bug reports are welcome through GitHub issues.

## 📄 License

Private - All rights reserved

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Anthropic Claude AI](https://anthropic.com/)
- Database by [Supabase](https://supabase.com/)
- Hymn data from [Hymnary.org](https://hymnary.org/)
- Icons from [Heroicons](https://heroicons.com/)

## 📞 Support

For questions or issues:
1. Check the documentation files in the project
2. Review the testing reports for known issues
3. Open an issue on GitHub

---

**Made with ❤️ for pastors and church leaders**

*"Preach the word; be prepared in season and out of season" - 2 Timothy 4:2*
