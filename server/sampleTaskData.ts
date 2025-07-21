import { storage } from "./storage";

// Sample tasks to demonstrate heat map functionality
export async function createSampleTasks(userId: string) {
  const sampleTasks = [
    // Week 1 - Light workload
    {
      title: "Prepare Weekly Faculty Meeting Agenda",
      description: "Create agenda items for upcoming faculty meeting including curriculum updates and administrative announcements.",
      priority: "medium" as const,
      status: "todo" as const,
      dueDate: new Date(2025, 6, 21).toISOString(), // July 21, 2025
      category: "Administration",
      createdById: userId,
      assignedTo: [userId],
      tags: ["faculty", "meeting", "agenda"],
      progress: 0
    },
    {
      title: "Review Student Assessment Reports",
      description: "Analyze quarterly assessment data and prepare summary for academic committee.",
      priority: "high" as const,
      status: "in_progress" as const,
      dueDate: new Date(2025, 6, 23).toISOString(), // July 23, 2025
      category: "Academic",
      createdById: userId,
      assignedTo: [userId],
      tags: ["assessment", "reports", "academic"],
      progress: 35
    },

    // Week 2 - Moderate workload
    {
      title: "Plan Summer Professional Development Workshop",
      description: "Design curriculum and coordinate logistics for teacher training workshop on digital learning tools.",
      priority: "medium" as const,
      status: "todo" as const,
      dueDate: new Date(2025, 6, 28).toISOString(), // July 28, 2025
      category: "Professional Development",
      createdById: userId,
      assignedTo: [userId],
      tags: ["workshop", "training", "teachers"],
      progress: 0
    },
    {
      title: "Update School Safety Protocols",
      description: "Review and update emergency procedures and safety protocols for the upcoming school year.",
      priority: "high" as const,
      status: "todo" as const,
      dueDate: new Date(2025, 6, 29).toISOString(), // July 29, 2025
      category: "Safety",
      createdById: userId,
      assignedTo: [userId],
      tags: ["safety", "protocols", "emergency"],
      progress: 0
    },
    {
      title: "Coordinate Parent-Teacher Conference Schedule",
      description: "Organize scheduling system for fall parent-teacher conferences and send invitations.",
      priority: "medium" as const,
      status: "todo" as const,
      dueDate: new Date(2025, 6, 30).toISOString(), // July 30, 2025
      category: "Parent Relations",
      createdById: userId,
      assignedTo: [userId],
      tags: ["conferences", "parents", "scheduling"],
      progress: 0
    },

    // Week 3 - High workload (demonstrate busy period)
    {
      title: "Finalize Fall Semester Course Catalog",
      description: "Complete course descriptions, prerequisites, and scheduling for fall semester publication.",
      priority: "high" as const,
      status: "in_progress" as const,
      dueDate: new Date(2025, 7, 4).toISOString(), // August 4, 2025
      category: "Academic Planning",
      createdById: userId,
      assignedTo: [userId],
      tags: ["catalog", "courses", "fall"],
      progress: 60
    },
    {
      title: "Conduct New Teacher Orientation Planning",
      description: "Prepare materials and coordinate sessions for incoming faculty orientation program.",
      priority: "high" as const,
      status: "todo" as const,
      dueDate: new Date(2025, 7, 4).toISOString(), // August 4, 2025 (same day - busy!)
      category: "Staff Development",
      createdById: userId,
      assignedTo: [userId],
      tags: ["orientation", "new-teachers", "training"],
      progress: 0
    },
    {
      title: "Review Budget Proposals for Next Year",
      description: "Analyze department budget requests and prepare recommendations for administration.",
      priority: "high" as const,
      status: "todo" as const,
      dueDate: new Date(2025, 7, 5).toISOString(), // August 5, 2025
      category: "Budget",
      createdById: userId,
      assignedTo: [userId],
      tags: ["budget", "proposals", "finance"],
      progress: 0
    },
    {
      title: "Implement Student Information System Updates",
      description: "Deploy software updates and train staff on new student management system features.",
      priority: "medium" as const,
      status: "todo" as const,
      dueDate: new Date(2025, 7, 5).toISOString(), // August 5, 2025 (another busy day)
      category: "Technology",
      createdById: userId,
      assignedTo: [userId],
      tags: ["software", "training", "system"],
      progress: 0
    },
    {
      title: "Organize Back-to-School Community Event",
      description: "Plan and coordinate annual back-to-school night for families and community members.",
      priority: "medium" as const,
      status: "todo" as const,
      dueDate: new Date(2025, 7, 6).toISOString(), // August 6, 2025
      category: "Community Relations",
      createdById: userId,
      assignedTo: [userId],
      tags: ["event", "community", "back-to-school"],
      progress: 0
    },

    // Week 4 - Mixed workload with some overdue tasks
    {
      title: "Complete Annual Security Audit",
      description: "Conduct comprehensive security review of facilities and update security measures.",
      priority: "high" as const,
      status: "todo" as const,
      dueDate: new Date(2025, 6, 15).toISOString(), // July 15, 2025 (overdue)
      category: "Security",
      createdById: userId,
      assignedTo: [userId],
      tags: ["audit", "security", "facilities"],
      progress: 0
    },
    {
      title: "Update Website with Fall Information",
      description: "Refresh school website with updated policies, staff directory, and fall semester information.",
      priority: "low" as const,
      status: "completed" as const,
      dueDate: new Date(2025, 7, 12).toISOString(), // August 12, 2025
      category: "Communications",
      createdById: userId,
      assignedTo: [userId],
      tags: ["website", "updates", "fall"],
      progress: 100
    },
    {
      title: "Prepare Annual Report for School Board",
      description: "Compile statistics, achievements, and goals for annual presentation to school board.",
      priority: "high" as const,
      status: "in_progress" as const,
      dueDate: new Date(2025, 7, 15).toISOString(), // August 15, 2025
      category: "Reporting",
      createdById: userId,
      assignedTo: [userId],
      tags: ["report", "board", "annual"],
      progress: 25
    }
  ];

  console.log('Creating sample tasks for heat map demonstration...');
  
  const createdTasks = [];
  for (const taskData of sampleTasks) {
    try {
      const task = await storage.createTask(taskData);
      createdTasks.push(task);
    } catch (error) {
      console.error('Error creating sample task:', error);
    }
  }

  console.log(`Created ${createdTasks.length} sample tasks for heat map`);
  return createdTasks;
}