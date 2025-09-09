# App - Next.js Project

A modern Next.js application built with TypeScript, Tailwind CSS, and API routes.

## Features

- ⚡ **Next.js 15** with App Router
- 🔷 **TypeScript** for type safety
- 🎨 **Tailwind CSS** for styling
- 🔌 **API Routes** for backend functionality
- 📱 **Responsive Design** with dark mode support
- 🚀 **Turbopack** for fast development

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Navigate to the project directory:
```bash
cd app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
app/
├── src/
│   └── app/
│       ├── api/           # API routes
│       │   ├── hello/     # Hello API endpoint
│       │   └── users/     # Users API endpoint
│       ├── globals.css    # Global styles
│       ├── layout.tsx     # Root layout
│       └── page.tsx       # Home page
├── public/                # Static assets
├── package.json
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── next.config.ts         # Next.js configuration
```

## API Endpoints

### Hello API
- **GET** `/api/hello` - Returns a greeting message
- **POST** `/api/hello` - Accepts JSON data and returns confirmation

### Users API
- **GET** `/api/users` - Returns list of users
- **GET** `/api/users?id=1` - Returns specific user by ID
- **POST** `/api/users` - Creates a new user

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint** - Code linting and formatting

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
