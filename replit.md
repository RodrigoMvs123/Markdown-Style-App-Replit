# Markdown Enhancer

## Overview

This is a Markdown enhancement application that uses AI (Google Gemini) to transform and polish markdown content. Users can input raw text, optionally provide style reference examples, and receive professionally formatted markdown output. The application features a Claude-inspired warm minimalist UI with a split-pane editor/preview interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state, React useState for local state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom warm minimalist color palette inspired by Claude's design
- **Markdown Rendering**: react-markdown with remark-gfm for GitHub Flavored Markdown support
- **Animations**: Framer Motion for smooth UI transitions
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Structure**: Single REST endpoint at `/api/enhance-markdown` for AI-powered text transformation
- **AI Integration**: Google Gemini API (gemini-2.0-flash model) for markdown enhancement
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session store

### Data Storage
- **Database**: PostgreSQL
- **Schema**: Two main tables:
  - `documents`: Stores original and enhanced text with style source metadata
  - `style_examples`: Stores reusable style templates with name, description, and content
- **Migrations**: Drizzle Kit for schema migrations (output to `/migrations` directory)

### Build System
- **Development**: Vite dev server with HMR for frontend, tsx for backend
- **Production**: Custom build script using esbuild for server bundling and Vite for client
- **Output**: Combined build outputs to `dist/` with public assets in `dist/public/`

### Path Aliases
- `@/*` → `./client/src/*` (frontend source)
- `@shared/*` → `./shared/*` (shared types and schemas)
- `@assets` → `./attached_assets` (static assets)

## External Dependencies

### AI Services
- **Google Generative AI** (@google/generative-ai): Powers the markdown enhancement feature using Gemini 2.0 Flash model
- **Environment Variable**: `GEMINI_API_KEY` required for AI functionality

### Database
- **PostgreSQL**: Primary database for documents and style examples
- **Environment Variable**: `DATABASE_URL` required for database connection
- **Connection**: Uses node-postgres (pg) Pool with Drizzle ORM

### Key NPM Packages
- **UI**: Full shadcn/ui component set (Radix primitives, class-variance-authority, tailwind-merge)
- **Forms**: react-hook-form with @hookform/resolvers and zod for validation
- **Data Fetching**: @tanstack/react-query for async state management
- **Markdown**: react-markdown, remark-gfm, github-markdown-css
- **Date Handling**: date-fns for date formatting