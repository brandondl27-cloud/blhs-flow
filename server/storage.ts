import {
  users,
  departments,
  tasks,
  taskComments,
  taskAttachments,
  aiSuggestions,
  type User,
  type UpsertUser,
  type Department,
  type InsertDepartment,
  type Task,
  type InsertTask,
  type TaskComment,
  type InsertTaskComment,
  type TaskAttachment,
  type InsertTaskAttachment,
  type AiSuggestion,
  type InsertAiSuggestion,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, inArray, isNotNull, lte, gte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPassword(userId: string, passwordHash: string): Promise<void>;
  
  // Department operations
  getDepartments(): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, updates: Partial<InsertDepartment>): Promise<Department>;
  deleteDepartment(id: number): Promise<void>;
  
  // Task operations
  getTasks(filters?: {
    assignedTo?: string;
    createdBy?: string;
    status?: string;
    limit?: number;
  }): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  
  // Task comment operations
  getTaskComments(taskId: number): Promise<TaskComment[]>;
  createTaskComment(comment: InsertTaskComment): Promise<TaskComment>;
  
  // Task attachment operations
  getTaskAttachments(taskId: number): Promise<TaskAttachment[]>;
  createTaskAttachment(attachment: InsertTaskAttachment): Promise<TaskAttachment>;
  deleteTaskAttachment(id: number): Promise<void>;
  
  // AI suggestion operations
  getUserSuggestions(userId: string, limit?: number): Promise<AiSuggestion[]>;
  createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion>;
  updateAiSuggestion(id: number, updates: Partial<InsertAiSuggestion>): Promise<AiSuggestion>;
  
  // Dashboard statistics
  getDashboardStats(userId: string): Promise<{
    totalTasks: number;
    inProgress: number;
    completed: number;
    dueSoon: number;
  }>;
  
  // Team activity
  getTeamActivity(limit?: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    await db
      .update(users)
      .set({ password_hash: passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Department operations
  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments).orderBy(departments.name);
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department;
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [newDepartment] = await db
      .insert(departments)
      .values(department)
      .returning();
    return newDepartment;
  }

  async updateDepartment(id: number, updates: Partial<InsertDepartment>): Promise<Department> {
    const [updatedDepartment] = await db
      .update(departments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(departments.id, id))
      .returning();
    return updatedDepartment;
  }

  async deleteDepartment(id: number): Promise<void> {
    await db.delete(departments).where(eq(departments.id, id));
  }

  // Task operations
  async getTasks(filters?: {
    assignedTo?: string;
    createdBy?: string;
    status?: string;
    limit?: number;
  }): Promise<Task[]> {
    const conditions = [];
    if (filters?.assignedTo) {
      conditions.push(sql`${filters.assignedTo} = ANY(${tasks.assignedTo})`);
    }
    if (filters?.createdBy) {
      conditions.push(eq(tasks.createdById, filters.createdBy));
    }
    if (filters?.status) {
      conditions.push(eq(tasks.status, filters.status));
    }
    
    if (conditions.length > 0) {
      if (filters?.limit) {
        return await db
          .select()
          .from(tasks)
          .where(and(...conditions))
          .orderBy(desc(tasks.updatedAt))
          .limit(filters.limit);
      } else {
        return await db
          .select()
          .from(tasks)
          .where(and(...conditions))
          .orderBy(desc(tasks.updatedAt));
      }
    } else {
      if (filters?.limit) {
        return await db
          .select()
          .from(tasks)
          .orderBy(desc(tasks.updatedAt))
          .limit(filters.limit);
      } else {
        return await db
          .select()
          .from(tasks)
          .orderBy(desc(tasks.updatedAt));
      }
    }
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Task comment operations
  async getTaskComments(taskId: number): Promise<TaskComment[]> {
    return await db
      .select()
      .from(taskComments)
      .where(eq(taskComments.taskId, taskId))
      .orderBy(desc(taskComments.createdAt));
  }

  async createTaskComment(comment: InsertTaskComment): Promise<TaskComment> {
    const [newComment] = await db.insert(taskComments).values(comment).returning();
    return newComment;
  }

  // Task attachment operations
  async getTaskAttachments(taskId: number): Promise<TaskAttachment[]> {
    return await db
      .select()
      .from(taskAttachments)
      .where(eq(taskAttachments.taskId, taskId))
      .orderBy(desc(taskAttachments.createdAt));
  }

  async createTaskAttachment(attachment: InsertTaskAttachment): Promise<TaskAttachment> {
    const [newAttachment] = await db.insert(taskAttachments).values(attachment).returning();
    return newAttachment;
  }

  async deleteTaskAttachment(id: number): Promise<void> {
    await db.delete(taskAttachments).where(eq(taskAttachments.id, id));
  }

  // AI suggestion operations
  async getUserSuggestions(userId: string, limit = 10): Promise<AiSuggestion[]> {
    return await db
      .select()
      .from(aiSuggestions)
      .where(eq(aiSuggestions.userId, userId))
      .orderBy(desc(aiSuggestions.createdAt))
      .limit(limit);
  }

  async getUserTasks(userId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(
        sql`${userId} = ANY(${tasks.assignedTo}) OR ${tasks.createdById} = ${userId}`
      )
      .orderBy(desc(tasks.createdAt));
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async createUser(userData: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(userId: string, updateData: any): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    await db
      .delete(users)
      .where(eq(users.id, userId));
  }

  async createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const [newSuggestion] = await db.insert(aiSuggestions).values(suggestion).returning();
    return newSuggestion;
  }

  async updateAiSuggestion(id: number, updates: Partial<InsertAiSuggestion>): Promise<AiSuggestion> {
    const [updatedSuggestion] = await db
      .update(aiSuggestions)
      .set(updates)
      .where(eq(aiSuggestions.id, id))
      .returning();
    return updatedSuggestion;
  }

  // Dashboard statistics
  async getDashboardStats(userId: string): Promise<{
    totalTasks: number;
    inProgress: number;
    completed: number;
    dueSoon: number;
  }> {
    const userTasks = await db
      .select()
      .from(tasks)
      .where(
        sql`${userId} = ANY(${tasks.assignedTo}) OR ${tasks.createdById} = ${userId}`
      );

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const stats = {
      totalTasks: userTasks.length,
      inProgress: userTasks.filter(t => t.status === 'in_progress').length,
      completed: userTasks.filter(t => t.status === 'completed').length,
      dueSoon: userTasks.filter(t => 
        t.dueDate && 
        t.status !== 'completed' && 
        new Date(t.dueDate) <= nextWeek
      ).length,
    };

    return stats;
  }

  // Team activity
  async getTeamActivity(limit = 10): Promise<any[]> {
    // Get recent task updates with user information
    const recentTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        updatedAt: tasks.updatedAt,
        createdById: tasks.createdById,
        createdBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.createdById, users.id))
      .orderBy(desc(tasks.updatedAt))
      .limit(limit);

    return recentTasks.map(task => ({
      id: task.id,
      type: 'task_update',
      user: task.createdBy,
      action: task.status === 'completed' ? 'completed' : 'updated',
      taskTitle: task.title,
      timestamp: task.updatedAt,
    }));
  }

  // Calendar operations
  async createCalendarEvent(eventData: any): Promise<any> {
    const [event] = await db
      .insert(calendarEvents)
      .values(eventData)
      .returning();
    return event;
  }

  async getCalendarEventsByTask(taskId: number): Promise<any[]> {
    // For now, return empty array as we need to add task_id to calendar events
    return [];
  }

  async updateCalendarEvent(eventId: number, updateData: any): Promise<any> {
    const [event] = await db
      .update(calendarEvents)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(calendarEvents.id, eventId))
      .returning();
    return event;
  }

  async deleteCalendarEvent(eventId: number): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, eventId));
  }

  async getUpcomingTasks(days: number): Promise<any[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          isNotNull(tasks.dueDate),
          lte(tasks.dueDate, futureDate.toISOString()),
          gte(tasks.dueDate, new Date().toISOString())
        )
      );
  }

  // Management operations
  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users);
    return allUsers;
  }

  async getAllTasks(): Promise<Task[]> {
    const allTasks = await db.select().from(tasks);
    return allTasks;
  }
}

export const storage = new DatabaseStorage();
