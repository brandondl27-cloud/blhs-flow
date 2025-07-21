import { z } from "zod";

// Frontend-only types and schemas for static deployment
// These replace the Drizzle schema imports for client-side usage

// User types
export interface User {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  role: string;
  department?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface UpsertUser {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  role?: string;
  department?: string | null;
}

// Task types
export interface Task {
  id: number;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  assignedTo: string[];
  dueDate?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  createdBy?: string | null;
  tags?: string[] | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  attachments?: string[] | null;
}

export interface InsertTask {
  title: string;
  description?: string;
  priority: string;
  status: string;
  assignedTo: string[];
  dueDate?: string;
  createdBy?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  attachments?: string[];
}

// Task comment types
export interface TaskComment {
  id: number;
  taskId: number;
  userId: string;
  content: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface InsertTaskComment {
  taskId: number;
  userId: string;
  content: string;
}

// AI suggestion types
export interface AISuggestion {
  id: number;
  userId: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  reasoning: string;
  confidence: number;
  accepted?: boolean | null;
  acceptedAt?: Date | null;
  createdAt?: Date | null;
}

export interface InsertAISuggestion {
  userId: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  reasoning: string;
  confidence: number;
  accepted?: boolean;
}

// Activity types
export interface Activity {
  id: number;
  type: string;
  userId: string;
  entityType?: string | null;
  entityId?: number | null;
  metadata?: Record<string, any> | null;
  createdAt?: Date | null;
}

export interface InsertActivity {
  type: string;
  userId: string;
  entityType?: string;
  entityId?: number;
  metadata?: Record<string, any>;
}

// Calendar event types
export interface CalendarEvent {
  id: number;
  title: string;
  description?: string | null;
  startDate: Date;
  endDate: Date;
  allDay?: boolean | null;
  type: string;
  attendees?: string[] | null;
  location?: string | null;
  createdBy: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface InsertCalendarEvent {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  type: string;
  attendees?: string[];
  location?: string;
  createdBy: string;
}

// System settings types
export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  category: string;
  description?: string | null;
  updatedAt?: Date | null;
  updatedBy?: string | null;
}

export interface InsertSystemSetting {
  key: string;
  value: string;
  category: string;
  description?: string;
  updatedBy?: string;
}

// Zod schemas for form validation
export const insertTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  assignedTo: z.array(z.string()).min(1, "At least one assignee required"),
  dueDate: z.string().optional(),
  createdBy: z.string().optional(),
  tags: z.array(z.string()).optional(),
  estimatedHours: z.number().min(0).optional(),
  actualHours: z.number().min(0).optional(),
  attachments: z.array(z.string()).optional(),
});

export const insertTaskCommentSchema = z.object({
  taskId: z.number().min(1),
  userId: z.string().min(1),
  content: z.string().min(1, "Comment content is required"),
});

export const insertAISuggestionSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  type: z.string().min(1),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  reasoning: z.string().min(1),
  confidence: z.number().min(0).max(1),
  accepted: z.boolean().optional(),
});

export const insertCalendarEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  allDay: z.boolean().optional(),
  type: z.enum(["meeting", "deadline", "event", "reminder"]),
  attendees: z.array(z.string()).optional(),
  location: z.string().optional(),
  createdBy: z.string().min(1),
});

export type InsertTaskType = z.infer<typeof insertTaskSchema>;
export type InsertTaskCommentType = z.infer<typeof insertTaskCommentSchema>;
export type InsertAISuggestionType = z.infer<typeof insertAISuggestionSchema>;
export type InsertCalendarEventType = z.infer<typeof insertCalendarEventSchema>;