import { storage } from "./storage";
import { testUsers } from "./testUsers";

// Sample tasks for different roles and scenarios
export const testTasks = [
  {
    title: "Prepare Q1 Budget Report",
    description: "Compile and analyze quarterly budget data for board presentation",
    status: "in_progress" as const,
    priority: "high" as const,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    assignees: ["test_admin_001"],
    createdById: "test_admin_001",
    category: "Administrative",
    tags: ["budget", "finance", "quarterly"]
  },
  {
    title: "Update Math Curriculum Standards",
    description: "Review and update mathematics curriculum to align with new state standards",
    status: "todo" as const,
    priority: "medium" as const,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
    assignees: ["test_educator_001"],
    createdById: "test_educator_001", 
    category: "Academic",
    tags: ["curriculum", "mathematics", "standards"]
  },
  {
    title: "Grade Student Essays",
    description: "Review and provide feedback on junior class English essays",
    status: "in_progress" as const,
    priority: "medium" as const,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    assignees: ["test_educator_002"],
    createdById: "test_educator_002",
    category: "Academic", 
    tags: ["grading", "english", "feedback"]
  },
  {
    title: "Server Maintenance - Weekend",
    description: "Perform scheduled maintenance on school servers and network infrastructure",
    status: "todo" as const,
    priority: "high" as const,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    assignees: ["test_support_001"],
    createdById: "test_support_001",
    category: "Technical",
    tags: ["maintenance", "servers", "infrastructure"]
  },
  {
    title: "Classroom Setup for New Semester", 
    description: "Arrange furniture and equipment in classrooms for incoming semester",
    status: "completed" as const,
    priority: "medium" as const,
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    assignees: ["test_support_002"],
    createdById: "test_support_002",
    category: "Facilities",
    tags: ["setup", "classroom", "semester"]
  },
  {
    title: "Science Fair Planning Committee",
    description: "Coordinate with other educators to plan annual science fair event",
    status: "in_progress" as const,
    priority: "low" as const,
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks from now
    assignees: ["test_educator_003", "test_educator_001"],
    createdById: "test_educator_003",
    category: "Events",
    tags: ["science", "fair", "planning", "collaboration"]
  },
  {
    title: "Student Progress Review - Mathematics",
    description: "Conduct mid-semester review of student performance in advanced mathematics",
    status: "todo" as const,
    priority: "high" as const,
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    assignees: ["test_educator_001"],
    createdById: "test_admin_001",
    category: "Academic",
    tags: ["review", "students", "mathematics", "performance"]
  },
  {
    title: "Security System Update",
    description: "Install and configure new access control systems across campus",
    status: "in_progress" as const,
    priority: "high" as const,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    assignees: ["test_support_001", "test_admin_001"],
    createdById: "test_admin_001",
    category: "Security",
    tags: ["security", "access", "campus", "systems"]
  }
];

// Sample AI suggestions for different roles
export const testAiSuggestions = [
  {
    userId: "test_admin_001",
    title: "Optimize Budget Allocation Process",
    description: "Based on your recent budget activities, consider implementing automated approval workflows for departmental budget requests under $1,000 to streamline the process.",
    reasoning: "Analysis of your task patterns shows frequent small budget approvals that could benefit from automation.",
    confidence: 0.85,
    category: "process_improvement",
    status: "pending" as const
  },
  {
    userId: "test_educator_001", 
    title: "Integrate Interactive Math Tools",
    description: "Consider incorporating digital graphing calculators and geometry software into your curriculum updates to enhance student engagement.",
    reasoning: "Modern mathematics education research shows significant improvement in student comprehension with interactive tools.",
    confidence: 0.78,
    category: "teaching_enhancement",
    status: "pending" as const
  },
  {
    userId: "test_educator_002",
    title: "Implement Peer Review Process",
    description: "Try having students review each other's essay drafts before final submission to improve writing quality and reduce grading time.",
    reasoning: "Peer review has been shown to improve student writing skills while reducing educator workload.",
    confidence: 0.72,
    category: "teaching_strategy", 
    status: "pending" as const
  },
  {
    userId: "test_support_001",
    title: "Schedule Automated Backups",
    description: "Set up automated daily backups during low-usage hours to ensure data protection without impacting performance.",
    reasoning: "Your maintenance patterns suggest optimal backup windows between 2-4 AM when system usage is minimal.",
    confidence: 0.91,
    category: "system_optimization",
    status: "pending" as const
  }
];

export async function createTestData() {
  console.log("Creating test data for role-based testing...");
  
  try {
    // Create test tasks
    for (const task of testTasks) {
      await storage.createTask(task);
      console.log(`✓ Created test task: ${task.title}`);
    }
    
    // Create test AI suggestions  
    for (const suggestion of testAiSuggestions) {
      await storage.createAiSuggestion(suggestion);
      console.log(`✓ Created AI suggestion: ${suggestion.title}`);
    }
    
    console.log("Test data creation completed successfully.");
  } catch (error) {
    console.error("Error creating test data:", error);
  }
}

export function getTestTasksByRole(role: string) {
  const userIds = testUsers.filter(user => user.role === role).map(user => user.id);
  return testTasks.filter(task => 
    task.assignees.some(assignee => userIds.includes(assignee)) ||
    userIds.includes(task.createdById)
  );
}

export function getTestSuggestionsByRole(role: string) {
  const userIds = testUsers.filter(user => user.role === role).map(user => user.id);
  return testAiSuggestions.filter(suggestion => userIds.includes(suggestion.userId));
}