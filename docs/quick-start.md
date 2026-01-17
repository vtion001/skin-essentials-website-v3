# Quick Start Guide

Get up and running with Skin Essentials by Her in 15 minutes.

## Prerequisites

- Node.js 18+ installed
- Git installed
- Supabase account
- Facebook Developer account

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/skin-essentials-website-v3.git
cd skin-essentials-website-v3
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy the following values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Go to Project Settings → Database
5. Copy the Connection String (use URI format):

```env
SUPABASE_DB_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
```

### 4. Set Up Facebook (Optional for Social Features)

1. Create an app at [developers.facebook.com](https://developers.facebook.com)
2. Note the App ID and App Secret:

```env
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
```

### 5. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_DB_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres

# Facebook (Optional)
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/auth/facebook/callback
FACEBOOK_WEBHOOK_VERIFY_TOKEN=your-random-token-here

# Development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 6. Initialize Database

Run the database migrations in Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Run `supabase/schema.sql` to create core tables
3. Run `supabase/social-media.sql` for social media features

### 7. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## First Steps

### Create an Admin Account

1. Navigate to `/admin/registration`
2. Fill in your details
3. Create your account with admin privileges

### Explore the Dashboard

1. **Dashboard**: Overview of appointments and clients
2. **Clients**: Manage customer information
3. **Appointments**: Schedule and view appointments
4. **Social Media**: Manage Facebook messages (if configured)
5. **Developer Mode**: Monitor system health and logs

### Test Social Media Integration

If you set up Facebook:

1. Go to **Social Media** tab
2. Click **Connect Facebook Page**
3. Authorize your Facebook account
4. Select a page to connect
5. Send a test message to your page
6. Verify it appears in the dashboard

## Common Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Quality
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
npm test             # Run tests

# Database
npm run db:push      # Push schema changes
npm run db:reset     # Reset database
```

## Next Steps

### Learn More

- [Production Setup Guide](production-setup.md) - Deploy to production
- [Code Standards](code-standards.md) - Development conventions
- [Social Media Architecture](social-media-architecture.md) - Understand social features
- [Developer Mode](developer-mode.md) - Monitoring and debugging

### Configuration

- [Facebook Meta Setup](facebook-meta-setup.md) - Full Facebook integration guide
- [Design System](design-system.md) - UI components and styling
- [Animation Specifications](animation-specs.md) - Motion guidelines

### Integration

- [iProgSMS API](iprogsms.md) - SMS service integration
- [Viber API](viber-api.md) - Viber messaging

## Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### Database Connection Issues

1. Verify Supabase URL and keys
2. Check internet connection
3. Ensure Supabase project is active

### Facebook Webhook Not Working

1. Verify `FACEBOOK_WEBHOOK_VERIFY_TOKEN` matches
2. Ensure callback URL is publicly accessible
3. Check Facebook app webhook subscription status

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## Getting Help

1. Check the [README](README.md) for overview
2. Review [Developer Mode](developer-mode.md) for system status
3. Check error logs in Supabase `error_logs` table
4. Search existing GitHub issues

## Recommended Tools

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Prisma (if using ORM)
- **Postman** - For API testing
- **Supabase CLI** - For database management
- **ngrok** - For local webhook testing (development only)

## Security Notes

- Never commit `.env.local` files
- Use different keys for development and production
- Rotate API tokens regularly
- Enable Two-Factor Authentication on all accounts
- Review Supabase RLS policies before production

---

**Ready to go?** Start the development server with `npm run dev` and start building!
