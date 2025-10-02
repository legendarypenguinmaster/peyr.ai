# Peyr.ai - AI-Powered Startup Platform

A comprehensive Next.js platform that connects startup founders with co-founders, mentors, and provides AI-powered tools for business development, workspace management, and intelligent insights.

## 🎯 About Peyr.ai

### Our Mission

Peyr.ai is revolutionizing the startup ecosystem by providing founders with intelligent tools and connections that accelerate their journey from idea to success. We believe that every great startup deserves access to the right co-founders, mentors, and AI-powered insights to build something extraordinary.

### Our Vision

To become the definitive platform where startup founders find their perfect co-founders, access world-class mentorship, and leverage cutting-edge AI tools to build, scale, and succeed in their entrepreneurial journey.

### What Makes Us Different

#### **🤖 AI-First Approach**

Unlike traditional networking platforms, Peyr.ai leverages advanced AI (GPT-4o) to:

- **Intelligently match** founders based on complementary skills, vision, and business goals
- **Analyze workspace data** to provide actionable business insights
- **Generate professional documents** including pitch decks, legal agreements, and business plans
- **Offer personalized coaching** across all aspects of startup development

#### **🏢 Comprehensive Workspace Management**

Peyr.ai goes beyond simple matching to provide a complete workspace ecosystem:

- **Team Collaboration**: Real-time project management and task tracking
- **Document Intelligence**: AI-powered document analysis and organization
- **Business Analytics**: Deep insights into team performance and business metrics
- **Investor Readiness**: AI assessment of investment readiness and recommendations

#### **🎯 Founder-Centric Design**

Built by founders, for founders:

- **Real-world Problems**: Every feature addresses actual startup challenges
- **Professional Tools**: Enterprise-grade functionality with startup-friendly pricing
- **Community-Driven**: Features evolve based on founder feedback and needs
- **Success-Focused**: Every tool is designed to accelerate startup success

### The Peyr.ai Advantage

#### **For Solo Founders**

- **Find Your Co-Founder**: AI-powered matching with compatible entrepreneurs
- **Access Mentorship**: Connect with experienced founders and industry experts
- **Build Your Team**: Comprehensive workspace tools for team management
- **Scale Your Business**: AI insights to guide strategic decisions

#### **For Startup Teams**

- **Optimize Collaboration**: Advanced project management and task tracking
- **Enhance Productivity**: AI-powered document processing and business intelligence
- **Prepare for Investment**: Comprehensive investor readiness assessment
- **Accelerate Growth**: Data-driven insights and actionable recommendations

#### **For Investors**

- **Due Diligence Support**: AI-generated insights into startup performance
- **Portfolio Management**: Track multiple startups in one unified platform
- **Risk Assessment**: Proactive identification of potential issues
- **Growth Tracking**: Monitor startup progress and milestones

### Our Commitment to Excellence

#### **🔒 Security & Privacy**

- **Enterprise-grade Security**: Row-level security and data encryption
- **Privacy by Design**: Your data remains yours, always
- **Compliance Ready**: Built with GDPR and data protection in mind

#### **⚡ Performance & Reliability**

- **Lightning Fast**: Built on Next.js 15 with Turbopack for optimal performance
- **Always Available**: 99.9% uptime with global CDN distribution
- **Scalable Architecture**: Grows with your startup from idea to IPO

#### **🌍 Global Reach**

- **Worldwide Network**: Connect with founders and mentors globally
- **Multi-language Support**: Breaking down language barriers in entrepreneurship
- **Cultural Sensitivity**: AI trained to understand diverse business cultures

### Join the Peyr.ai Community

Whether you're a first-time founder with a brilliant idea, an experienced entrepreneur looking for your next co-founder, or an investor seeking the next unicorn, Peyr.ai provides the tools, connections, and insights you need to succeed.

**Ready to transform your startup journey?** [Get started with Peyr.ai today](https://peyr.ai) and join thousands of founders who are already building the future.

## 🚀 Features

### Core Platform

- ⚡ **Next.js 15** with App Router and Turbopack
- 🔷 **TypeScript** for type safety
- 🎨 **Tailwind CSS** for modern UI/UX
- 🔌 **API Routes** for backend functionality
- 📱 **Responsive Design** with dark mode support
- 🗄️ **Supabase Integration** for database and authentication
- 🔐 **Row Level Security (RLS)** for data protection
- 🎯 **Workspace Management** for team collaboration
- 📊 **AI-Powered Analytics** for business insights

### 🤝 Co-Founder Matching

- **AI-Powered Recommendations** using GPT-4o
- **Smart Matching Algorithm** based on skills, location, and preferences
- **Real-time Connection System** with status tracking
- **Network Analytics** showing sent requests, connections, and pending
- **24-hour Caching** for optimized performance

### 🏢 Workspace Hub (`/workspace-hub/[id]`)

A comprehensive workspace management system for startup teams:

#### **Dashboard Overview**

- **Real-time Metrics**: Task completion, project status, team activity
- **Quick Actions**: Create projects, add tasks, invite members
- **Recent Activity Feed**: Latest updates across all workspace activities
- **Team Performance Insights**: Individual and team productivity metrics

#### **Project Management**

- **Project Creation & Management**: Full CRUD operations for projects
- **Task Tracking**: Create, assign, and track tasks with due dates
- **Status Management**: Active, completed, paused, cancelled project states
- **Priority Levels**: Low, medium, high, urgent task priorities
- **File Management**: Upload and organize project files with drag-and-drop
- **Document Integration**: Automatic document categorization and storage

#### **Team Collaboration**

- **Member Management**: Invite, manage, and assign roles to team members
- **Role-based Access**: Owner, admin, member, viewer permissions
- **Real-time Updates**: Live notifications for team activities
- **Activity Tracking**: Monitor individual and team contributions

#### **Document Management** (`/workspace-hub/[id]/documents`)

- **5 Filter Categories**: All Documents, My Documents, Shared Workspace Docs, Contracts & Legal, AI Outputs
- **Drag & Drop Upload**: Seamless file upload with progress tracking
- **AI Document Summarization**: GPT-4o powered document analysis and summarization
- **Document Types**: Project, contract, legal, AI-generated documents
- **Project Association**: Link documents to specific projects
- **File Storage**: Secure Supabase Storage with organized buckets
- **Document Metadata**: Title, description, type, size, creator, timestamps
- **Download & View**: Secure document access and download functionality

#### **AI Insights Dashboard** (`/workspace-hub/[id]/ai-insights`)

- **Executive Summary**: AI-generated high-level workspace overview
- **Achievement Tracking**: AI-identified strengths and accomplishments
- **Risk Assessment**: Proactive identification of potential issues
- **Growth Opportunities**: AI-suggested areas for improvement and expansion
- **Team Dynamics Analysis**: Collaboration insights and team balance
- **Investor Readiness**: Assessment of investment readiness and recommendations
- **Action Plans**: AI-generated actionable next steps
- **Database Caching**: Intelligent caching to avoid redundant AI calls
- **Rich Text Rendering**: Formatted insights with bold, italic, headers, and code blocks

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
- **Workspace Integration**: Save generated documents directly to workspace

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
- **lucide-react** - Modern icon library
- **@supabase/supabase-js** - Supabase client library
- **openai** - OpenAI API integration

## 🏗️ Architecture Overview

### Workspace System

The platform is built around a comprehensive workspace management system that enables startup teams to collaborate effectively:

#### **Multi-tenant Architecture**

- **Workspace Isolation**: Each workspace operates independently with its own data
- **Role-based Access Control**: Granular permissions for owners, admins, members, and viewers
- **Real-time Collaboration**: Live updates across all workspace activities

#### **AI Integration**

- **Intelligent Document Processing**: Automatic categorization and summarization
- **Business Intelligence**: AI-powered insights and recommendations
- **Smart Caching**: Optimized AI calls with database-backed caching
- **Rich Text Processing**: Advanced markdown rendering with custom components

#### **File Management**

- **Dual Storage System**: Separate buckets for workspace documents and project files
- **Automatic Categorization**: AI-powered file type detection and organization
- **Secure Access**: Row-level security for all file operations
- **Drag & Drop Interface**: Modern file upload experience

#### **Component Architecture**

- **Modular Design**: Reusable components for consistent UI/UX
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Performance Optimization**: Lazy loading and code splitting
- **Responsive Design**: Mobile-first approach with dark mode support

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

**Core Tables:**

- `founders` table
- `mentors` table
- `co_founder_recommendations` table
- `connections` table
- `ai_coach_sessions` table
- `ai_coach_messages` table

**Workspace Management Tables:**

- `workspaces` table
- `workspace_members` table
- `workspace_projects` table
- `workspace_tasks` table
- `workspace_documents` table
- `workspace_documents_meta` table
- `workspace_ai_insights` table
- `project_files_meta` table

**Storage Buckets:**

- `workspace_documents` bucket for document storage
- `project_files` bucket for project file storage

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

### Workspace Management Tables

- **`workspaces`** - Workspace information and settings
- **`workspace_members`** - Team member roles and permissions
- **`workspace_projects`** - Project management and tracking
- **`workspace_tasks`** - Task assignment and status tracking
- **`workspace_documents`** - Document metadata and organization
- **`workspace_documents_meta`** - Document file information and storage
- **`workspace_ai_insights`** - Cached AI analysis and insights
- **`project_files_meta`** - Project file metadata and storage

### Key Features

- **Row Level Security (RLS)** enabled on all tables
- **Real-time subscriptions** for live updates
- **Optimized queries** with proper indexing
- **Data validation** with TypeScript interfaces
- **File Storage Integration** with Supabase Storage buckets
- **AI Caching System** for performance optimization

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

### Workspace Management

- **Team Collaboration**: Invite members, assign roles, and manage permissions
- **Project Tracking**: Create projects, assign tasks, and monitor progress
- **Document Organization**: Upload, categorize, and manage workspace documents
- **AI-Powered Insights**: Get intelligent analysis of team performance and business metrics
- **File Management**: Drag-and-drop file uploads with automatic categorization
- **Real-time Updates**: Live collaboration with instant notifications

### AI Tools

- **AI Coach**: Get personalized business advice across 5 categories
- **Pitch Generator**: Create professional pitch decks with AI assistance
- **Equity Calculator**: Calculate fair equity distribution among founders
- **Legal Generator**: Generate professional legal documents in DOCX/PDF format
- **Document Summarization**: AI-powered analysis of uploaded documents
- **Business Intelligence**: Comprehensive workspace analytics and insights

### User Experience

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Live notifications and status updates
- **Session Management**: Persistent chat history and form data
- **Professional UI**: Modern, clean interface with smooth animations
- **Dark Mode Support**: Complete dark/light theme switching
- **Rich Text Rendering**: Formatted content with markdown support

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
- **AI Insights Caching** to avoid redundant GPT-4o calls
- **File Upload Optimization** with drag-and-drop and progress tracking
- **Real-time Updates** with efficient WebSocket connections
- **Component-based Architecture** for optimal bundle splitting

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
