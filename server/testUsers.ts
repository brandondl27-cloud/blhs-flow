import { storage } from "./storage";

// Test user profiles for different roles and departments
export const testUsers = [
  {
    id: "test_admin_001",
    email: "admin@blhsflow.edu",
    firstName: "Sarah",
    lastName: "Johnson",
    role: "Administrator",
    department: "Administration",
    profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "test_educator_001", 
    email: "teacher1@blhsflow.edu",
    firstName: "Michael",
    lastName: "Chen",
    role: "Educator", 
    department: "Mathematics",
    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "test_educator_002",
    email: "teacher2@blhsflow.edu", 
    firstName: "Emma",
    lastName: "Davis",
    role: "Educator",
    department: "English",
    profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "test_support_001",
    email: "support1@blhsflow.edu",
    firstName: "James",
    lastName: "Wilson", 
    role: "Support Staff",
    department: "IT Support",
    profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "test_support_002",
    email: "support2@blhsflow.edu",
    firstName: "Lisa",
    lastName: "Thompson",
    role: "Support Staff", 
    department: "Facilities",
    profileImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "test_educator_003",
    email: "teacher3@blhsflow.edu",
    firstName: "David",
    lastName: "Rodriguez",
    role: "Educator",
    department: "Science", 
    profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  }
];

export async function createTestUsers() {
  console.log("Creating test users for role-based testing...");
  
  for (const user of testUsers) {
    try {
      await storage.upsertUser(user);
      console.log(`✓ Created test user: ${user.firstName} ${user.lastName} (${user.role})`);
    } catch (error) {
      console.error(`✗ Failed to create test user ${user.email}:`, error);
    }
  }
  
  console.log("Test user creation completed.");
}

export function getTestUserByRole(role: string) {
  return testUsers.filter(user => user.role === role);
}

export function getAllTestUsers() {
  return testUsers;
}