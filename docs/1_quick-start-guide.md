# Quick Setup Guide

## Initial Setup

1. **Clone the Repository**
   ```bash
   git clone [repository-url]
   cd sws-todo-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

## Supabase Configuration

1. **Create a Supabase Project**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Fill in project details
   - Wait for database to be ready

2. **Get Supabase Credentials**
   - In your Supabase project dashboard, click "Project Settings"
   - Go to "API" section
   - You'll need:
     - Project URL (`VITE_SUPABASE_URL`)
     - Public anon key (`VITE_SUPABASE_ANON_KEY`)

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and update with your Supabase credentials:
     ```env
     VITE_SUPABASE_URL=your_project_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```

## Development Server

Start the development server:
```bash
npm run dev
```

## Service Worker Notice

When running the app, you may see a console message:
```
Service Workers are not yet supported on StackBlitz
```

This is normal and expected when running in the StackBlitz environment. The service worker provides offline capabilities and PWA features, which are fully functional when deployed to production but not available in the StackBlitz development environment.

If you need to remove this message for development:
1. Ask the Bolt developer to remove the service worker registration
2. The message will no longer appear in the console

Note: Removing the service worker only affects development. The production build will still include full PWA and offline support.

## Next Steps

1. Create an account in the app
2. Create your first todo
3. Try creating folders and organizing your todos
4. Explore sharing features with other users

For more detailed information, see:
- [User Guide](./2_user-guide.md)
- [Developer Guide](./3_developer-guide.md)