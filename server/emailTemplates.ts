// Email configuration instructions for different providers
export const emailConfigInstructions = {
  gmail: {
    name: "Gmail",
    instructions: `
To set up Gmail for email notifications:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Set environment variables:
   - GMAIL_USER=your-email@gmail.com
   - GMAIL_APP_PASSWORD=your-16-character-app-password

Note: Use the 16-character app password, not your regular Gmail password.
`,
    envVars: ["GMAIL_USER", "GMAIL_APP_PASSWORD"]
  },
  
  outlook: {
    name: "Outlook/Hotmail",
    instructions: `
To set up Outlook for email notifications:

1. Enable 2-factor authentication (if not already enabled)
2. Generate an App Password:
   - Go to Microsoft Account Security
   - Advanced security options → App passwords
   - Create new app password for "Email"
3. Set environment variables:
   - OUTLOOK_USER=your-email@outlook.com
   - OUTLOOK_PASSWORD=your-app-password

Works with @outlook.com, @hotmail.com, and @live.com addresses.
`,
    envVars: ["OUTLOOK_USER", "OUTLOOK_PASSWORD"]
  },
  
  smtp: {
    name: "Custom SMTP",
    instructions: `
To set up custom SMTP for email notifications:

1. Get SMTP settings from your email provider
2. Set environment variables:
   - SMTP_HOST=smtp.yourdomain.com
   - SMTP_PORT=587 (or 465 for SSL)
   - SMTP_USER=your-email@yourdomain.com
   - SMTP_PASS=your-password
   - SMTP_SECURE=false (true for port 465)
   - SMTP_FROM=noreply@yourdomain.com (optional)

Common SMTP providers:
- Gmail: smtp.gmail.com:587
- Outlook: smtp-mail.outlook.com:587
- Yahoo: smtp.mail.yahoo.com:587
`,
    envVars: ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"]
  }
};

export function getEmailSetupInstructions(): string {
  return `
# Email Notification Setup

BLHS Flow supports multiple email providers for sending task assignment notifications:

## Option 1: Gmail (Recommended for testing)
${emailConfigInstructions.gmail.instructions}

## Option 2: Outlook/Hotmail
${emailConfigInstructions.outlook.instructions}

## Option 3: Custom SMTP
${emailConfigInstructions.smtp.instructions}

## Testing Email Setup

After configuring your email provider, you can test the connection by:
1. Creating a new task with assignments
2. Checking the server logs for email delivery status
3. Using the test notification endpoint: POST /api/test-notification

## Fallback Behavior

If email configuration is not available:
- Tasks will still be created normally
- Real-time WebSocket notifications will still work
- Calendar events will still be created
- Only email notifications will be skipped

The system gracefully handles missing email configuration without breaking task functionality.
`;
}