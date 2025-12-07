import { Goal } from './goal.model';
import { Task } from './task.model';

export interface BambooForest {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description?: string;
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
  goals: Goal[];
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
  tasks: Task[];
  completed?: boolean;
  completedAt?: Date;
  archived?: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

