import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupSimpleAuth, isAuthenticated } from "./simpleAuth";
import { 
  insertTaskSchema, 
  insertTaskCommentSchema,
  insertTaskAttachmentSchema,
  insertDepartmentSchema,
} from "@shared/schema";
import { generateTaskSuggestions } from "./openai";
import { emailService } from "./emailService";
import { calendarIntegration } from "./calendarIntegration";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Password generation utility
function generateTemporaryPassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupSimpleAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/activity", isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activity = await storage.getTeamActivity(limit);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching team activity:", error);
      res.status(500).json({ message: "Failed to fetch team activity" });
    }
  });

  // Task routes
  app.get("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { status, limit, type } = req.query;
      
      let filters: any = {};
      
      if (type === 'assigned') {
        filters.assignedTo = userId;
      } else if (type === 'created') {
        filters.createdBy = userId;
      } else {
        // Default: show both assigned and created tasks
        // This will be handled in the storage layer
      }
      
      if (status) filters.status = status;
      if (limit) filters.limit = parseInt(limit);
      
      const tasks = await storage.getTasks(filters);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Process dueDate if it's provided as string
      const taskData = { ...req.body };
      if (taskData.dueDate && typeof taskData.dueDate === 'string') {
        taskData.dueDate = new Date(taskData.dueDate);
      }
      
      const validatedData = insertTaskSchema.parse({
        ...taskData,
        createdById: userId,
      });
      
      const task = await storage.createTask(validatedData);
      
      // Get user information for notifications
      const createdBy = await storage.getUser(userId);
      
      // Send real-time notification
      const assignedUsers = task.assignedTo || [];
      const notificationUsers = [...assignedUsers, task.createdById].filter(id => id !== userId);
      
      if (notificationUsers.length > 0) {
        (app as any).broadcastToUsers(notificationUsers, {
          title: 'New Task Assigned',
          message: `You have been assigned a new task: ${task.title}`,
          type: 'task_assigned',
          taskId: task.id,
          severity: 'info'
        });
      }

      // Send email notifications and create calendar events
      if (assignedUsers.length > 0 && createdBy) {
        // Get assignee details
        const assignees = await Promise.all(
          assignedUsers.map(id => storage.getUser(id))
        );
        const validAssignees = assignees.filter(Boolean);
        
        // Send email notifications to each assignee
        for (const assignee of validAssignees) {
          if (assignee && assignee.email) {
            try {
              await emailService.sendTaskAssignmentEmail({
                task,
                assignee,
                assigner: createdBy
              });
              console.log(`Email notification sent to ${assignee.email} for task: ${task.title}`);
            } catch (emailError) {
              console.error(`Failed to send email to ${assignee.email}:`, emailError);
            }
          }
        }
        
        // Create calendar event for task
        try {
          await calendarIntegration.createTaskEvent({
            task,
            assignees: validAssignees,
            createdBy
          });
          console.log(`Calendar event created for task: ${task.title}`);
        } catch (calendarError) {
          console.error(`Failed to create calendar event for task ${task.title}:`, calendarError);
        }
      }
      
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updates = req.body;
      const userId = req.user.claims.sub;
      
      const originalTask = await storage.getTask(taskId);
      const task = await storage.updateTask(taskId, updates);
      
      // Send real-time notifications for status changes
      if (originalTask && task) {
        const assignedUsers = task.assignedTo || [];
        const notificationUsers = [...assignedUsers, task.createdById].filter(id => id !== userId);
        
        if (originalTask.status !== task.status && notificationUsers.length > 0) {
          let message = '';
          let severity = 'info';
          
          if (task.status === 'completed') {
            message = `Task "${task.title}" has been completed`;
            severity = 'success';
          } else if (task.status === 'in_progress') {
            message = `Task "${task.title}" is now in progress`;
          } else if (task.status === 'pending') {
            message = `Task "${task.title}" status updated to pending`;
          }
          
          if (message) {
            (app as any).broadcastToUsers(notificationUsers, {
              title: 'Task Status Updated',
              message,
              type: 'task_updated',
              taskId: task.id,
              severity
            });
          }
        }
        
        // Notify about progress updates
        if (originalTask.progress !== task.progress && notificationUsers.length > 0) {
          (app as any).broadcastToUsers(notificationUsers, {
            title: 'Task Progress Updated',
            message: `Task "${task.title}" progress updated to ${task.progress}%`,
            type: 'task_progress',
            taskId: task.id,
            severity: 'info'
          });
        }
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      await storage.deleteTask(taskId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Task comments
  app.get("/api/tasks/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const comments = await storage.getTaskComments(taskId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/tasks/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const validatedData = insertTaskCommentSchema.parse({
        taskId,
        userId,
        content: req.body.content,
      });
      
      const comment = await storage.createTaskComment(validatedData);
      const task = await storage.getTask(taskId);
      
      // Send real-time notification for new comments
      if (task) {
        const assignedUsers = task.assignedTo || [];
        const notificationUsers = [...assignedUsers, task.createdById].filter(id => id !== userId);
        
        if (notificationUsers.length > 0) {
          (app as any).broadcastToUsers(notificationUsers, {
            title: 'New Comment',
            message: `New comment on task "${task.title}"`,
            type: 'task_comment',
            taskId: task.id,
            severity: 'info'
          });
        }
      }
      
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Task attachments
  app.get("/api/tasks/:id/attachments", isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const attachments = await storage.getTaskAttachments(taskId);
      res.json(attachments);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      res.status(500).json({ message: "Failed to fetch attachments" });
    }
  });

  app.post("/api/tasks/:id/attachments", isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const validatedData = insertTaskAttachmentSchema.parse({
        taskId,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        uploadedById: userId,
      });
      
      const attachment = await storage.createTaskAttachment(validatedData);
      res.status(201).json(attachment);
    } catch (error) {
      console.error("Error uploading attachment:", error);
      res.status(500).json({ message: "Failed to upload attachment" });
    }
  });

  app.delete("/api/attachments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const attachmentId = parseInt(req.params.id);
      await storage.deleteTaskAttachment(attachmentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting attachment:", error);
      res.status(500).json({ message: "Failed to delete attachment" });
    }
  });

  // AI Suggestions
  app.get("/api/suggestions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const suggestions = await storage.getUserSuggestions(userId, limit);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      res.status(500).json({ message: "Failed to fetch suggestions" });
    }
  });

  app.post("/api/suggestions/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's recent tasks for context
      const recentTasks = await storage.getTasks({
        assignedTo: userId,
        limit: 20,
      });

      const suggestions = await generateTaskSuggestions(user, recentTasks);
      
      // Save suggestions to database
      const savedSuggestions = [];
      for (const suggestion of suggestions) {
        const saved = await storage.createAiSuggestion({
          userId,
          ...suggestion,
        });
        savedSuggestions.push(saved);
      }
      
      res.json(savedSuggestions);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      res.status(500).json({ message: "Failed to generate suggestions" });
    }
  });

  app.patch("/api/suggestions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const suggestionId = parseInt(req.params.id);
      const updates = req.body;
      
      const suggestion = await storage.updateAiSuggestion(suggestionId, updates);
      res.json(suggestion);
    } catch (error) {
      console.error("Error updating suggestion:", error);
      res.status(500).json({ message: "Failed to update suggestion" });
    }
  });

  // Generate new AI suggestions
  app.post("/api/suggestions/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's recent tasks to analyze patterns
      const userTasks = await storage.getUserTasks(userId);
      
      // Generate educational AI suggestions based on role and patterns
      const suggestions = [];
      
      // Role-based suggestions
      if (user.role === 'Administrator') {
        suggestions.push({
          userId,
          title: 'Schedule Monthly Staff Performance Reviews',
          description: 'Based on your administrative role, consider implementing regular performance reviews to track staff development and institutional goals.',
          confidence: 85,
          reasoning: 'Administrative roles typically require systematic staff oversight. Regular reviews improve communication and help identify professional development needs.'
        });
        
        suggestions.push({
          userId,
          title: 'Implement Student Progress Analytics Dashboard',
          description: 'Create a comprehensive dashboard to track student performance metrics across departments for data-driven decision making.',
          confidence: 78,
          reasoning: 'Administrative oversight benefits from centralized data visualization. This helps identify trends and allocate resources effectively.'
        });
      } else if (user.role === 'Educator') {
        suggestions.push({
          userId,
          title: 'Develop Differentiated Learning Materials',
          description: 'Create varied instructional materials to accommodate different learning styles and abilities in your classroom.',
          confidence: 88,
          reasoning: 'Educational research shows differentiated instruction improves student outcomes. Your role as an educator can directly impact student success through varied approaches.'
        });
        
        suggestions.push({
          userId,
          title: 'Plan Cross-Curricular Project Collaboration',
          description: 'Coordinate with other educators to design interdisciplinary projects that enhance student engagement and learning connections.',
          confidence: 75,
          reasoning: 'Cross-curricular collaboration has been shown to improve student engagement and help students see connections between subjects.'
        });
      } else if (user.role === 'Support Staff') {
        suggestions.push({
          userId,
          title: 'Optimize Student Support Service Workflows',
          description: 'Streamline processes for student counseling, academic support, and resource allocation to improve service delivery.',
          confidence: 82,
          reasoning: 'Support staff efficiency directly impacts student experience. Optimized workflows can reduce wait times and improve service quality.'
        });
        
        suggestions.push({
          userId,
          title: 'Create Student Resource Accessibility Guide',
          description: 'Develop a comprehensive guide helping students navigate available support services and academic resources.',
          confidence: 79,
          reasoning: 'Many students are unaware of available support services. A clear guide can improve resource utilization and student outcomes.'
        });
      }
      
      // Pattern-based suggestions based on task activity
      if (userTasks.length > 0) {
        const hasHighPriorityTasks = userTasks.some(task => task.priority === 'high');
        const hasOverdueTasks = userTasks.some(task => 
          task.dueDate && new Date(task.dueDate) < new Date()
        );
        
        if (hasHighPriorityTasks) {
          suggestions.push({
            userId,
            title: 'Implement Priority Task Management System',
            description: 'Establish a systematic approach to handle high-priority tasks with better time allocation and resource planning.',
            confidence: 83,
            reasoning: 'You have multiple high-priority tasks. A structured approach can help manage workload and reduce stress while maintaining quality.'
          });
        }
        
        if (hasOverdueTasks) {
          suggestions.push({
            userId,
            title: 'Set Up Automated Deadline Reminders',
            description: 'Configure automated notifications and calendar alerts to better track upcoming deadlines and prevent task delays.',
            confidence: 86,
            reasoning: 'You have overdue tasks, suggesting that deadline management could be improved. Automated reminders can help maintain timely task completion.'
          });
        }
      }
      
      // General educational institution suggestions
      suggestions.push({
        userId,
        title: 'Foster Parent-School Communication Initiative',
        description: 'Develop a structured communication plan to improve engagement between families and school staff.',
        confidence: 77,
        reasoning: 'Strong parent-school partnerships are crucial for student success. Regular communication initiatives can improve student outcomes and community satisfaction.'
      });
      
      // Create suggestions in database
      const createdSuggestions = [];
      for (const suggestion of suggestions.slice(0, 3)) { // Limit to 3 suggestions
        const created = await storage.createAiSuggestion(suggestion);
        createdSuggestions.push(created);
      }
      
      res.json(createdSuggestions);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      res.status(500).json({ message: "Failed to generate suggestions" });
    }
  });

  // Admin routes - department management
  app.get('/api/admin/departments', isAuthenticated, async (req: any, res) => {
    // Check if user is admin
    const userRecord = await storage.getUser(req.user.claims.sub);
    if (!userRecord || userRecord.role !== 'Administrator') {
      return res.status(403).json({ message: "Access denied. Administrator role required." });
    }
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.post('/api/admin/departments', isAuthenticated, async (req: any, res) => {
    // Check if user is admin
    const userRecord = await storage.getUser(req.user.claims.sub);
    if (!userRecord || userRecord.role !== 'Administrator') {
      return res.status(403).json({ message: "Access denied. Administrator role required." });
    }
    try {
      const departmentData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(departmentData);
      res.status(201).json(department);
    } catch (error) {
      console.error("Error creating department:", error);
      if (error.code === '23505') {
        res.status(400).json({ message: "Department name already exists" });
      } else {
        res.status(500).json({ message: "Failed to create department" });
      }
    }
  });

  app.patch('/api/admin/departments/:id', isAuthenticated, async (req: any, res) => {
    // Check if user is admin
    const userRecord = await storage.getUser(req.user.claims.sub);
    if (!userRecord || userRecord.role !== 'Administrator') {
      return res.status(403).json({ message: "Access denied. Administrator role required." });
    }
    try {
      const departmentId = parseInt(req.params.id);
      const updates = req.body;
      
      const department = await storage.updateDepartment(departmentId, updates);
      res.json(department);
    } catch (error) {
      console.error("Error updating department:", error);
      res.status(500).json({ message: "Failed to update department" });
    }
  });

  app.delete('/api/admin/departments/:id', isAuthenticated, async (req: any, res) => {
    // Check if user is admin
    const userRecord = await storage.getUser(req.user.claims.sub);
    if (!userRecord || userRecord.role !== 'Administrator') {
      return res.status(403).json({ message: "Access denied. Administrator role required." });
    }
    try {
      const departmentId = parseInt(req.params.id);
      await storage.deleteDepartment(departmentId);
      res.json({ message: "Department deleted successfully" });
    } catch (error) {
      console.error("Error deleting department:", error);
      res.status(500).json({ message: "Failed to delete department" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients with user info
  const clients = new Map<string, Set<WebSocket>>();
  
  wss.on('connection', (ws, request) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'auth' && data.userId) {
          // Associate this WebSocket with a user
          if (!clients.has(data.userId)) {
            clients.set(data.userId, new Set());
          }
          clients.get(data.userId)!.add(ws);
          
          ws.send(JSON.stringify({ 
            type: 'auth_success', 
            message: 'Connected to real-time notifications' 
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      // Remove this WebSocket from all user sets
      for (const [userId, userSockets] of clients.entries()) {
        userSockets.delete(ws);
        if (userSockets.size === 0) {
          clients.delete(userId);
        }
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  // Broadcast notification to specific users
  const broadcastToUsers = (userIds: string[], notification: any) => {
    userIds.forEach(userId => {
      const userSockets = clients.get(userId);
      if (userSockets) {
        const message = JSON.stringify({
          type: 'notification',
          ...notification,
          timestamp: new Date().toISOString()
        });
        
        userSockets.forEach(socket => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(message);
          }
        });
      }
    });
  };
  
  // Broadcast to all connected users
  const broadcastToAll = (notification: any) => {
    const message = JSON.stringify({
      type: 'notification',
      ...notification,
      timestamp: new Date().toISOString()
    });
    
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };
  
  // Attach notification functions to app for use in routes
  (app as any).broadcastToUsers = broadcastToUsers;
  (app as any).broadcastToAll = broadcastToAll;
  
  // Team management routes
  app.get("/api/team/members", isAuthenticated, async (req: any, res) => {
    try {
      const members = await storage.getAllUsers();
      res.json(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.get("/api/team/stats", isAuthenticated, async (req: any, res) => {
    try {
      const members = await storage.getAllUsers();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const stats = {
        totalMembers: members.length,
        administrators: members.filter(m => m.role === 'Administrator').length,
        educators: members.filter(m => m.role === 'Educator').length,
        supportStaff: members.filter(m => m.role === 'Support Staff').length,
        recentJoins: members.filter(m => new Date(m.createdAt) > thirtyDaysAgo).length,
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching team stats:", error);
      res.status(500).json({ message: "Failed to fetch team stats" });
    }
  });

  // Analytics endpoint
  app.get("/api/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // In production, this would gather real analytics data
      // For now, returning sample data that matches the educational context
      const analyticsData = {
        taskMetrics: {
          totalTasks: 156,
          completedTasks: 89,
          inProgressTasks: 42,
          overdueTasks: 25,
          completionRate: 57.1,
          averageCompletionTime: 3.2
        },
        teamMetrics: {
          totalMembers: 24,
          activeMembers: 21,
          newMembers: 3,
          roleDistribution: [
            { role: "Educators", count: 12 },
            { role: "Administrators", count: 6 },
            { role: "Support Staff", count: 6 }
          ]
        },
        productivityMetrics: {
          tasksPerDay: [
            { date: "Mon", tasks: 12 },
            { date: "Tue", tasks: 19 },
            { date: "Wed", tasks: 8 },
            { date: "Thu", tasks: 15 },
            { date: "Fri", tasks: 22 },
            { date: "Sat", tasks: 5 },
            { date: "Sun", tasks: 3 }
          ],
          completionTrend: [
            { week: "Week 1", completed: 45, created: 52 },
            { week: "Week 2", completed: 38, created: 41 },
            { week: "Week 3", completed: 52, created: 48 },
            { week: "Week 4", completed: 61, created: 55 }
          ]
        },
        departmentMetrics: {
          performance: [
            { department: "Academic Affairs", efficiency: 87, tasks: 45 },
            { department: "Student Services", efficiency: 92, tasks: 38 },
            { department: "Administration", efficiency: 78, tasks: 52 },
            { department: "IT Services", efficiency: 95, tasks: 21 }
          ]
        }
      };
      
      res.json(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Admin user management routes
  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user.claims;
      
      // Check if user is admin
      const userRecord = await storage.getUser(currentUser.sub);
      if (!userRecord || userRecord.role !== 'Administrator') {
        return res.status(403).json({ message: "Access denied. Administrator role required." });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user.claims;
      
      // Check if user is admin
      const adminRecord = await storage.getUser(currentUser.sub);
      if (!adminRecord || adminRecord.role !== 'Administrator') {
        return res.status(403).json({ message: "Access denied. Administrator role required." });
      }
      
      const { email, firstName, lastName, role, department } = req.body;
      
      // Generate temporary password for new user
      const temporaryPassword = generateTemporaryPassword();
      
      // Create new user account
      const newUser = await storage.createUser({
        id: `${Date.now()}`, // Generate unique ID
        email,
        firstName,
        lastName,
        role,
        department
      });
      
      // Send welcome email with login instructions
      try {
        const loginUrl = process.env.APP_URL || 'http://localhost:5000';
        const emailSent = await emailService.sendAccountCreatedEmail({
          user: newUser,
          createdBy: adminRecord,
          temporaryPassword,
          loginUrl,
          institutionName: 'BLHS Flow Educational Institution'
        });
        
        if (emailSent) {
          console.log(`Welcome email sent successfully to ${newUser.email}`);
        } else {
          console.log(`Failed to send welcome email to ${newUser.email} - email service not configured`);
        }
      } catch (emailError) {
        console.error(`Error sending welcome email to ${newUser.email}:`, emailError);
        // Don't fail user creation if email fails
      }
      
      // Return user without password for security
      res.json({
        ...newUser,
        emailSent: true,
        temporaryPasswordGenerated: true
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/admin/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user.claims;
      const userId = req.params.id;
      
      // Check if user is admin
      const userRecord = await storage.getUser(currentUser.sub);
      if (!userRecord || userRecord.role !== 'Administrator') {
        return res.status(403).json({ message: "Access denied. Administrator role required." });
      }
      
      const updateData = req.body;
      const updatedUser = await storage.updateUser(userId, updateData);
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user.claims;
      const userId = req.params.id;
      
      // Check if user is admin
      const userRecord = await storage.getUser(currentUser.sub);
      if (!userRecord || userRecord.role !== 'Administrator') {
        return res.status(403).json({ message: "Access denied. Administrator role required." });
      }
      
      // Prevent self-deletion
      if (userId === currentUser.sub) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      await storage.deleteUser(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Password management routes (Admin only)
  app.post("/api/admin/users/:id/reset-password", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user.claims;
      const userId = req.params.id;
      const { newPassword } = req.body;
      
      // Check if user is admin
      const userRecord = await storage.getUser(currentUser.sub);
      if (!userRecord || userRecord.role !== 'Administrator') {
        return res.status(403).json({ message: "Access denied. Administrator role required." });
      }
      
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      
      // Hash the new password
      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash(newPassword, 10);
      
      // Update user password
      await storage.updateUserPassword(userId, passwordHash);
      
      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  app.post("/api/admin/users/:id/generate-password", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user.claims;
      const userId = req.params.id;
      
      // Check if user is admin
      const adminRecord = await storage.getUser(currentUser.sub);
      if (!adminRecord || adminRecord.role !== 'Administrator') {
        return res.status(403).json({ message: "Access denied. Administrator role required." });
      }
      
      // Get target user
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Generate new temporary password
      const temporaryPassword = generateTemporaryPassword();
      
      // Hash the new password
      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash(temporaryPassword, 10);
      
      // Update user password
      await storage.updateUserPassword(userId, passwordHash);
      
      // Send password reset email with new credentials
      try {
        const loginUrl = process.env.APP_URL || 'http://localhost:5000';
        const emailSent = await emailService.sendAccountCreatedEmail({
          user: targetUser,
          createdBy: adminRecord,
          temporaryPassword,
          loginUrl,
          institutionName: 'BLHS Flow Educational Institution'
        });
        
        if (emailSent) {
          console.log(`Password reset email sent successfully to ${targetUser.email}`);
        } else {
          console.log(`Failed to send password reset email to ${targetUser.email} - email service not configured`);
        }
      } catch (emailError) {
        console.error(`Error sending password reset email to ${targetUser.email}:`, emailError);
        // Don't fail password reset if email fails
      }
      
      res.json({ 
        success: true, 
        message: "New password generated and email sent",
        temporaryPassword, // Return for admin to copy if needed
        emailSent: true
      });
    } catch (error) {
      console.error("Error generating password:", error);
      res.status(500).json({ message: "Failed to generate password" });
    }
  });

  // Email service configuration endpoints
  app.get("/api/admin/email-config", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user.claims;
      
      // Check if user is admin
      const userRecord = await storage.getUser(currentUser.sub);
      if (!userRecord || userRecord.role !== 'Administrator') {
        return res.status(403).json({ message: "Access denied. Administrator role required." });
      }
      
      // Return email configuration status (without sensitive details)
      const emailConfigured = !!(
        (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ||
        (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) ||
        (process.env.OUTLOOK_USER && process.env.OUTLOOK_PASSWORD)
      );
      
      const config = {
        emailConfigured,
        smtpConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
        gmailConfigured: !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
        outlookConfigured: !!(process.env.OUTLOOK_USER && process.env.OUTLOOK_PASSWORD),
        lastEmailTest: null // Could add email test timestamp from storage
      };
      
      res.json(config);
    } catch (error) {
      console.error("Error fetching email config:", error);
      res.status(500).json({ message: "Failed to fetch email configuration" });
    }
  });

  app.post("/api/admin/email-test", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user.claims;
      const { testEmail } = req.body;
      
      // Check if user is admin
      const userRecord = await storage.getUser(currentUser.sub);
      if (!userRecord || userRecord.role !== 'Administrator') {
        return res.status(403).json({ message: "Access denied. Administrator role required." });
      }
      
      // Test email connection and send test email
      const emailTestResult = await emailService.testEmailConnection();
      
      if (emailTestResult && testEmail) {
        // Send test email
        const testEmailSent = await emailService.sendWelcomeEmail({
          user: { ...userRecord, email: testEmail },
          temporaryPassword: 'TEST-PASSWORD-123',
          loginUrl: process.env.APP_URL || 'http://localhost:5000',
          institutionName: 'BLHS Flow Educational Institution'
        });
        
        res.json({ 
          success: testEmailSent,
          message: testEmailSent ? 'Test email sent successfully' : 'Failed to send test email'
        });
      } else {
        res.json({ 
          success: false,
          message: 'Email service not configured or connection failed'
        });
      }
    } catch (error) {
      console.error("Error testing email:", error);
      res.status(500).json({ message: "Failed to test email service" });
    }
  });

  // Admin settings routes
  app.get("/api/admin/settings", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user.claims;
      
      // Check if user is admin
      const userRecord = await storage.getUser(currentUser.sub);
      if (!userRecord || userRecord.role !== 'Administrator') {
        return res.status(403).json({ message: "Access denied. Administrator role required." });
      }
      
      // Return mock settings - in production this would come from database
      const settings = {
        general: {
          institutionName: "Beacon Learning High School",
          institutionType: "High School",
          timezone: "America/New_York",
          language: "English",
          academicYear: "2024-2025"
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          taskReminders: true,
          overdueAlerts: true,
          weeklyReports: false
        },
        security: {
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireNumbers: true,
            requireSymbols: false
          },
          sessionTimeout: 24,
          twoFactorRequired: false,
          ipWhitelist: []
        },
        integration: {
          emailProvider: "smtp",
          smsProvider: "none",
          calendarSync: false,
          singleSignOn: false
        }
      };
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/admin/settings", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user.claims;
      
      // Check if user is admin
      const userRecord = await storage.getUser(currentUser.sub);
      if (!userRecord || userRecord.role !== 'Administrator') {
        return res.status(403).json({ message: "Access denied. Administrator role required." });
      }
      
      // In production, save settings to database
      const settings = req.body;
      
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Error saving settings:", error);
      res.status(500).json({ message: "Failed to save settings" });
    }
  });

  // Reports routes
  app.get("/api/reports", isAuthenticated, async (req: any, res) => {
    try {
      // In production, this would fetch real report data from database
      const reports = [
        {
          id: "1",
          name: "Monthly Productivity Report",
          type: "productivity",
          generatedAt: new Date().toISOString(),
          period: "January 2025",
          status: "completed",
          downloadUrl: "/reports/productivity-jan-2025.pdf"
        }
      ];
      
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post("/api/reports/generate", isAuthenticated, async (req: any, res) => {
    try {
      const { reportType, period, department } = req.body;
      
      // In production, this would trigger actual report generation
      const newReport = {
        id: Date.now().toString(),
        name: `${reportType} Report`,
        type: reportType,
        generatedAt: new Date().toISOString(),
        period,
        status: "processing"
      };
      
      res.json(newReport);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Calendar routes
  app.get("/api/calendar/events", isAuthenticated, async (req: any, res) => {
    try {
      // In production, this would fetch real calendar events from database
      const events = [
        {
          id: "1",
          title: "Faculty Meeting",
          description: "Monthly departmental meeting",
          startTime: "09:00",
          endTime: "10:30",
          date: "2025-01-20",
          type: "meeting",
          location: "Conference Room A",
          priority: "high",
          color: "#3b82f6"
        }
      ];
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.post("/api/calendar/events", isAuthenticated, async (req: any, res) => {
    try {
      const eventData = req.body;
      const userId = req.user.claims.sub;
      
      // In production, this would create a real calendar event in database
      const newEvent = {
        id: Date.now().toString(),
        ...eventData,
        createdBy: userId,
        createdAt: new Date().toISOString()
      };
      
      res.json(newEvent);
    } catch (error) {
      console.error("Error creating calendar event:", error);
      res.status(500).json({ message: "Failed to create calendar event" });
    }
  });

  // User profile testing routes
  app.post("/api/test/create-users", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user.claims;
      
      // Only allow administrators to create test users
      const user = await storage.getUser(currentUser.sub);
      if (!user || user.role !== 'Administrator') {
        return res.status(403).json({ message: "Only administrators can create test users" });
      }
      
      const { createTestUsers } = await import("./testUsers");
      await createTestUsers();
      
      res.json({ success: true, message: 'Test users created successfully' });
    } catch (error) {
      console.error("Error creating test users:", error);
      res.status(500).json({ message: "Failed to create test users" });
    }
  });

  app.post("/api/test/create-data", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user.claims;
      
      // Only allow administrators to create test data
      const user = await storage.getUser(currentUser.sub);
      if (!user || user.role !== 'Administrator') {
        return res.status(403).json({ message: "Only administrators can create test data" });
      }
      
      const { createTestData } = await import("./testData");
      await createTestData();
      
      res.json({ success: true, message: 'Test data created successfully' });
    } catch (error) {
      console.error("Error creating test data:", error);
      res.status(500).json({ message: "Failed to create test data" });
    }
  });

  app.get("/api/test/users", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user.claims;
      
      // Only allow administrators to view test users
      const user = await storage.getUser(currentUser.sub);
      if (!user || user.role !== 'Administrator') {
        return res.status(403).json({ message: "Only administrators can view test users" });
      }
      
      const { getAllTestUsers } = await import("./testUsers");
      const testUsers = getAllTestUsers();
      
      res.json(testUsers);
    } catch (error) {
      console.error("Error fetching test users:", error);
      res.status(500).json({ message: "Failed to fetch test users" });
    }
  });

  app.post("/api/test/switch-user", isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = req.user.claims;
      const { targetUserId } = req.body;
      
      // Only allow administrators to switch users
      const user = await storage.getUser(currentUser.sub);
      if (!user || user.role !== 'Administrator') {
        return res.status(403).json({ message: "Only administrators can switch users" });
      }
      
      // Get target user details
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "Target user not found" });
      }
      
      // In a real application, you would implement proper user switching
      // For testing purposes, we'll return the target user profile
      res.json({ 
        success: true, 
        message: `Switched to user: ${targetUser.firstName} ${targetUser.lastName}`,
        user: targetUser 
      });
    } catch (error) {
      console.error("Error switching user:", error);
      res.status(500).json({ message: "Failed to switch user" });
    }
  });

  // Email configuration check endpoint
  app.get("/api/email/config", isAuthenticated, async (req: any, res) => {
    try {
      const isConfigured = await emailService.testEmailConnection();
      const { getEmailSetupInstructions } = await import("./emailTemplates");
      
      res.json({
        configured: isConfigured,
        instructions: getEmailSetupInstructions()
      });
    } catch (error) {
      console.error("Error checking email configuration:", error);
      res.status(500).json({ message: "Failed to check email configuration" });
    }
  });

  // Test email endpoint
  app.post("/api/email/test", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.email) {
        return res.status(400).json({ message: "User email not found" });
      }

      // Create a test task for email testing
      const testTask = {
        id: 999,
        title: "Test Email Notification",
        description: "This is a test email to verify email notifications are working correctly.",
        priority: "medium",
        status: "todo",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        category: "Testing",
        createdById: userId,
        assignedTo: [userId],
        tags: ["test", "email"],
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const success = await emailService.sendTaskAssignmentEmail({
        task: testTask as any,
        assignee: user,
        assigner: user
      });

      res.json({ 
        success, 
        message: success 
          ? `Test email sent to ${user.email}` 
          : 'Failed to send test email - check email configuration'
      });
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

  // Management Dashboard Routes
  app.get("/api/management/team", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'Management' && user.role !== 'Administrator')) {
        return res.status(403).json({ message: "Management access required" });
      }
      
      const teamMembers = await storage.getAllUsers();
      res.json(teamMembers);
    } catch (error) {
      console.error("Error fetching team for management:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.get("/api/management/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'Management' && user.role !== 'Administrator')) {
        return res.status(403).json({ message: "Management access required" });
      }
      
      // Get all tasks for management oversight
      const allTasks = await storage.getAllTasks();
      res.json(allTasks);
    } catch (error) {
      console.error("Error fetching tasks for management:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/management/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'Management' && user.role !== 'Administrator')) {
        return res.status(403).json({ message: "Management access required" });
      }
      
      const teamMembers = await storage.getAllUsers();
      const allTasks = await storage.getAllTasks();
      
      // Calculate analytics for each team member
      const userAnalytics = teamMembers
        .filter(member => member.role !== 'Administrator') // Exclude admins from analytics
        .map(member => {
          const userTasks = allTasks.filter(task => 
            task.assignedTo && task.assignedTo.includes(member.id)
          );
          
          const completedTasks = userTasks.filter(task => task.status === 'completed').length;
          const inProgressTasks = userTasks.filter(task => task.status === 'in_progress').length;
          const overdueTasks = userTasks.filter(task => 
            task.status !== 'completed' && task.dueDate && new Date(task.dueDate) < new Date()
          ).length;
          
          const completionRate = userTasks.length > 0 
            ? Math.round((completedTasks / userTasks.length) * 100) 
            : 0;
          
          // Calculate average completion time (simplified - could be more sophisticated)
          const averageCompletionTime = completedTasks > 0 ? 5 : 0; // Days (placeholder calculation)
          
          return {
            userId: member.id,
            userName: `${member.firstName} ${member.lastName}`,
            totalTasks: userTasks.length,
            completedTasks,
            inProgressTasks,
            overdueTasks,
            completionRate,
            averageCompletionTime,
            recentActivity: userTasks.filter(task => {
              const updatedDate = new Date(task.updatedAt);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return updatedDate > weekAgo;
            }).length
          };
        });
      
      res.json(userAnalytics);
    } catch (error) {
      console.error("Error fetching analytics for management:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Create sample tasks for heat map demonstration
  app.post("/api/create-sample-tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { createSampleTasks } = await import("./sampleTaskData");
      
      const tasks = await createSampleTasks(userId);
      
      res.json({ 
        success: true, 
        message: `Created ${tasks.length} sample tasks for heat map demonstration`,
        tasks: tasks.length
      });
    } catch (error) {
      console.error("Error creating sample tasks:", error);
      res.status(500).json({ message: "Failed to create sample tasks" });
    }
  });

  // Test notification endpoint (for development)
  app.post("/api/test-notification", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      broadcastToUsers([userId], {
        title: 'Test Notification',
        message: 'This is a test notification to verify the WebSocket connection is working properly.',
        type: 'general',
        severity: 'info'
      });
      
      res.json({ success: true, message: 'Test notification sent' });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({ message: "Failed to send test notification" });
    }
  });
  
  return httpServer;
}
