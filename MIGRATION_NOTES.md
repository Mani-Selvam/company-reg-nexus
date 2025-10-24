# Lovable to Replit Migration Notes

## What's Been Completed ✅

### 1. Project Structure
- Migrated to fullstack JavaScript structure with:
  - `client/` - Frontend React application
  - `server/` - Express backend server
  - `shared/` - Shared TypeScript types and schemas

### 2. Database Migration
- Created Drizzle ORM schema based on your Supabase database
- Connected to Neon PostgreSQL database
- Pushed schema successfully with `npm run db:push`
- Tables created:
  - countries, states, cities
  - companies
  - profiles
  - user_roles

### 3. Backend Infrastructure
- Express server running on port 5000
- API routes created for:
  - `/api/countries`, `/api/states/:countryId`, `/api/cities/:stateId`
  - `/api/companies` (GET all, POST create, PATCH update, DELETE)
  - `/api/profile/:userId` (GET, POST, PATCH)
  - `/api/user-role/:userId` (GET, POST)
- Storage interface implemented using Drizzle ORM
- Vite dev server configured for development

### 4. Frontend Updates
- Migrated from `react-router-dom` to `wouter`
- Updated `App.tsx` to use wouter routing
- Updated `Index.tsx` to use wouter navigation

### 5. Configuration
- TypeScript configurations updated for client/server separation
- Package.json scripts configured:
  - `npm run dev` - Start development server
  - `npm run build` - Build for production
  - `npm run db:push` - Push database schema changes

## What Still Needs Work ⚠️

### 1. Authentication System
The application currently uses Supabase Auth (`@supabase/supabase-js`) which won't work in the Replit environment. You need to replace it with one of these options:

**Option A: Use Replit Auth Integration**
- Search for authentication integrations in Replit
- Implement user sessions and role management

**Option B: Build Custom Auth**
- Implement bcrypt password hashing
- Add JWT or session-based authentication
- Create login/signup API endpoints
- Add authentication middleware

### 2. Frontend Components Need Updates
The following components still use Supabase client directly:
- `client/src/lib/auth.ts` - All auth functions
- `client/src/pages/Auth.tsx` - Sign in/up pages
- `client/src/pages/Dashboard.tsx` - User role checking
- `client/src/components/dashboard/CompanyDashboard.tsx` - Company fetching
- `client/src/components/dashboard/AdminDashboard.tsx` - Company management
- `client/src/components/dashboard/CompanyRegistrationDialog.tsx` - Form submissions
- `client/src/components/dashboard/EditCompanyDialog.tsx` - Company updates
- `client/src/components/dashboard/CompanyTable.tsx` - Company deletion

These need to be updated to use the new API routes instead of calling Supabase directly.

### 3. Session Management
- Add session storage (cookies or JWT)
- Implement authentication middleware on protected routes
- Handle user sessions on the frontend

### 4. Environment Variables
Current setup uses:
- `DATABASE_URL` - ✅ Already configured for Neon PostgreSQL

You'll need to add (if using custom auth):
- Session secret key
- Any API keys for third-party services

## How to Continue Development

### 1. Start the Development Server
```bash
npm run dev
```

The server will run on port 5000 with hot-reload enabled.

### 2. Test the Database Connection
You can test API endpoints:
```bash
curl http://localhost:5000/api/countries
```

### 3. Update Components
For each component that uses Supabase:
1. Replace `supabase.from('table')` with `fetch('/api/endpoint')`
2. Update to use React Query for data fetching
3. Handle loading and error states

### 4. Implement Authentication
Choose your authentication approach and:
1. Create auth endpoints (`/api/auth/login`, `/api/auth/signup`, etc.)
2. Add middleware for protected routes
3. Update frontend to use new auth system
4. Remove Supabase auth dependencies

## File Structure
```
/
├── client/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and helpers
│   │   └── hooks/         # Custom React hooks
│   └── index.html
├── server/
│   ├── index.ts          # Express server entry point
│   ├── routes.ts         # API route handlers
│   ├── storage.ts        # Database interface
│   ├── db.ts             # Drizzle database connection
│   └── vite.ts           # Vite middleware configuration
├── shared/
│   └── schema.ts         # Drizzle schema and types
├── package.json
├── vite.config.ts
├── drizzle.config.ts
└── tsconfig.json
```

## Known Issues
1. Supabase authentication won't work - needs replacement
2. Components still reference Supabase client - need API updates
3. No session management implemented yet

## Recommendations
1. Start by implementing a simple authentication system
2. Update one component at a time to use the new API routes
3. Test thoroughly after each change
4. Consider using Replit's built-in authentication if available
