import { Goal } from './goal.model';
import { Task } from './task.model';

export interface BambooForest {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  bambooFields: BambooField[];
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
  createdAt: Date;
  updatedAt: Date;
}

