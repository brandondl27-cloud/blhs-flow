import { storage } from "./storage";
import { Task, User, InsertCalendarEvent } from "@shared/schema";

interface CalendarEventData {
  task: Task;
  assignees: User[];
  createdBy: User;
}

class CalendarIntegration {
  async createTaskEvent(data: CalendarEventData): Promise<void> {
    try {
      const { task, assignees, createdBy } = data;
      
      // Create calendar event for the task
      const eventData: InsertCalendarEvent = {
        title: `Task: ${task.title}`,
        description: this.generateTaskEventDescription(task, assignees, createdBy),
        date: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        startTime: task.dueDate ? this.getEventTime(task.dueDate) : '09:00',
        endTime: task.dueDate ? this.getEventEndTime(task.dueDate) : '10:00',
        type: 'task',
        location: task.category || 'General',
        priority: task.priority,
        color: this.getTaskEventColor(task.priority),
        createdBy: createdBy.id,
      };

      await storage.createCalendarEvent(eventData);
      
      console.log(`Calendar event created for task: ${task.title}`);
    } catch (error) {
      console.error('Failed to create calendar event for task:', error);
    }
  }

  async updateTaskEvent(taskId: number, updatedTask: Partial<Task>): Promise<void> {
    try {
      // Find existing calendar events for this task
      const events = await storage.getCalendarEventsByTask(taskId);
      
      for (const event of events) {
        const updateData: Partial<InsertCalendarEvent> = {};
        
        if (updatedTask.title) {
          updateData.title = `Task: ${updatedTask.title}`;
        }
        
        if (updatedTask.dueDate) {
          updateData.date = new Date(updatedTask.dueDate).toISOString().split('T')[0];
          updateData.startTime = this.getEventTime(updatedTask.dueDate);
          updateData.endTime = this.getEventEndTime(updatedTask.dueDate);
        }
        
        if (updatedTask.priority) {
          updateData.priority = updatedTask.priority;
          updateData.color = this.getTaskEventColor(updatedTask.priority);
        }
        
        if (Object.keys(updateData).length > 0) {
          await storage.updateCalendarEvent(event.id, updateData);
        }
      }
      
      console.log(`Calendar events updated for task ID: ${taskId}`);
    } catch (error) {
      console.error('Failed to update calendar events for task:', error);
    }
  }

  async deleteTaskEvent(taskId: number): Promise<void> {
    try {
      // Find and delete calendar events for this task
      const events = await storage.getCalendarEventsByTask(taskId);
      
      for (const event of events) {
        await storage.deleteCalendarEvent(event.id);
      }
      
      console.log(`Calendar events deleted for task ID: ${taskId}`);
    } catch (error) {
      console.error('Failed to delete calendar events for task:', error);
    }
  }

  async createTaskDeadlineReminders(): Promise<void> {
    try {
      // Get all upcoming tasks within the next 3 days
      const upcomingTasks = await storage.getUpcomingTasks(3);
      
      for (const task of upcomingTasks) {
        const reminderDate = this.calculateReminderDate(task.dueDate!);
        
        if (this.shouldCreateReminder(reminderDate)) {
          const reminderEvent: InsertCalendarEvent = {
            title: `Reminder: ${task.title}`,
            description: `Task deadline reminder - Due: ${new Date(task.dueDate!).toLocaleDateString()}`,
            date: reminderDate.toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '09:30',
            type: 'reminder',
            priority: task.priority,
            color: '#ff9800', // Orange for reminders
            createdBy: task.createdById,
          };

          await storage.createCalendarEvent(reminderEvent);
        }
      }
    } catch (error) {
      console.error('Failed to create task deadline reminders:', error);
    }
  }

  private generateTaskEventDescription(task: Task, assignees: User[], createdBy: User): string {
    const assigneeNames = assignees.map(u => `${u.firstName} ${u.lastName}`).join(', ');
    
    return `
Task Assignment Details:

Description: ${task.description || 'No description provided'}
Assigned to: ${assigneeNames}
Created by: ${createdBy.firstName} ${createdBy.lastName}
Category: ${task.category || 'General'}
Priority: ${task.priority}
Status: ${task.status}

${task.tags?.length ? `Tags: ${task.tags.join(', ')}` : ''}
`.trim();
  }

  private getEventTime(dueDate: string): string {
    const date = new Date(dueDate);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private getEventEndTime(dueDate: string): string {
    const date = new Date(dueDate);
    date.setHours(date.getHours() + 1); // Add 1 hour duration
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private getTaskEventColor(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high': return '#ef4444';    // Red
      case 'medium': return '#f59e0b';  // Yellow
      case 'low': return '#10b981';     // Green
      default: return '#6b7280';       // Gray
    }
  }

  private calculateReminderDate(dueDate: string): Date {
    const due = new Date(dueDate);
    const reminder = new Date(due);
    reminder.setDate(due.getDate() - 1); // 1 day before due date
    return reminder;
  }

  private shouldCreateReminder(reminderDate: Date): boolean {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Only create reminder if it's for tomorrow or later
    return reminderDate >= tomorrow;
  }
}

export const calendarIntegration = new CalendarIntegration();