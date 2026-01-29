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
  inTodoList?: boolean;
}

export interface Sprint {
  id: string;
  taskId?: string;
  taskName: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  status: 'running' | 'completed' | 'paused' | 'interrupted';
  type: 'sprint' | 'rest' | 'break';
}

export interface DailyReview {
  id?: string;
  date: string; // YYYY-MM-DD
  score: number | null;
  goodThings: string;
  badThings: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  goals: Goal[];
  keyOutputs: KeyOutput[];
  learnings: Learning[];
  archived?: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  forestId: string;
  name: string;
  description?: string;
  completed?: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface KeyOutput {
  id: string;
  forestId: string;
  name: string;
  description?: string;
  completed?: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Learning {
  id: string;
  forestId: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
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
  sortOrder?: number;
  archived?: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bamboo {
  id: string;
  fieldId: string;
  goalId: string; // 必须指定一个目标
  name: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  inActivityList?: boolean; // 是否在活动列表中
  tasks: BambooSection[];
  completed?: boolean;
  completedAt?: Date;
  archived?: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

