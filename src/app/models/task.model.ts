export interface Task {
  id: string;
  bambooId: string;
  goalId?: string;
  name: string;
  description?: string;
  type: 'regular' | 'periodic' | 'label';
  status: 'pending' | 'in-progress' | 'completed';
  priority: number;
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  period?: TaskPeriod; // for periodic tasks
}

export interface TaskPeriod {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[]; // 0-6, Sunday-Saturday
  dayOfMonth?: number;
}

