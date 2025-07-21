# BLHS Flow - Deployment Guide

This guide covers different deployment options for the BLHS Flow work management dashboard.

## Table of Contents

1. [Quick Deployment (Replit)](#quick-deployment-replit)
2. [Manual Deployment](#manual-deployment)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Email Configuration](#email-configuration)
6. [Troubleshooting](#troubleshooting)

## Quick Deployment (Replit)

### Option 1: Import from GitHub
1. Go to [Replit](https://replit.com)
2. Click "Create Repl" → "Import from GitHub"
3. Enter your repository URL
4. Replit will automatically detect the configuration

### Option 2: Upload Project
1. Create a new Node.js repl on Replit
2. Upload the project files from `blhs-flow-github/`
3. Replit will auto-install dependencies

### Configure Replit Environment
1. Go to your repl's "Secrets" tab (lock icon)
2. Add the required environment variables (see below)
3. Click "Run" - the application will start automatically

## Manual Deployment

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- Git

### Step 1: Clone and Install
```bash
git clone <your-repository-url>
cd blhs-flow
npm install
```

### Step 2: Database Setup
```bash
# Set up your PostgreSQL database
# Then run migrations
npm run db:push
```

### Step 3: Environment Configuration
```bash
cp .env.example .env
# Edit .env with your configuration (see below)
```

### Step 4: Build and Start
```bash
# For production
npm run build
npm start

# For development
npm run dev
```

## Environment Variables

### Required Variables

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/blhs_flow

# Session Security
SESSION_SECRET=your-super-secret-session-key-here

# Application URL (for email links)
APP_URL=https://your-domain.com
```

### Authentication (Replit Only)
```env
# Replit Authentication
REPLIT_DOMAINS=your-repl-name.your-username.replit.app
ISSUER_URL=https://replit.com/oidc
REPL_ID=your-repl-id
```

### Optional: AI Features
```env
# OpenAI Integration (for AI suggestions)
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Optional: Email Configuration
Choose one email provider:

#### Gmail Configuration
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

#### SMTP Configuration
```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
SMTP_FROM=noreply@your-domain.com
```

#### Outlook Configuration
```env
OUTLOOK_USER=your-email@outlook.com
OUTLOOK_PASSWORD=your-password
```

## Database Setup

### PostgreSQL Setup

#### Using Replit (Recommended)
1. Replit provides PostgreSQL automatically
2. The `DATABASE_URL` is set automatically
3. No additional setup required

#### Manual PostgreSQL Setup
1. Install PostgreSQL on your server
2. Create a database:
   ```sql
   CREATE DATABASE blhs_flow;
   CREATE USER blhs_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE blhs_flow TO blhs_user;
   ```
3. Set `DATABASE_URL` in your environment

### Database Migration
```bash
# Push schema to database
npm run db:push

# Generate migration files (if needed)
npm run db:generate
```

### Initial Admin User
After deployment, create an admin user by inserting directly into the database:

```sql
INSERT INTO users (id, email, firstName, lastName, role, password_hash, createdAt, updatedAt)
VALUES (
  'admin_' || extract(epoch from now())::text,
  'admin@yourdomain.com',
  'Admin',
  'User',
  'Administrator',
  '$2b$10$hash_your_password_here',
  NOW(),
  NOW()
);
```

Or use the application's user creation feature once logged in.

## Email Configuration

### Gmail Setup (Recommended)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate a 16-character password
3. Use this app password (not your regular Gmail password)

### SMTP Setup
1. Get SMTP credentials from your email provider
2. Common SMTP settings:
   - **Gmail**: smtp.gmail.com:587
   - **Outlook**: smtp-mail.outlook.com:587
   - **Yahoo**: smtp.mail.yahoo.com:587

### Testing Email
1. Deploy the application
2. Log in as an administrator
3. Go to Admin → Email Setup
4. Test your configuration

## Production Deployment

### Environment Checklist
- [ ] Database URL configured
- [ ] Session secret set (use a strong, random string)
- [ ] App URL set to your domain
- [ ] Email provider configured (optional)
- [ ] OpenAI API key set (optional)

### Security Considerations
1. **Use HTTPS**: Ensure your domain has SSL certificate
2. **Strong Session Secret**: Use a cryptographically secure random string
3. **Database Security**: Use strong database passwords and limit access
4. **Environment Variables**: Never commit `.env` files to version control

### Performance Tips
1. **Database Indexing**: The schema includes appropriate indexes
2. **Static Assets**: Use a CDN for better performance
3. **Caching**: Consider adding Redis for session storage in high-traffic scenarios

## Troubleshooting

### Common Issues

#### "Database connection failed"
- Check `DATABASE_URL` format
- Ensure database server is running
- Verify network connectivity
- Check database credentials

#### "Email not sending"
- Verify email credentials in environment variables
- Check spam folder for test emails
- Ensure email provider allows less secure apps (if using SMTP)
- For Gmail, use App Password instead of regular password

#### "Authentication not working"
- For Replit: Check `REPLIT_DOMAINS` matches your repl URL
- Ensure `SESSION_SECRET` is set
- Clear browser cookies and try again

#### "Build failures"
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires 18+)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Debug Mode
Enable detailed logging by setting:
```env
NODE_ENV=development
DEBUG=true
```

### Health Check
The application includes a health check endpoint:
```bash
curl https://your-domain.com/api/health
```

### Support
If you encounter issues:
1. Check the browser console for frontend errors
2. Check server logs for backend errors
3. Verify all environment variables are set correctly
4. Test database connectivity separately

## Monitoring

### Application Logs
- Server logs include request/response information
- Email sending status is logged
- Authentication events are tracked

### Database Monitoring
- Monitor connection pool usage
- Track query performance
- Set up database backups

### User Activity
- User login/logout events are logged
- Task creation and updates are tracked
- Failed authentication attempts are recorded

This deployment guide should help you get BLHS Flow running in your preferred environment. For additional support, refer to the main README.md file or create an issue in the repository.