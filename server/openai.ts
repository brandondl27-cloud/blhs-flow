import OpenAI from "openai";
import type { User, Task } from "@shared/schema";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function generateTaskSuggestions(
  user: User, 
  recentTasks: Task[]
): Promise<Array<{
  title: string;
  description: string;
  confidence: string;
  reasoning: string;
}>> {
  try {
    const taskHistory = recentTasks.map(task => ({
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      progress: task.progress,
    }));

    const prompt = `
You are an AI assistant for an educational institution's work management system. Based on the user's profile and recent task history, generate 3 personalized task suggestions.

User Profile:
- Role: ${user.role}
- Department: ${user.department || 'Not specified'}
- Name: ${user.firstName} ${user.lastName}

Recent Task History (last 20 tasks):
${JSON.stringify(taskHistory, null, 2)}

Please analyze the user's work patterns and generate 3 relevant task suggestions that would be helpful for someone in their role and department. Consider:
1. Educational institution context (curriculum, assessments, meetings, administrative tasks)
2. The user's role-specific responsibilities
3. Patterns in their task completion and timing
4. Common educational workflows and deadlines

Respond with JSON in this exact format:
{
  "suggestions": [
    {
      "title": "Specific task title",
      "description": "Detailed description explaining why this task is suggested based on their patterns",
      "confidence": "85.5",
      "reasoning": "Explanation of why this suggestion was made based on their history"
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in educational workflow optimization. Provide helpful, relevant task suggestions based on user patterns and educational best practices.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.suggestions || [];
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    throw new Error("Failed to generate AI suggestions: " + error.message);
  }
}
