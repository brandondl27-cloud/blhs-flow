import nodemailer from 'nodemailer';
import { Task, User } from '@shared/schema';

interface EmailNotificationData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface TaskAssignmentEmailData {
  task: Task;
  assignee: User;
  assigner: User;
}

interface WelcomeEmailData {
  user: User;
  temporaryPassword: string;
  loginUrl: string;
  institutionName?: string;
}

interface AccountCreatedEmailData {
  user: User;
  createdBy: User;
  temporaryPassword: string;
  loginUrl: string;
  institutionName?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.setupTransporter();
  }

  private setupTransporter() {
    // Configure email transporter - supporting multiple providers
    const emailConfig = this.getEmailConfig();
    
    if (emailConfig) {
      this.transporter = nodemailer.createTransporter(emailConfig);
      console.log('Email service configured successfully');
    } else {
      console.log('Email service not configured - no email provider available');
    }
  }

  private getEmailConfig() {
    // Check for various email service configurations
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      return {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      };
    }

    // Gmail configuration
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      return {
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      };
    }

    // Outlook configuration
    if (process.env.OUTLOOK_USER && process.env.OUTLOOK_PASSWORD) {
      return {
        service: 'hotmail',
        auth: {
          user: process.env.OUTLOOK_USER,
          pass: process.env.OUTLOOK_PASSWORD,
        },
      };
    }

    return null;
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    if (!this.transporter) {
      console.log('Email service not configured - cannot send welcome email');
      return false;
    }

    try {
      const institutionName = data.institutionName || 'BLHS Flow Educational Institution';
      
      const emailData: EmailNotificationData = {
        to: data.user.email!,
        subject: `Welcome to ${institutionName} - Your Account Is Ready`,
        text: this.generateWelcomeEmailText(data, institutionName),
        html: this.generateWelcomeEmailHtml(data, institutionName),
      };

      await this.sendEmail(emailData);
      console.log(`Welcome email sent to ${data.user.email}`);
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  async sendAccountCreatedEmail(data: AccountCreatedEmailData): Promise<boolean> {
    if (!this.transporter) {
      console.log('Email service not configured - cannot send account created email');
      return false;
    }

    try {
      const institutionName = data.institutionName || 'BLHS Flow Educational Institution';
      
      const emailData: EmailNotificationData = {
        to: data.user.email!,
        subject: `Your Account Has Been Created - ${institutionName}`,
        text: this.generateAccountCreatedEmailText(data, institutionName),
        html: this.generateAccountCreatedEmailHtml(data, institutionName),
      };

      await this.sendEmail(emailData);
      console.log(`Account created email sent to ${data.user.email}`);
      return true;
    } catch (error) {
      console.error('Failed to send account created email:', error);
      return false;
    }
  }

  async sendTaskAssignmentEmail(data: TaskAssignmentEmailData): Promise<boolean> {
    if (!this.transporter) {
      console.log('Email service not available - skipping email notification');
      return false;
    }

    try {
      const { task, assignee, assigner } = data;
      
      const emailData = this.generateTaskAssignmentEmail(task, assignee, assigner);
      
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.GMAIL_USER || 'noreply@blhsflow.edu',
        to: assignee.email,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      });

      console.log(`Task assignment email sent to ${assignee.email} for task: ${task.title}`);
      return true;
    } catch (error) {
      console.error('Failed to send task assignment email:', error);
      return false;
    }
  }

  async sendTaskReminderEmail(task: Task, assignee: User): Promise<boolean> {
    if (!this.transporter) {
      console.log('Email service not available - skipping reminder email');
      return false;
    }

    try {
      const emailData = this.generateTaskReminderEmail(task, assignee);
      
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.GMAIL_USER || 'noreply@blhsflow.edu',
        to: assignee.email,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      });

      console.log(`Task reminder email sent to ${assignee.email} for task: ${task.title}`);
      return true;
    } catch (error) {
      console.error('Failed to send task reminder email:', error);
      return false;
    }
  }

  private generateTaskAssignmentEmail(task: Task, assignee: User, assigner: User): EmailNotificationData {
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
    const priorityColor = this.getPriorityColor(task.priority);
    
    const subject = `New Task Assignment: ${task.title}`;
    
    const text = `
Hello ${assignee.firstName},

You have been assigned a new task in BLHS Flow.

Task Details:
- Title: ${task.title}
- Description: ${task.description || 'No description provided'}
- Priority: ${task.priority}
- Due Date: ${dueDate}
- Category: ${task.category || 'General'}
- Assigned by: ${assigner.firstName} ${assigner.lastName}

Please log in to BLHS Flow to view full details and manage this task.

Best regards,
BLHS Flow Team
`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Task Assignment</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">BLHS Flow</h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0;">Educational Institution Management</p>
    </div>
    
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #495057; margin-top: 0;">New Task Assignment</h2>
        
        <p>Hello <strong>${assignee.firstName}</strong>,</p>
        
        <p>You have been assigned a new task in BLHS Flow.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #343a40;">${task.title}</h3>
            
            <div style="margin: 15px 0;">
                <span style="background: ${priorityColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; text-transform: uppercase; font-weight: bold;">
                    ${task.priority} Priority
                </span>
            </div>
            
            ${task.description ? `<p style="margin: 15px 0;"><strong>Description:</strong><br>${task.description}</p>` : ''}
            
            <div style="margin: 15px 0;">
                <p><strong>Due Date:</strong> ${dueDate}</p>
                <p><strong>Category:</strong> ${task.category || 'General'}</p>
                <p><strong>Assigned by:</strong> ${assigner.firstName} ${assigner.lastName}</p>
            </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL || 'https://your-app.replit.app'}/tasks" 
               style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                View Task Details
            </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #6c757d; text-align: center;">
            This email was sent by BLHS Flow. Please log in to your account to manage your tasks.
        </p>
    </div>
</body>
</html>
`;

    return { to: assignee.email!, subject, text, html };
  }

  private generateTaskReminderEmail(task: Task, assignee: User): EmailNotificationData {
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
    const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false;
    
    const subject = isOverdue 
      ? `OVERDUE: Task Reminder - ${task.title}`
      : `Task Reminder: ${task.title}`;
    
    const text = `
Hello ${assignee.firstName},

This is a reminder about your ${isOverdue ? 'overdue' : 'upcoming'} task.

Task Details:
- Title: ${task.title}
- Status: ${task.status}
- Due Date: ${dueDate}
- Priority: ${task.priority}

Please log in to BLHS Flow to update this task.

Best regards,
BLHS Flow Team
`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: ${isOverdue ? '#dc3545' : '#28a745'}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Task Reminder</h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0;">${isOverdue ? 'Overdue Task' : 'Upcoming Deadline'}</p>
    </div>
    
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <p>Hello <strong>${assignee.firstName}</strong>,</p>
        
        <p>This is a reminder about your ${isOverdue ? 'overdue' : 'upcoming'} task:</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${isOverdue ? '#dc3545' : '#28a745'}; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #343a40;">${task.title}</h3>
            <p><strong>Status:</strong> ${task.status}</p>
            <p><strong>Due Date:</strong> ${dueDate}</p>
            <p><strong>Priority:</strong> ${task.priority}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL || 'https://your-app.replit.app'}/tasks" 
               style="background: ${isOverdue ? '#dc3545' : '#28a745'}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Update Task
            </a>
        </div>
    </div>
</body>
</html>
`;

    return { to: assignee.email!, subject, text, html };
  }

  private generateWelcomeEmailText(data: WelcomeEmailData, institutionName: string): string {
    return `
Welcome to ${institutionName}!

Dear ${data.user.firstName || 'New User'},

Welcome to ${institutionName}! Your account has been successfully created and you're ready to start using BLHS Flow.

Your Account Details:
- Email: ${data.user.email}
- Temporary Password: ${data.temporaryPassword}
- Role: ${data.user.role}
- Department: ${data.user.department || 'Not specified'}

Getting Started:
1. Log in at: ${data.loginUrl}
2. Use your email and temporary password to access your account
3. Please change your password after your first login for security
4. Complete your profile information in the settings
5. Explore the dashboard and familiarize yourself with the platform

What You Can Do:
- Manage and track tasks efficiently
- Collaborate with team members
- Access AI-powered productivity suggestions
- View analytics and reports
- Manage your calendar and deadlines

If you have any questions or need assistance, please contact your system administrator.

Best regards,
${institutionName} Team

---
This is an automated message from BLHS Flow Educational Management System.
`;
  }

  private generateWelcomeEmailHtml(data: WelcomeEmailData, institutionName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${institutionName}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 15px 15px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Welcome to ${institutionName}!</h1>
        <p style="color: #f0f0f0; margin: 15px 0 0 0; font-size: 18px;">Your BLHS Flow Account is Ready</p>
    </div>
    
    <div style="background: white; padding: 40px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #495057; margin-top: 0; font-size: 24px;">Hello ${data.user.firstName || 'New User'}!</h2>
        
        <p style="font-size: 16px; color: #555;">Welcome to ${institutionName}! Your account has been successfully created and you're ready to start using BLHS Flow.</p>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; border-left: 5px solid #007bff; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #343a40; font-size: 20px;">🔑 Your Account Details</h3>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 15px;">
                <p style="margin: 8px 0;"><strong>Email:</strong> ${data.user.email}</p>
                <p style="margin: 8px 0;"><strong>Temporary Password:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${data.temporaryPassword}</code></p>
                <p style="margin: 8px 0;"><strong>Role:</strong> ${data.user.role}</p>
                <p style="margin: 8px 0;"><strong>Department:</strong> ${data.user.department || 'Not specified'}</p>
            </div>
        </div>
        
        <div style="background: #e7f3ff; padding: 25px; border-radius: 10px; border-left: 5px solid #17a2b8; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #343a40; font-size: 20px;">🚀 Getting Started</h3>
            <ol style="margin: 15px 0; padding-left: 20px;">
                <li style="margin: 8px 0;">Log in using the button below</li>
                <li style="margin: 8px 0;">Use your email and temporary password</li>
                <li style="margin: 8px 0;"><strong>Change your password</strong> after first login</li>
                <li style="margin: 8px 0;">Complete your profile information</li>
                <li style="margin: 8px 0;">Explore the dashboard and features</li>
            </ol>
        </div>
        
        <div style="background: #e8f5e8; padding: 25px; border-radius: 10px; border-left: 5px solid #28a745; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #343a40; font-size: 20px;">✨ What You Can Do</h3>
            <ul style="margin: 15px 0; padding-left: 20px;">
                <li style="margin: 8px 0;">📋 Manage and track tasks efficiently</li>
                <li style="margin: 8px 0;">👥 Collaborate with team members</li>
                <li style="margin: 8px 0;">🤖 Access AI-powered productivity suggestions</li>
                <li style="margin: 8px 0;">📊 View analytics and reports</li>
                <li style="margin: 8px 0;">📅 Manage your calendar and deadlines</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
            <a href="${data.loginUrl}" 
               style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(0,123,255,0.3);">
                🔐 Log In to Your Account
            </a>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 5px solid #ffc107; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #856404;">🔐 Security Reminder</h4>
            <p style="margin: 10px 0; color: #856404; font-size: 14px;">Please change your temporary password immediately after logging in. This ensures the security of your account and institutional data.</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 40px 0;">
        
        <p style="font-size: 14px; color: #6c757d; text-align: center;">
            If you have any questions or need assistance, please contact your system administrator.<br>
            This email was sent by ${institutionName} - BLHS Flow Educational Management System.
        </p>
    </div>
</body>
</html>
`;
  }

  private generateAccountCreatedEmailText(data: AccountCreatedEmailData, institutionName: string): string {
    return `
Your Account Has Been Created at ${institutionName}

Dear ${data.user.firstName || 'New User'},

An account has been created for you at ${institutionName} by ${data.createdBy.firstName} ${data.createdBy.lastName}.

Your Account Details:
- Email: ${data.user.email}
- Temporary Password: ${data.temporaryPassword}
- Role: ${data.user.role}
- Department: ${data.user.department || 'Not specified'}
- Created by: ${data.createdBy.firstName} ${data.createdBy.lastName} (${data.createdBy.role})

Next Steps:
1. Log in at: ${data.loginUrl}
2. Use your email and the temporary password provided above
3. Change your password immediately after first login
4. Complete your profile information
5. Familiarize yourself with the BLHS Flow platform

Your Role Capabilities:
Based on your assigned role (${data.user.role}), you will have access to specific features and responsibilities within the educational management system.

Security Notice:
For security reasons, please change your temporary password during your first login. Do not share your login credentials with anyone.

If you have any questions about your account or need assistance getting started, please contact your system administrator or the person who created your account.

Best regards,
${institutionName} Team

---
Account created by: ${data.createdBy.firstName} ${data.createdBy.lastName}
This is an automated message from BLHS Flow Educational Management System.
`;
  }

  private generateAccountCreatedEmailHtml(data: AccountCreatedEmailData, institutionName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Account Has Been Created</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
    <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px; text-align: center; border-radius: 15px 15px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Account Created!</h1>
        <p style="color: #f0f0f0; margin: 15px 0 0 0; font-size: 18px;">${institutionName}</p>
    </div>
    
    <div style="background: white; padding: 40px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #495057; margin-top: 0; font-size: 24px;">Hello ${data.user.firstName || 'New User'}!</h2>
        
        <p style="font-size: 16px; color: #555;">An account has been created for you at ${institutionName} by <strong>${data.createdBy.firstName} ${data.createdBy.lastName}</strong>.</p>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; border-left: 5px solid #28a745; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #343a40; font-size: 20px;">🔑 Your Account Details</h3>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 15px;">
                <p style="margin: 8px 0;"><strong>Email:</strong> ${data.user.email}</p>
                <p style="margin: 8px 0;"><strong>Temporary Password:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${data.temporaryPassword}</code></p>
                <p style="margin: 8px 0;"><strong>Role:</strong> ${data.user.role}</p>
                <p style="margin: 8px 0;"><strong>Department:</strong> ${data.user.department || 'Not specified'}</p>
                <p style="margin: 8px 0;"><strong>Created by:</strong> ${data.createdBy.firstName} ${data.createdBy.lastName} (${data.createdBy.role})</p>
            </div>
        </div>
        
        <div style="background: #e7f3ff; padding: 25px; border-radius: 10px; border-left: 5px solid #17a2b8; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #343a40; font-size: 20px;">🚀 Next Steps</h3>
            <ol style="margin: 15px 0; padding-left: 20px;">
                <li style="margin: 8px 0;">Log in using the button below</li>
                <li style="margin: 8px 0;">Use your email and temporary password</li>
                <li style="margin: 8px 0;"><strong>Change your password immediately</strong></li>
                <li style="margin: 8px 0;">Complete your profile information</li>
                <li style="margin: 8px 0;">Explore your role-specific features</li>
            </ol>
        </div>
        
        <div style="background: #e8f5e8; padding: 25px; border-radius: 10px; border-left: 5px solid #6f42c1; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #343a40; font-size: 20px;">🎯 Your Role: ${data.user.role}</h3>
            <p style="margin: 15px 0; color: #555;">Based on your assigned role, you will have access to specific features and responsibilities within the educational management system.</p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
            <a href="${data.loginUrl}" 
               style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(40,167,69,0.3);">
                🔐 Log In to Your Account
            </a>
        </div>
        
        <div style="background: #f8d7da; padding: 20px; border-radius: 8px; border-left: 5px solid #dc3545; margin: 25px 0;">
            <h4 style="margin-top: 0; color: #721c24;">🔐 Security Notice</h4>
            <p style="margin: 10px 0; color: #721c24; font-size: 14px;">
                For security reasons, please change your temporary password during your first login. 
                Do not share your login credentials with anyone.
            </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 40px 0;">
        
        <p style="font-size: 14px; color: #6c757d; text-align: center;">
            If you have questions or need assistance, contact your system administrator or ${data.createdBy.firstName} ${data.createdBy.lastName}.<br>
            This email was sent by ${institutionName} - BLHS Flow Educational Management System.
        </p>
    </div>
</body>
</html>
`;
  }

  private async sendEmail(emailData: EmailNotificationData): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email service not configured');
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.GMAIL_USER || 'noreply@blhsflow.edu',
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
    });
  }

  private getPriorityColor(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  }

  async testEmailConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();