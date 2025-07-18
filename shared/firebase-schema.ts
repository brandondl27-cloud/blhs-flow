import { z } from "zod";

// Firebase Firestore Types
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

// User Schema for Firestore
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  profileImageUrl: z.string().nullable(),
  role: z.enum(['Administrator', 'Management', 'Educator', 'Support Staff']),
  department: z.string().nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertUserSchema = userSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Task Schema for Firestore
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(['todo', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date().nullable(),
  assignedTo: z.array(z.string()).default([]), // Array of user IDs
  createdById: z.string(),
  attachments: z.array(z.string()).default([]), // Array of file URLs
  tags: z.array(z.string()).default([]),
  progress: z.number().min(0).max(100).default(0),
  estimatedHours: z.number().nullable(),
  actualHours: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertTaskSchema = taskSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type Task = z.infer<typeof taskSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// Task Comment Schema
export const taskCommentSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  userId: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertTaskCommentSchema = taskCommentSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type TaskComment = z.infer<typeof taskCommentSchema>;
export type InsertTaskComment = z.infer<typeof insertTaskCommentSchema>;

// AI Suggestion Schema
export const aiSuggestionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
  category: z.string(),
  status: z.enum(['pending', 'accepted', 'dismissed']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertAiSuggestionSchema = aiSuggestionSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type AiSuggestion = z.infer<typeof aiSuggestionSchema>;
export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;

// Activity Schema
export const activitySchema = z.object({
  id: z.string(),
  type: z.string(),
  userId: z.string(),
  targetId: z.string().nullable(),
  description: z.string(),
  metadata: z.record(z.any()).nullable(),
  createdAt: z.date(),
});

export const insertActivitySchema = activitySchema.omit({ 
  id: true, 
  createdAt: true 
});

export type Activity = z.infer<typeof activitySchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Calendar Event Schema
export const calendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  startDate: z.date(),
  endDate: z.date(),
  allDay: z.boolean().default(false),
  createdById: z.string(),
  attendees: z.array(z.string()).default([]),
  type: z.enum(['meeting', 'deadline', 'event', 'reminder']),
  location: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertCalendarEventSchema = calendarEventSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type CalendarEvent = z.infer<typeof calendarEventSchema>;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;

// System Settings Schema
export const systemSettingsSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.any(),
  updatedAt: z.date(),
  updatedById: z.string(),
});

export type SystemSettings = z.infer<typeof systemSettingsSchema>;

// Dashboard Stats Schema
export const dashboardStatsSchema = z.object({
  totalTasks: z.number(),
  inProgress: z.number(),
  completed: z.number(),
  overdue: z.number(),
  totalUsers: z.number(),
  activeUsers: z.number(),
  recentActivities: z.number(),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

// Team Stats Schema
export const teamStatsSchema = z.object({
  totalMembers: z.number(),
  administrators: z.number(),
  management: z.number(),
  educators: z.number(),
  supportStaff: z.number(),
  recentJoins: z.number(),
});

export type TeamStats = z.infer<typeof teamStatsSchema>;