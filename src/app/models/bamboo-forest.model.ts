export interface BambooSection {
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
  completed?: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  period?: BambooSectionPeriod; // for periodic tasks
}

export interface BambooSectionPeriod {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[]; // 0-6, Sunday-Saturday
  dayOfMonth?: number;
}

export interface BambooForest {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  enabled?: boolean;
  bambooFields: BambooField[];
  archived?: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BambooField {
  id: string;
  forestId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  bamboos: Bamboo[];
  goals: any[]; // Goal 模型已删除，暂时使用 any[]
  archived?: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bamboo {
  id: string;
  fieldId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  tasks: BambooSection[];
  completed?: boolean;
  completedAt?: Date;
  archived?: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

