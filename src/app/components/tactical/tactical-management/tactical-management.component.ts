import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { BambooSection } from '../../../models/bamboo-forest.model';
import { Bamboo, BambooForest, BambooField } from '../../../models/bamboo-forest.model';

export interface Sprint {
  id: string;
  taskId?: string;
  taskName: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // 秒
  status: 'running' | 'completed' | 'paused' | 'interrupted';
  type: 'sprint' | 'rest' | 'break';
}

export interface Activity {
  bamboo: Bamboo;
  sections: BambooSection[];
  expanded?: boolean;
}

@Component({
  selector: 'app-tactical-management',
  templateUrl: './tactical-management.component.html',
  styleUrls: ['./tactical-management.component.css'],
  standalone: false
})
export class TacticalManagementComponent implements OnInit, OnDestroy {
  // 活动列表（按竹子分组）
  activities: Activity[] = [];
  expandedActivities: Set<string> = new Set();
  
  // 竹内待办
  bambooTodos: BambooSection[] = [];
  selectedBamboo: Bamboo | null = null;
  
  // 定时器管理器
  currentSprint: Sprint | null = null;
  timerInterval: any;
  elapsedSeconds: number = 0;
  timerStatus: 'idle' | 'sprint' | 'paused' | 'rest' | 'break' = 'idle';
  sprintDuration: number = 30 * 60; // 30分钟，单位：秒
  restDuration: number = 5 * 60; // 5分钟，单位：秒
  
  // 冲刺列表
  sprintHistory: Sprint[] = [];
  
  // 当前选中的竹节
  selectedTask: BambooSection | null = null;

  // 添加活动对话框
  showAddActivityDialog: boolean = false;
  enabledForests: BambooForest[] = [];
  selectedForest: BambooForest | null = null;
  selectedField: BambooField | null = null;
  availableFields: BambooField[] = [];
  availableBamboos: Bamboo[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadActivities();
    this.loadSprintHistory();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  loadActivities(): void {
    // 加载所有待办竹节，按竹子分组
    this.dataService.getForests().subscribe(forests => {
      const activityMap = new Map<string, Activity>();
      
      forests.forEach(forest => {
        forest.bambooFields.forEach(field => {
          field.bamboos.forEach(bamboo => {
            if (bamboo.tasks && bamboo.tasks.length > 0) {
              const uncompletedSections = bamboo.tasks.filter(section => !section.completed);
              if (uncompletedSections.length > 0) {
                // 如果该竹子还没有在活动列表中，创建新的活动项
                if (!activityMap.has(bamboo.id)) {
                  activityMap.set(bamboo.id, {
                    bamboo: bamboo,
                    sections: uncompletedSections,
                    expanded: this.expandedActivities.has(bamboo.id)
                  });
                } else {
                  // 如果已存在，更新竹节列表和展开状态
                  const activity = activityMap.get(bamboo.id)!;
                  activity.sections = uncompletedSections;
                  activity.expanded = this.expandedActivities.has(bamboo.id);
                }
              } else {
                // 如果所有竹节都已完成，从活动列表中移除
                activityMap.delete(bamboo.id);
                this.expandedActivities.delete(bamboo.id);
              }
            }
          });
        });
      });
      
      this.activities = Array.from(activityMap.values());
    });
  }

  openAddActivityDialog(): void {
    this.showAddActivityDialog = true;
    this.loadEnabledForests();
  }

  closeAddActivityDialog(): void {
    this.showAddActivityDialog = false;
    this.selectedForest = null;
    this.selectedField = null;
    this.availableFields = [];
    this.availableBamboos = [];
  }

  loadEnabledForests(): void {
    this.dataService.getForests().subscribe(forests => {
      // 只显示已启用且未归档的竹林
      this.enabledForests = forests.filter(f => 
        f.enabled !== false && !f.archived
      );
    });
  }

  selectForest(forest: BambooForest | null): void {
    if (!forest) {
      this.selectedForest = null;
      this.selectedField = null;
      this.availableFields = [];
      this.availableBamboos = [];
      return;
    }
    this.selectedForest = forest;
    this.selectedField = null;
    this.availableFields = forest.bambooFields.filter(f => !f.archived);
    this.availableBamboos = [];
  }

  selectField(field: BambooField | null): void {
    if (!field) {
      this.selectedField = null;
      this.availableBamboos = [];
      return;
    }
    this.selectedField = field;
    this.availableBamboos = field.bamboos.filter(b => !b.archived);
  }

  isBambooAdded(bamboo: Bamboo): boolean {
    // 检查该竹子是否已经在活动列表中
    return this.activities.some(activity => activity.bamboo.id === bamboo.id);
  }
  
  toggleActivityExpanded(activity: Activity, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.expandedActivities.has(activity.bamboo.id)) {
      this.expandedActivities.delete(activity.bamboo.id);
    } else {
      this.expandedActivities.add(activity.bamboo.id);
    }
    activity.expanded = this.expandedActivities.has(activity.bamboo.id);
  }

  addBambooToActivities(bamboo: Bamboo, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (!bamboo.tasks || bamboo.tasks.length === 0) {
      alert('该竹子没有竹节');
      return;
    }

    // 检查是否已经存在（避免重复添加）
    if (this.isBambooAdded(bamboo)) {
      alert('该竹子已经在活动列表中');
      return;
    }

    // 将竹子的所有未完成竹节添加到活动列表
    const uncompletedSections = bamboo.tasks.filter(section => !section.completed);
    
    if (uncompletedSections.length === 0) {
      alert('该竹子没有未完成的竹节');
      return;
    }

    // 创建新的活动项
    const newActivity: Activity = {
      bamboo: bamboo,
      sections: uncompletedSections,
      expanded: false
    };

    this.activities = [...this.activities, newActivity];
    // 刷新活动列表以确保数据同步
    this.loadActivities();
    // 不关闭对话框，允许继续添加
  }

  loadBambooTodos(bamboo: Bamboo): void {
    this.selectedBamboo = bamboo;
    this.bambooTodos = bamboo.tasks?.filter(t => !t.completed) || [];
  }

  selectActivity(section: BambooSection): void {
    this.selectedTask = section;
    // 找到竹节所属的竹子
    this.dataService.getForests().subscribe(forests => {
      for (const forest of forests) {
        for (const field of forest.bambooFields) {
          for (const bamboo of field.bamboos) {
            if (bamboo.tasks?.some(s => s.id === section.id)) {
              this.loadBambooTodos(bamboo);
              return;
            }
          }
        }
      }
    });
  }

  // 定时器管理
  startSprint(section?: BambooSection): void {
    if (this.timerStatus === 'sprint' && this.currentSprint) {
      return; // 已经在冲刺中
    }

    const sprint: Sprint = {
      id: this.generateId(),
      taskId: section?.id,
      taskName: section?.name || '专注工作',
      startTime: new Date(),
      duration: 0,
      status: 'running',
      type: 'sprint'
    };

    this.currentSprint = sprint;
    this.timerStatus = 'sprint';
    this.elapsedSeconds = 0;
    this.startTimer();
  }

  startRest(): void {
    if (this.timerStatus === 'rest') {
      return;
    }

    this.pauseSprint();
    this.timerStatus = 'rest';
    this.elapsedSeconds = 0;
    this.startTimer();
  }

  startBreak(): void {
    if (this.timerStatus === 'break') {
      return;
    }

    this.pauseSprint();
    this.timerStatus = 'break';
    this.elapsedSeconds = 0;
    this.startTimer();
  }

  pauseSprint(): void {
    if (this.currentSprint && this.timerStatus === 'sprint') {
      this.currentSprint.status = 'paused';
      this.currentSprint.duration = this.elapsedSeconds;
      this.timerStatus = 'paused';
    }
    this.stopTimer();
  }

  resumeSprint(): void {
    if (this.currentSprint && this.timerStatus === 'paused') {
      this.currentSprint.status = 'running';
      this.timerStatus = 'sprint';
      this.startTimer();
    }
  }

  interruptSprint(): void {
    if (this.currentSprint) {
      this.currentSprint.status = 'interrupted';
      this.currentSprint.endTime = new Date();
      this.currentSprint.duration = this.elapsedSeconds;
      this.sprintHistory.unshift(this.currentSprint);
      this.saveSprintHistory();
      this.currentSprint = null;
    }
    this.timerStatus = 'idle';
    this.stopTimer();
  }

  completeSprint(): void {
    if (this.currentSprint) {
      this.currentSprint.status = 'completed';
      this.currentSprint.endTime = new Date();
      this.currentSprint.duration = this.elapsedSeconds;
      this.sprintHistory.unshift(this.currentSprint);
      this.saveSprintHistory();
      this.currentSprint = null;
    }
    this.timerStatus = 'idle';
    this.stopTimer();
    this.elapsedSeconds = 0;
  }

  completeRest(): void {
    this.timerStatus = 'idle';
    this.stopTimer();
    this.elapsedSeconds = 0;
  }

  startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      
      // 检查是否达到目标时长
      if (this.timerStatus === 'sprint' && this.elapsedSeconds >= this.sprintDuration) {
        this.completeSprint();
      } else if (this.timerStatus === 'rest' && this.elapsedSeconds >= this.restDuration) {
        this.completeRest();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getRemainingTime(): string {
    if (this.timerStatus === 'sprint') {
      const remaining = this.sprintDuration - this.elapsedSeconds;
      return this.formatTime(Math.max(0, remaining));
    } else if (this.timerStatus === 'rest') {
      const remaining = this.restDuration - this.elapsedSeconds;
      return this.formatTime(Math.max(0, remaining));
    }
    return '00:00';
  }

  loadSprintHistory(): void {
    // 从localStorage加载历史记录
    const history = localStorage.getItem('sprint-history');
    if (history) {
      try {
        const parsed = JSON.parse(history);
        this.sprintHistory = parsed.map((s: any) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: s.endTime ? new Date(s.endTime) : undefined
        }));
      } catch (e) {
        console.error('Failed to load sprint history', e);
      }
    }
  }

  saveSprintHistory(): void {
    localStorage.setItem('sprint-history', JSON.stringify(this.sprintHistory));
  }

  toggleTodoComplete(section: BambooSection, event: Event): void {
    event.stopPropagation();
    section.completed = !section.completed;
    section.completedAt = section.completed ? new Date() : undefined;
    section.updatedAt = new Date();
    
    // 更新数据服务
    this.dataService.getForests().subscribe(forests => {
      for (const forest of forests) {
        for (const field of forest.bambooFields) {
          for (const bamboo of field.bamboos) {
            if (bamboo.tasks?.some(s => s.id === section.id)) {
              this.dataService.updateBamboo(bamboo);
              // 刷新活动列表
              this.loadActivities();
              return;
            }
          }
        }
      }
    });
    
    // 更新本地列表
    const index = this.bambooTodos.findIndex(s => s.id === section.id);
    if (index !== -1) {
      this.bambooTodos[index] = section;
    }
  }

  toggleSectionCompleted(section: BambooSection, event: Event): void {
    event.stopPropagation();
    section.completed = !section.completed;
    section.completedAt = section.completed ? new Date() : undefined;
    section.updatedAt = new Date();
    
    // 更新数据服务
    this.dataService.getForests().subscribe(forests => {
      for (const forest of forests) {
        for (const field of forest.bambooFields) {
          for (const bamboo of field.bamboos) {
            const taskIndex = bamboo.tasks?.findIndex(s => s.id === section.id);
            if (taskIndex !== undefined && taskIndex !== -1) {
              if (bamboo.tasks) {
                bamboo.tasks[taskIndex] = section;
                this.dataService.updateBamboo(bamboo);
                // 刷新活动列表
                this.loadActivities();
                return;
              }
            }
          }
        }
      }
    });
  }

  deleteSection(section: BambooSection, event: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (!confirm('确定要删除这个竹节吗？')) {
      return;
    }
    
    // 从数据服务中删除
    this.dataService.getForests().subscribe(forests => {
      for (const forest of forests) {
        for (const field of forest.bambooFields) {
          for (const bamboo of field.bamboos) {
            if (bamboo.tasks?.some(s => s.id === section.id)) {
              if (bamboo.tasks) {
                bamboo.tasks = bamboo.tasks.filter(s => s.id !== section.id);
                this.dataService.updateBamboo(bamboo);
                // 刷新活动列表
                this.loadActivities();
                return;
              }
            }
          }
        }
      }
    });
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

