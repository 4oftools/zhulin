export interface Goal {
  id: string;
  fieldId: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'paused';
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

