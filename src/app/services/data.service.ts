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

  archiveForest(id: string, archived: boolean): void {
    const forests = this.forestsSubject.value.map(forest => {
      if (forest.id === id) {
        return {
          ...forest,
          archived: archived,
          archivedAt: archived ? new Date() : undefined,
          updatedAt: new Date()
        };
      }
      return forest;
    });
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

  updateFieldOrder(forestId: string, fields: BambooField[]): void {
    const forests = this.forestsSubject.value.map(forest => {
      if (forest.id === forestId) {
        return {
          ...forest,
          bambooFields: fields
        };
      }
      return forest;
    });
    this.forestsSubject.next(forests);
    this.saveToLocalStorage(forests);
  }

  archiveField(forestId: string, fieldId: string, archived: boolean): void {
    const forests = this.forestsSubject.value.map(forest => {
      if (forest.id === forestId) {
        return {
          ...forest,
          bambooFields: forest.bambooFields.map(field => {
            if (field.id === fieldId) {
              return {
                ...field,
                archived: archived,
                archivedAt: archived ? new Date() : undefined,
                updatedAt: new Date()
              };
            }
            return field;
          })
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

  archiveBamboo(fieldId: string, bambooId: string, archived: boolean): void {
    const forests = this.forestsSubject.value.map(forest => {
      return {
        ...forest,
        bambooFields: forest.bambooFields.map(field => {
          if (field.id === fieldId) {
            return {
              ...field,
              bamboos: field.bamboos.map(bamboo => {
                if (bamboo.id === bambooId) {
                  return {
                    ...bamboo,
                    archived: archived,
                    archivedAt: archived ? new Date() : undefined,
                    updatedAt: new Date()
                  };
                }
                return bamboo;
              })
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
      const forests = this.deserializeForests(parsed);
      if (forests.length > 0) {
        return forests;
      }
    }
    // 如果没有数据，初始化假数据
    return this.generateMockData();
  }

  private generateMockData(): BambooForest[] {
    const now = new Date();
    const forest1Id = this.generateId();
    const forest2Id = this.generateId();
    
    const field1Id = this.generateId();
    const field2Id = this.generateId();
    const field3Id = this.generateId();
    const field4Id = this.generateId();
    
    const bamboo1Id = this.generateId();
    const bamboo2Id = this.generateId();
    const bamboo3Id = this.generateId();
    const bamboo4Id = this.generateId();
    const bamboo5Id = this.generateId();
    const bamboo6Id = this.generateId();
    
    // 生成竹节（任务）
    const generateTasks = (bambooId: string, count: number): Task[] => {
      const taskNames = [
        '完成需求分析',
        '设计系统架构',
        '编写核心代码',
        '单元测试',
        '代码审查',
        '性能优化',
        '文档编写',
        '部署上线'
      ];
      const statuses: Task['status'][] = ['pending', 'in-progress', 'completed'];
      const tasks: Task[] = [];
      
      for (let i = 0; i < count; i++) {
        const status = statuses[i % statuses.length];
        tasks.push({
          id: this.generateId(),
          bambooId: bambooId,
          name: taskNames[i % taskNames.length],
          description: `这是第${i + 1}个竹节的详细描述`,
          type: 'regular',
          status: status,
          priority: (i % 3) + 1,
          tags: ['重要', '紧急'].slice(0, i % 2 + 1),
          createdAt: new Date(now.getTime() - (count - i) * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - (count - i) * 24 * 60 * 60 * 1000)
        });
      }
      return tasks;
    };
    
    // 生成竹子
    const bamboo1: Bamboo = {
      id: bamboo1Id,
      fieldId: field1Id,
      name: '需求分析与设计',
      startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      description: '完成项目的需求分析和系统设计',
      tasks: generateTasks(bamboo1Id, 4),
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    };
    
    const bamboo2: Bamboo = {
      id: bamboo2Id,
      fieldId: field1Id,
      name: '核心功能开发',
      startDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      description: '开发系统的核心功能模块',
      tasks: generateTasks(bamboo2Id, 5),
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
    };
    
    const bamboo3: Bamboo = {
      id: bamboo3Id,
      fieldId: field2Id,
      name: '测试与优化',
      startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      description: '进行系统测试和性能优化',
      tasks: generateTasks(bamboo3Id, 3),
      createdAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    };
    
    const bamboo4: Bamboo = {
      id: bamboo4Id,
      fieldId: field2Id,
      name: '部署与上线',
      startDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      description: '部署系统到生产环境',
      tasks: generateTasks(bamboo4Id, 2),
      createdAt: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000)
    };
    
    const bamboo5: Bamboo = {
      id: bamboo5Id,
      fieldId: field3Id,
      name: '市场调研',
      startDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      description: '进行市场调研和竞品分析',
      tasks: generateTasks(bamboo5Id, 4),
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
    };
    
    const bamboo6: Bamboo = {
      id: bamboo6Id,
      fieldId: field3Id,
      name: '产品规划',
      startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      description: '制定产品规划和路线图',
      tasks: generateTasks(bamboo6Id, 3),
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
    };
    
    // 生成竹田
    const field1: BambooField = {
      id: field1Id,
      forestId: forest1Id,
      name: '第一阶段：开发',
      startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      description: '项目开发的第一阶段',
      bamboos: [bamboo1, bamboo2],
      goals: [],
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
    };
    
    const field2: BambooField = {
      id: field2Id,
      forestId: forest1Id,
      name: '第二阶段：测试与上线',
      startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      description: '测试和部署阶段',
      bamboos: [bamboo3, bamboo4],
      goals: [],
      createdAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000)
    };
    
    const field3: BambooField = {
      id: field3Id,
      forestId: forest2Id,
      name: '产品规划阶段',
      startDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      description: '产品规划和市场调研',
      bamboos: [bamboo5, bamboo6],
      goals: [],
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
    };
    
    const field4: BambooField = {
      id: field4Id,
      forestId: forest2Id,
      name: '运营优化阶段',
      startDate: new Date(now.getTime()),
      endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      description: '产品运营和持续优化',
      bamboos: [],
      goals: [],
      createdAt: new Date(now.getTime()),
      updatedAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    };
    
    // 生成竹林
    const forest1: BambooForest = {
      id: forest1Id,
      name: '2024年度产品开发',
      startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      description: '2024年度的主要产品开发项目',
      bambooFields: [field1, field2],
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000)
    };
    
    const forest2: BambooForest = {
      id: forest2Id,
      name: '产品战略规划',
      startDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      description: '产品长期战略规划和运营',
      bambooFields: [field3, field4],
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    };
    
    return [forest1, forest2];
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
      archived: forest.archived || false,
      archivedAt: forest.archivedAt ? new Date(forest.archivedAt) : undefined,
      bambooFields: forest.bambooFields.map((field: any) => ({
        ...field,
        startDate: new Date(field.startDate),
        endDate: new Date(field.endDate),
        createdAt: new Date(field.createdAt),
        updatedAt: new Date(field.updatedAt),
        archived: field.archived || false,
        archivedAt: field.archivedAt ? new Date(field.archivedAt) : undefined,
        bamboos: field.bamboos.map((bamboo: any) => ({
          ...bamboo,
          startDate: new Date(bamboo.startDate),
          endDate: new Date(bamboo.endDate),
          createdAt: new Date(bamboo.createdAt),
          updatedAt: new Date(bamboo.updatedAt),
          archived: bamboo.archived || false,
          archivedAt: bamboo.archivedAt ? new Date(bamboo.archivedAt) : undefined,
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

