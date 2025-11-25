import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BambooForest, BambooField, Bamboo } from '../models/bamboo-forest.model';
import { Goal } from '../models/goal.model';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private forestsSubject = new BehaviorSubject<BambooForest[]>([]);
  public forests$ = this.forestsSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const forests = this.loadFromLocalStorage();
    this.forestsSubject.next(forests);
  }

  // BambooForest CRUD
  getForests(): Observable<BambooForest[]> {
    return this.forests$;
  }

  getForest(id: string): BambooForest | undefined {
    return this.forestsSubject.value.find(f => f.id === id);
  }

  addForest(forest: BambooForest): void {
    const forests = [...this.forestsSubject.value, forest];
    this.forestsSubject.next(forests);
    this.saveToLocalStorage(forests);
  }

  updateForest(forest: BambooForest): void {
    const forests = this.forestsSubject.value.map(f => 
      f.id === forest.id ? forest : f
    );
    this.forestsSubject.next(forests);
    this.saveToLocalStorage(forests);
  }

  deleteForest(id: string): void {
    const forests = this.forestsSubject.value.filter(f => f.id !== id);
    this.forestsSubject.next(forests);
    this.saveToLocalStorage(forests);
  }

  // BambooField CRUD
  addField(field: BambooField): void {
    const forests = this.forestsSubject.value.map(forest => {
      if (forest.id === field.forestId) {
        return { ...forest, bambooFields: [...forest.bambooFields, field] };
      }
      return forest;
    });
    this.forestsSubject.next(forests);
    this.saveToLocalStorage(forests);
  }

  updateField(field: BambooField): void {
    const forests = this.forestsSubject.value.map(forest => {
      if (forest.id === field.forestId) {
        return {
          ...forest,
          bambooFields: forest.bambooFields.map(f => 
            f.id === field.id ? field : f
          )
        };
      }
      return forest;
    });
    this.forestsSubject.next(forests);
    this.saveToLocalStorage(forests);
  }

  deleteField(forestId: string, fieldId: string): void {
    const forests = this.forestsSubject.value.map(forest => {
      if (forest.id === forestId) {
        return {
          ...forest,
          bambooFields: forest.bambooFields.filter(f => f.id !== fieldId)
        };
      }
      return forest;
    });
    this.forestsSubject.next(forests);
    this.saveToLocalStorage(forests);
  }

  // Bamboo CRUD
  addBamboo(bamboo: Bamboo): void {
    const forests = this.forestsSubject.value.map(forest => {
      return {
        ...forest,
        bambooFields: forest.bambooFields.map(field => {
          if (field.id === bamboo.fieldId) {
            return { ...field, bamboos: [...field.bamboos, bamboo] };
          }
          return field;
        })
      };
    });
    this.forestsSubject.next(forests);
    this.saveToLocalStorage(forests);
  }

  updateBamboo(bamboo: Bamboo): void {
    const forests = this.forestsSubject.value.map(forest => {
      return {
        ...forest,
        bambooFields: forest.bambooFields.map(field => {
          if (field.id === bamboo.fieldId) {
            return {
              ...field,
              bamboos: field.bamboos.map(b => b.id === bamboo.id ? bamboo : b)
            };
          }
          return field;
        })
      };
    });
    this.forestsSubject.next(forests);
    this.saveToLocalStorage(forests);
  }

  deleteBamboo(fieldId: string, bambooId: string): void {
    const forests = this.forestsSubject.value.map(forest => {
      return {
        ...forest,
        bambooFields: forest.bambooFields.map(field => {
          if (field.id === fieldId) {
            return {
              ...field,
              bamboos: field.bamboos.filter(b => b.id !== bambooId)
            };
          }
          return field;
        })
      };
    });
    this.forestsSubject.next(forests);
    this.saveToLocalStorage(forests);
  }

  // Goal CRUD
  addGoal(goal: Goal): void {
    const forests = this.forestsSubject.value.map(forest => {
      const field = forest.bambooFields.find(f => f.id === goal.fieldId);
      if (field) {
        const updatedField = {
          ...field,
          goals: [...field.goals, goal]
        };
        return {
          ...forest,
          bambooFields: forest.bambooFields.map(f =>
            f.id === field.id ? updatedField : f
          )
        };
      }
      return forest;
    });
    this.forestsSubject.next(forests);
    this.saveToLocalStorage(forests);
  }

  updateGoal(goal: Goal): void {
    const forests = this.forestsSubject.value.map(forest => {
      const field = forest.bambooFields.find(f => f.id === goal.fieldId);
      if (field) {
        const updatedField = {
          ...field,
          goals: field.goals.map(g => g.id === goal.id ? goal : g)
        };
        return {
          ...forest,
          bambooFields: forest.bambooFields.map(f =>
            f.id === field.id ? updatedField : f
          )
        };
      }
      return forest;
    });
    this.forestsSubject.next(forests);
    this.saveToLocalStorage(forests);
  }

  deleteGoal(fieldId: string, goalId: string): void {
    const forests = this.forestsSubject.value.map(forest => {
      const field = forest.bambooFields.find(f => f.id === fieldId);
      if (field) {
        const updatedField = {
          ...field,
          goals: field.goals.filter(g => g.id !== goalId)
        };
        return {
          ...forest,
          bambooFields: forest.bambooFields.map(f =>
            f.id === field.id ? updatedField : f
          )
        };
      }
      return forest;
    });
    this.forestsSubject.next(forests);
    this.saveToLocalStorage(forests);
  }

  private loadFromLocalStorage(): BambooForest[] {
    const data = localStorage.getItem('zhulin-data');
    if (data) {
      const parsed = JSON.parse(data);
      return this.deserializeForests(parsed);
    }
    return [];
  }

  private saveToLocalStorage(forests: BambooForest[]): void {
    localStorage.setItem('zhulin-data', JSON.stringify(forests));
  }

  private deserializeForests(data: any[]): BambooForest[] {
    return data.map(forest => ({
      ...forest,
      startDate: new Date(forest.startDate),
      endDate: new Date(forest.endDate),
      createdAt: new Date(forest.createdAt),
      updatedAt: new Date(forest.updatedAt),
      bambooFields: forest.bambooFields.map((field: any) => ({
        ...field,
        startDate: new Date(field.startDate),
        endDate: new Date(field.endDate),
        createdAt: new Date(field.createdAt),
        updatedAt: new Date(field.updatedAt),
        bamboos: field.bamboos.map((bamboo: any) => ({
          ...bamboo,
          startDate: new Date(bamboo.startDate),
          endDate: new Date(bamboo.endDate),
          createdAt: new Date(bamboo.createdAt),
          updatedAt: new Date(bamboo.updatedAt),
          tasks: (bamboo.tasks || []).map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined
          }))
        })),
        goals: (field.goals || []).map((goal: any) => ({
          ...goal,
          createdAt: new Date(goal.createdAt),
          updatedAt: new Date(goal.updatedAt)
        }))
      }))
    }));
  }
}

