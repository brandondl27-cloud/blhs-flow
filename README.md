# BLHS Flow - Work Management Dashboard

A comprehensive web-based work management dashboard designed specifically for educational institutions. Features role-based authentication, task management, AI-powered suggestions, real-time collaboration, and comprehensive administrative capabilities.

## Features

### Core Functionality
- **Role-Based Authentication**: Administrator, Management, Educator, and Support Staff roles
- **Task Management**: Complete CRUD operations with multi-assignee support and progress tracking
- **AI-Powered Suggestions**: OpenAI-powered task recommendations based on user context
- **Real-Time Collaboration**: WebSocket integration for live updates and notifications
- **Team Management**: Advanced user management with filtering and analytics
- **Analytics Dashboard**: Interactive charts and performance metrics
- **Calendar Integration**: Event management and scheduling with task density visualization
- **Mobile Optimization**: Responsive design with dedicated mobile navigation

### Administrative Features
- **User Management**: Create, edit, delete user accounts with automatic email notifications
- **Department Management**: Full CRUD operations for organizational structure
- **Email Integration**: Automated welcome emails with temporary passwords
- **Password Management**: Secure password generation and reset capabilities
- **System Settings**: Comprehensive configuration options
- **Reports & Analytics**: Custom report generation and data visualization

### Email Notification System
- **Welcome Emails**: Automatic email sending when new users are created
- **Password Reset**: Email notifications for password changes
- **Task Assignments**: Email alerts for new task assignments
- **Task Reminders**: Automated deadline notifications
- **Email Setup Page**: Administrative interface for configuring email providers

## Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management
- **Tailwind CSS** with shadcn/ui components
- **React Hook Form** with Zod validation
- **Recharts** for data visualization

### Backend
- **Node.js** with Express.js framework
- **PostgreSQL** with Drizzle ORM
- **Replit Auth** with OpenID Connect integration
- **WebSocket** for real-time features
- **OpenAI API** for AI-powered suggestions
- **Email Service** with SMTP/Gmail/Outlook support

## Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or use Replit's built-in database)
- OpenAI API key for AI features (optional)
- Email provider credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd blhs-flow-github
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables in `.env`:
   ```env
   # Database
   DATABASE_URL=your_postgresql_connection_string
   
   # Authentication (for Replit deployment)
   SESSION_SECRET=your_session_secret
   REPLIT_DOMAINS=your-repl-domain.replit.app
   ISSUER_URL=https://replit.com/oidc
   REPL_ID=your_repl_id
   
   # OpenAI (optional)
   OPENAI_API_KEY=your_openai_api_key
   
   # Email Configuration (choose one)
   # Gmail
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your_app_password
   
   # SMTP
   SMTP_HOST=smtp.your-provider.com
   SMTP_PORT=587
   SMTP_USER=your-email@domain.com
   SMTP_PASS=your_password
   SMTP_FROM=noreply@your-domain.com
   
   # Outlook
   OUTLOOK_USER=your-email@outlook.com
   OUTLOOK_PASSWORD=your_password
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

### Default Admin Account
For testing purposes, you can create an admin account through the application or insert directly into the database:

```sql
INSERT INTO users (id, email, firstName, lastName, role, password_hash, createdAt, updatedAt)
VALUES (
  'admin_user',
  'admin@yourdomain.com',
  'Admin',
  'User',
  'Administrator',
  '$2b$10$hashed_password_here',
  NOW(),
  NOW()
);
```

## Deployment

### Replit Deployment
1. Import this repository into Replit
2. Configure environment variables in Replit's Secrets tab
3. The application will auto-deploy with Replit's built-in PostgreSQL

### Manual Deployment
1. Set up a PostgreSQL database
2. Configure environment variables on your hosting platform
3. Build the application: `npm run build`
4. Start the production server: `npm start`

### Database Migration
Use Drizzle's push command to sync schema changes:
```bash
npm run db:push
```

## Project Structure

```
blhs-flow-github/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── pages/          # Page components
│   │   └── contexts/       # React contexts
├── server/                 # Express backend
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   ├── emailService.ts     # Email notification service
│   └── replitAuth.ts       # Authentication setup
├── shared/                 # Shared type definitions
│   └── schema.ts           # Database schema and types
└── README.md
```

## Key Features Usage

### User Management
1. Navigate to Admin → User Management
2. Click "Add User" to create new accounts
3. Users automatically receive welcome emails with login instructions
4. Use "Generate Password" to reset user passwords

### Email Configuration
1. Go to Admin → Email Setup
2. Configure environment variables for your email provider
3. Test email functionality with the built-in test feature
4. Monitor email configuration status

### Task Management
1. Use the Tasks page to create and manage tasks
2. Assign tasks to multiple users
3. Track progress with visual indicators
4. Users receive email notifications for new assignments

### AI Suggestions
1. Visit the AI Suggestions page for intelligent task recommendations
2. AI analyzes user patterns and educational context
3. Accept or dismiss suggestions to improve recommendations

### Analytics & Reports
1. Access comprehensive analytics from the Analytics page
2. Generate custom reports from the Reports section
3. View calendar heat maps for task density analysis

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature description'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## Support

For issues and questions:
1. Check the existing issues in the repository
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs
4. Provide environment details

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for educational institutions to enhance productivity and collaboration
- Designed with accessibility and user experience in mind
- Optimized for both desktop and mobile usage
- Implements modern web development best practices