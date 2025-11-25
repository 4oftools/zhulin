export interface BambooSection {
  id: string;
  bambooId: string;
  type: 'planning' | 'sprint' | 'rest' | 'interruption' | 'review';
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  description?: string;
  taskId?: string; // for sprint sections
  status: 'scheduled' | 'active' | 'completed' | 'skipped';
}

