# Deployment Guide for POS App

## Prerequisites
1. Create a PostgreSQL database (recommended: Neon, Supabase, or Railway)
2. Set up Vercel account
3. Configure environment variables

## Environment Variables for Vercel

Add these environment variables in your Vercel dashboard:

```
DATABASE_URL=postgresql://username:password@host:port/database?schema=public
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-production-secret-key-here
XENDIT_SECRET_KEY=your-production-xendit-secret-key
XENDIT_PUBLIC_KEY=your-production-xendit-public-key
XENDIT_WEBHOOK_TOKEN=your-production-xendit-webhook-token
```

## Deployment Steps

1. **Set up Database:**
   - Create a PostgreSQL database on Neon/Supabase/Railway
   - Copy the connection string

2. **Configure Vercel:**
   ```bash
   npx vercel
   ```
   - Follow the prompts to link your project
   - Add environment variables in Vercel dashboard

3. **Deploy:**
   ```bash
   npx vercel --prod
   ```

## Post-Deployment

1. Run database migrations:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

2. Test the application
3. Update NEXTAUTH_URL to your actual Vercel URL