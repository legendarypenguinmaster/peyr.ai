# Peyr.ai - AI-Powered Startup Platform

A comprehensive Next.js platform that connects startup founders with co-founders, mentors, and provides AI-powered tools for business development.

## 🚀 Features

### Core Platform
- ⚡ **Next.js 15** with App Router and Turbopack
- 🔷 **TypeScript** for type safety
- 🎨 **Tailwind CSS** for modern UI/UX
- 🔌 **API Routes** for backend functionality
- 📱 **Responsive Design** with dark mode support
- 🗄️ **Supabase Integration** for database and authentication
- 🔐 **Row Level Security (RLS)** for data protection

### 🤝 Co-Founder Matching
- **AI-Powered Recommendations** using GPT-4o
- **Smart Matching Algorithm** based on skills, location, and preferences
- **Real-time Connection System** with status tracking
- **Network Analytics** showing sent requests, connections, and pending
- **24-hour Caching** for optimized performance

### 🧠 AI Tools Suite

#### 1. **AI Coach** (`/ai-tools/ai-coach`)
- **GPT-4o Powered** business coaching
- **Category-based Guidance**: Idea validation, market analysis, funding advice, team building, growth strategy
- **Chat History Management** with session persistence
- **Streaming Responses** for real-time interaction
- **Suggested Follow-ups** for each category

#### 2. **Pitch Generator** (`/ai-tools/pitch-generator`)
- **3-Step Process**: Input → Review → Deck
- **GPT-4o-mini Integration** for pitch deck generation
- **Structured Output** with professional formatting
- **PDF Generation** with client-side rendering
- **Session Storage** for data persistence

#### 3. **Equity Calculator** (`/ai-tools/equity-calculator`)
- **2-Step Process**: Input → Results
- **Multi-Founder Support** with dynamic form
- **AI-Powered Calculations** using GPT-4o-mini
- **Comprehensive Analysis** including risk factors and contributions
- **Professional Results Display**

#### 4. **Legal Document Generator** (`/ai-tools/legal-generator`)
- **6 Document Types**: Founder Agreement, NDA, Employment Contract, Equity Agreement, Advisor Agreement, IP Assignment
- **Document-Specific Forms** with tailored input fields
- **GPT-4o Integration** for professional legal documents
- **Dual Format Support**: DOCX and PDF generation
- **Rich Text Formatting**: Bold, italic, headers, and proper structure

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - State management and side effects
- **Next.js Image** - Optimized image rendering

### Backend
- **Next.js API Routes** - Server-side functionality
- **Supabase** - Database and authentication
- **OpenAI GPT-4o/GPT-4o-mini** - AI-powered features
- **Row Level Security** - Data protection

### Libraries & Tools
- **docx** - DOCX document generation
- **jspdf** - PDF document generation
- **html2canvas** - Client-side PDF rendering
- **react-markdown** - Markdown rendering
- **clsx & tailwind-merge** - Conditional styling
- **cross-env** - Cross-platform environment variables

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- **npm, yarn, pnpm, or bun**
- **Supabase Account** (for database)
- **OpenAI API Key** (for AI features)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd peyr.ai
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables:**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

4. **Set up Supabase database:**
Run the SQL scripts in your Supabase dashboard to create the necessary tables:
- `founders` table
- `mentors` table
- `co_founder_recommendations` table
- `connections` table
- `ai_coach_sessions` table
- `ai_coach_messages` table

5. **Run the development server:**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## 📊 Database Schema

### Core Tables
- **`founders`** - Founder profiles and preferences
- **`mentors`** - Mentor profiles and expertise
- **`co_founder_recommendations`** - AI-generated recommendations
- **`connections`** - Connection requests and status
- **`ai_coach_sessions`** - AI Coach chat sessions
- **`ai_coach_messages`** - AI Coach messages

### Key Features
- **Row Level Security (RLS)** enabled on all tables
- **Real-time subscriptions** for live updates
- **Optimized queries** with proper indexing
- **Data validation** with TypeScript interfaces

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## 🎯 Key Features

### Co-Founder Matching
- **Smart Algorithm**: Matches founders based on complementary skills, location, and business goals
- **AI Recommendations**: Uses GPT-4o to analyze profiles and suggest optimal matches
- **Connection Management**: Send, accept, decline, and block connections
- **Network Analytics**: Track your professional network growth

### AI Tools
- **AI Coach**: Get personalized business advice across 5 categories
- **Pitch Generator**: Create professional pitch decks with AI assistance
- **Equity Calculator**: Calculate fair equity distribution among founders
- **Legal Generator**: Generate professional legal documents in DOCX/PDF format

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Live notifications and status updates
- **Session Management**: Persistent chat history and form data
- **Professional UI**: Modern, clean interface with smooth animations

## 🔐 Security

- **Row Level Security (RLS)** on all database tables
- **Environment Variables** for sensitive data
- **TypeScript** for type safety
- **Input Validation** on all forms
- **Secure API Routes** with proper error handling

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Other Platforms
- **Netlify** - Static site hosting
- **Railway** - Full-stack deployment
- **DigitalOcean** - VPS deployment
- **AWS** - Scalable cloud deployment

## 📈 Performance

- **Turbopack** for fast development builds
- **Next.js Image Optimization** for faster loading
- **API Route Caching** for improved performance
- **Database Query Optimization** with proper indexing
- **Client-side Caching** for AI recommendations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4o and GPT-4o-mini APIs
- **Supabase** for database and authentication
- **Next.js Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Vercel** for deployment platform

## 📞 Support

For support, email support@peyr.ai or join our Discord community.

---

**Built with ❤️ for the startup community**