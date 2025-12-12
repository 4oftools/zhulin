import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { BambooSection } from '../../../models/bamboo-forest.model';
import { Bamboo, BambooForest, BambooField } from '../../../models/bamboo-forest.model';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { take } from 'rxjs/operators';

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
  
  // 下拉菜单状态
  openMenuId: string | null = null;
  private positionUpdateTimer: any = null; // 防止位置更新过于频繁
  
  // 竹内待办
  bambooTodos: BambooSection[] = [];
  
  // 竹子对话框状态
  showBambooDialog = false;
  isEditingBamboo = false;
  editingBambooId: string | null = null;
  editingBambooField: BambooField | null = null;

  // 竹子对话框表单数据
  newBamboo: {
    name: string;
    startDate: string;
    endDate: string;
    description: string;
    completed: boolean;
  } = {
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    description: '',
    completed: false
  };

  // 竹节管理
  dialogSections: BambooSection[] = [];
  showSectionDialog = false;
  isEditingSection = false;
  editingSectionId: string | null = null;
  newSection: {
    name: string;
    description: string;
    completed: boolean;
  } = {
    name: '',
    description: '',
    completed: false
  };
  
  // 定时器管理器
  currentSprint: Sprint | null = null;
  timerInterval: any;
  elapsedSeconds: number = 0;
  timerStatus: 'idle' | 'sprint' | 'paused' | 'rest' | 'break' = 'idle';
  sprintDuration: number = 30 * 60; // 30分钟，单位：秒
  restDuration: number = 5 * 60; // 5分钟，单位：秒
  
  // 冲刺列表
  sprintHistory: Sprint[] = [];
  filteredSprintHistory: Sprint[] = [];
  selectedDate: Date | null = null;
  showCalendar: boolean = false;
  currentCalendarMonth: Date = new Date(); // 当前显示的月份
  showYearSelector: boolean = false; // 是否显示年份选择器
  showMonthSelector: boolean = false; // 是否显示月份选择器
  
  // 当前选中的竹节
  selectedTask: BambooSection | null = null;

  // 添加活动对话框
  showAddActivityDialog: boolean = false;
  enabledForests: BambooForest[] = [];
  selectedForest: BambooForest | null = null;
  selectedField: BambooField | null = null;
  availableFields: BambooField[] = [];
  availableBamboos: Bamboo[] = [];

  // 回顾对话框
  showReviewDialog: boolean = false;
  reviewData: {
    score: number | null;
    goodThings: string;
    badThings: string;
  } = {
    score: null,
    goodThings: '',
    badThings: ''
  };
  reviewDate: Date = new Date();
  hoveredScore: number | null = null;

  constructor(private dataService: DataService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadActivities();
    this.loadSprintHistory();
    this.loadBambooTodos();
    // 默认选中今天，重置时间部分
    const today = new Date();
    this.selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    this.currentCalendarMonth = new Date();
    this.filterSprintHistory();
    
    // 使用冒泡阶段监听，让 Angular 的事件绑定先执行
    // 这样 Angular 的事件绑定会在 handleDocumentClick 之前执行
    document.addEventListener('click', this.handleDocumentClick.bind(this), false);
  }
  
  ngOnDestroy(): void {
    this.stopTimer();
    document.removeEventListener('click', this.handleDocumentClick.bind(this), false);
  }
  
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // 如果点击的是日历相关元素，不处理（让 Angular 的事件绑定处理）
    if (target.closest('.calendar-scroll') || 
        target.closest('.calendar-header') ||
        target.closest('.btn-calendar') ||
        target.closest('.btn-year-nav') ||
        target.closest('.btn-month-nav') ||
        target.closest('.btn-today') ||
        target.closest('.year-selector') ||
        target.closest('.month-selector') ||
        target.closest('.year-selector-grid') ||
        target.closest('.month-selector-grid') ||
        target.closest('.year-option') ||
        target.closest('.month-option') ||
        target.closest('.calendar-day') ||
        target.closest('.calendar-days-grid') ||
        target.closest('.day-number') ||
        target.closest('.calendar-month-year')) {
      return;
    }
    
    // 如果点击的是活动列表的菜单相关元素，不处理
    if (target.closest('.activity-item .menu-container') || 
        target.closest('.activity-item .dropdown-menu') || 
        target.closest('.activity-item .btn-menu-vertical') ||
        target.closest('.activity-item .menu-item')) {
      return;
    }
    
    // 如果点击的是活动列表区域，但不是菜单相关元素，关闭菜单
    if (target.closest('.activity-item')) {
      if (this.openMenuId && this.openMenuId.startsWith('activity-')) {
        this.openMenuId = null;
      }
    }
  }
  

  loadActivities(): void {
    // 加载所有待办竹节，按竹子分组
    // 使用 take(1) 确保订阅只执行一次，避免循环
    this.dataService.getForests().pipe(take(1)).subscribe(forests => {
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
                    sections: uncompletedSections
                  });
                } else {
                  // 如果已存在，更新竹节列表
                  const activity = activityMap.get(bamboo.id)!;
                  activity.sections = uncompletedSections;
                }
              } else {
                // 如果所有竹节都已完成，从活动列表移除
                activityMap.delete(bamboo.id);
              }
            }
          });
        });
      });
      
      this.activities = Array.from(activityMap.values());
    });
  }

  getCompletedCount(activity: Activity): number {
    return activity.bamboo.tasks?.filter(s => s.completed).length || 0;
  }

  getTotalCount(activity: Activity): number {
    return activity.bamboo.tasks?.length || 0;
  }

  isSectionInTodos(section: BambooSection): boolean {
    // 检查该竹节是否已经在竹内待办列表中
    return this.bambooTodos.some(todo => todo.id === section.id);
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
  }

  isActivityExpanded(activity: Activity): boolean {
    return this.expandedActivities.has(activity.bamboo.id);
  }

  toggleActivityMenu(menuId: string, event?: Event, buttonElement?: HTMLElement): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    if (this.openMenuId === menuId) {
      this.openMenuId = null;
      // 移除菜单打开标记
      const activityItem = buttonElement?.closest('.activity-item') as HTMLElement;
      if (activityItem) {
        activityItem.removeAttribute('data-menu-open');
      }
    } else {
      this.openMenuId = menuId;
      // 标记 activity-item 为菜单打开状态
      const activityItem = buttonElement?.closest('.activity-item') as HTMLElement;
      if (activityItem) {
        activityItem.setAttribute('data-menu-open', 'true');
      }
      
      if (buttonElement) {
        // 清除之前的定时器
        if (this.positionUpdateTimer) {
          clearTimeout(this.positionUpdateTimer);
        }
        // 使用更长的延迟，确保 Angular 已经渲染了菜单元素
        this.positionUpdateTimer = setTimeout(() => {
          this.updateDropdownPosition(buttonElement);
          this.positionUpdateTimer = null;
        }, 0);
      }
    }
  }

  closeActivityMenu(event?: MouseEvent): void {
    // 如果点击的是菜单相关元素，不关闭菜单
    if (event) {
      const target = event.target as HTMLElement;
      if (target.closest('.menu-container') || 
          target.closest('.dropdown-menu') || 
          target.closest('.btn-menu-vertical') ||
          target.closest('.menu-item') ||
          target.closest('.activity-header-actions')) {
        return;
      }
    }
    // 只关闭活动列表相关的菜单
    if (this.openMenuId && this.openMenuId.startsWith('activity-')) {
      this.openMenuId = null;
      // 移除所有 activity-item 的菜单打开标记
      document.querySelectorAll('.activity-item[data-menu-open="true"]').forEach(item => {
        item.removeAttribute('data-menu-open');
      });
    }
  }

  updateDropdownPosition(buttonElement: HTMLElement): void {
    // 找到当前打开的下拉菜单 - 优先查找同一容器内的菜单
    const menuContainer = buttonElement.closest('.menu-container');
    let activeMenu: HTMLElement | undefined;
    
    if (menuContainer) {
      // 先尝试在同一容器内查找
      const menu = menuContainer.querySelector('.dropdown-menu') as HTMLElement;
      if (menu) {
        activeMenu = menu;
      }
    }
    
    // 如果没找到，查找所有菜单
    if (!activeMenu) {
      const menus = document.querySelectorAll('.dropdown-menu');
      activeMenu = Array.from(menus).find(menu => {
        const menuEl = menu as HTMLElement;
        return menuEl.offsetParent !== null || menuEl.style.display !== 'none';
      }) as HTMLElement | undefined;
    }
    
    if (activeMenu && buttonElement) {
      // 获取按钮的初始位置（在 hover transform 之前）
      const activityItem = buttonElement.closest('.activity-item') as HTMLElement;
      let rect: DOMRect;
      
      // 如果 activity-item 有 data-menu-open 标记，临时移除 transform 来获取准确位置
      if (activityItem && activityItem.hasAttribute('data-menu-open')) {
        const originalTransform = activityItem.style.transform;
        activityItem.style.transform = 'none';
        rect = buttonElement.getBoundingClientRect();
        activityItem.style.transform = originalTransform;
      } else {
        rect = buttonElement.getBoundingClientRect();
      }
      
      // 检查是否在活动列表区域
      const isInActivityPanel = buttonElement.closest('.activities-panel') !== null;
      
      // 只设置需要动态计算的位置样式
      activeMenu.style.top = (rect.bottom + 4) + 'px';
      // 强制设置 z-index，确保在所有元素之上
      activeMenu.style.setProperty('z-index', '9999999', 'important');
      
      // 如果在活动列表面板，固定向右弹出，不调整位置
      if (isInActivityPanel) {
        activeMenu.style.left = (rect.right + 4) + 'px';
        activeMenu.style.right = 'auto';
      } else {
        // 其他面板（冲刺列表等）保持原有的智能定位逻辑
        const menuWidth = 160; // 预估菜单宽度
        const spaceOnRight = window.innerWidth - rect.right;
        const spaceOnLeft = rect.left;
        const isInSprintsPanel = buttonElement.closest('.sprints-panel') !== null;
        
        // 如果在冲刺列表面板，或者右侧空间不足，向左弹出
        if (isInSprintsPanel || (spaceOnRight < menuWidth && spaceOnLeft >= menuWidth)) {
          activeMenu.style.left = (rect.left - menuWidth + rect.width) + 'px';
          activeMenu.style.right = 'auto';
        } else {
          // 默认向右弹出
          activeMenu.style.left = (rect.right + 4) + 'px';
          activeMenu.style.right = 'auto';
        }
      }
    }
  }


  openBambooDialog(activity: Activity, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    // 找到竹子所属的竹田
    this.dataService.getForests().subscribe(forests => {
      for (const forest of forests) {
        for (const field of forest.bambooFields) {
          const bamboo = field.bamboos.find(b => b.id === activity.bamboo.id);
          if (bamboo) {
            this.editingBambooField = field;
            this.isEditingBamboo = true;
            this.editingBambooId = bamboo.id;
            this.newBamboo = {
              name: bamboo.name,
              startDate: new Date(bamboo.startDate).toISOString().split('T')[0],
              endDate: new Date(bamboo.endDate).toISOString().split('T')[0],
              description: bamboo.description || '',
              completed: bamboo.completed || false
            };
            // 复制竹节列表到对话框
            this.dialogSections = (bamboo.tasks || []).map(section => ({ ...section }));
            this.showBambooDialog = true;
            this.closeActivityMenu();
            return;
          }
        }
      }
    });
  }

  closeBambooDialog(): void {
    this.showBambooDialog = false;
    this.isEditingBamboo = false;
    this.editingBambooId = null;
    this.editingBambooField = null;
    this.dialogSections = [];
  }

  addBamboo(): void {
    if (!this.editingBambooField) {
      alert('请先选择竹田');
      return;
    }

    if (!this.newBamboo.name.trim()) {
      alert('请输入竹子名称');
      return;
    }

    if (this.isEditingBamboo && this.editingBambooId) {
      // 更新竹子
      this.dataService.getForests().subscribe(forests => {
        for (const forest of forests) {
          for (const field of forest.bambooFields) {
            if (field.id === this.editingBambooField!.id) {
              const bamboo = field.bamboos.find(b => b.id === this.editingBambooId);
              if (bamboo) {
                bamboo.name = this.newBamboo.name;
                bamboo.startDate = new Date(this.newBamboo.startDate);
                bamboo.endDate = new Date(this.newBamboo.endDate);
                bamboo.description = this.newBamboo.description;
                bamboo.completed = this.newBamboo.completed;
                bamboo.tasks = this.dialogSections.map(section => ({
                  ...section,
                  bambooId: bamboo.id,
                  id: section.id || this.generateId()
                }));
                bamboo.updatedAt = new Date();
                this.dataService.updateBamboo(bamboo);
                this.loadActivities();
                this.closeBambooDialog();
                return;
              }
            }
          }
        }
      });
    }
  }

  openSectionDialogForActivity(activity: Activity, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    // 找到竹子所属的竹田
    this.dataService.getForests().subscribe(forests => {
      for (const forest of forests) {
        for (const field of forest.bambooFields) {
          const bamboo = field.bamboos.find(b => b.id === activity.bamboo.id);
          if (bamboo) {
            this.editingBambooField = field;
            this.editingBambooId = bamboo.id;
            this.isEditingSection = false;
            this.editingSectionId = null;
            this.newSection = {
              name: '',
              description: '',
              completed: false
            };
            this.showSectionDialog = true;
            this.closeActivityMenu();
            return;
          }
        }
      }
    });
  }

  openSectionDialog(section?: BambooSection): void {
    if (section) {
      this.isEditingSection = true;
      this.editingSectionId = section.id;
      this.newSection = {
        name: section.name,
        description: section.description || '',
        completed: section.completed || false
      };
    } else {
      this.isEditingSection = false;
      this.editingSectionId = null;
      this.newSection = {
        name: '',
        description: '',
        completed: false
      };
    }
    this.showSectionDialog = true;
  }

  closeSectionDialog(): void {
    this.showSectionDialog = false;
    this.isEditingSection = false;
    this.editingSectionId = null;
    this.newSection = {
      name: '',
      description: '',
      completed: false
    };
  }

  addSection(): void {
    if (!this.newSection.name.trim()) {
      alert('请输入竹节名称');
      return;
    }

    if (!this.editingBambooId) {
      alert('请先选择竹子');
      return;
    }

    this.dataService.getForests().subscribe(forests => {
      for (const forest of forests) {
        for (const field of forest.bambooFields) {
          const bamboo = field.bamboos.find(b => b.id === this.editingBambooId);
          if (bamboo) {
            if (this.isEditingSection && this.editingSectionId) {
              // 更新竹节
              const sectionIndex = this.dialogSections.findIndex((s: BambooSection) => s.id === this.editingSectionId);
              if (sectionIndex !== -1) {
                this.dialogSections[sectionIndex] = {
                  ...this.dialogSections[sectionIndex],
                  name: this.newSection.name,
                  description: this.newSection.description,
                  completed: this.newSection.completed,
                  updatedAt: new Date()
                };
              }
            } else {
              // 添加新竹节
              const newSection: BambooSection = {
                id: this.generateId(),
                bambooId: bamboo.id,
                name: this.newSection.name,
                description: this.newSection.description,
                type: 'regular',
                status: this.newSection.completed ? 'completed' : 'pending',
                priority: 0,
                tags: [],
                completed: this.newSection.completed,
                completedAt: this.newSection.completed ? new Date() : undefined,
                createdAt: new Date(),
                updatedAt: new Date()
              };
              this.dialogSections.push(newSection);
            }
            
            // 更新竹子
            bamboo.tasks = this.dialogSections.map(section => ({
              ...section,
              bambooId: bamboo.id
            }));
            this.dataService.updateBamboo(bamboo);
            
            // 如果编辑的是待办列表中的竹节，同步更新待办列表
            if (this.isEditingSection && this.editingSectionId) {
              const todoIndex = this.bambooTodos.findIndex(t => t.id === this.editingSectionId);
              if (todoIndex !== -1) {
                const updatedSection = this.dialogSections.find(s => s.id === this.editingSectionId);
                if (updatedSection) {
                  this.bambooTodos[todoIndex] = { ...updatedSection };
                  this.saveBambooTodos();
                }
              }
            }
            
            this.loadActivities();
            this.closeSectionDialog();
            return;
          }
        }
      }
    });
  }

  deleteSectionFromDialog(section: BambooSection): void {
    this.dialogSections = this.dialogSections.filter((s: BambooSection) => s.id !== section.id);
    
    // 更新竹子
    if (this.editingBambooId) {
      this.dataService.getForests().subscribe(forests => {
        for (const forest of forests) {
          for (const field of forest.bambooFields) {
            const bamboo = field.bamboos.find(b => b.id === this.editingBambooId);
            if (bamboo) {
              bamboo.tasks = this.dialogSections.map((s: BambooSection) => ({
                ...s,
                bambooId: bamboo.id
              }));
              this.dataService.updateBamboo(bamboo);
              this.loadActivities();
              return;
            }
          }
        }
      });
    }
  }

  dropSection(event: CdkDragDrop<BambooSection[]>): void {
    moveItemInArray(this.dialogSections, event.previousIndex, event.currentIndex);
  }

  completeBamboo(activity: Activity, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (!confirm('确定要标记这个竹子为已完成吗？')) {
      return;
    }
    
    this.dataService.getForests().subscribe(forests => {
      for (const forest of forests) {
        for (const field of forest.bambooFields) {
          const bamboo = field.bamboos.find(b => b.id === activity.bamboo.id);
          if (bamboo) {
            bamboo.completed = true;
            bamboo.completedAt = new Date();
            bamboo.updatedAt = new Date();
            this.dataService.updateBamboo(bamboo);
            this.loadActivities();
            this.closeActivityMenu();
            return;
          }
        }
      }
    });
  }

  removeFromActivities(activity: Activity, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (!confirm('确定要从活动列表中移除这个竹子吗？')) {
      return;
    }
    
    // 从活动列表中移除（实际上是通过标记所有竹节为已完成来实现）
    // 或者直接从活动列表中移除
    this.activities = this.activities.filter(a => a.bamboo.id !== activity.bamboo.id);
    this.closeActivityMenu();
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
      sections: uncompletedSections
    };

    this.activities = [...this.activities, newActivity];
    // 刷新活动列表以确保数据同步
    this.loadActivities();
    // 不关闭对话框，允许继续添加
  }

  selectTaskForSprint(section: BambooSection): void {
    // 只选择用于冲刺，不切换待办内容
    this.selectedTask = section;
  }

  selectTodoForSprint(todo: BambooSection, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // 如果点击的是菜单相关元素或复选框，不选择任务，只关闭菜单
    if (target.closest('.menu-container') || 
        target.closest('.dropdown-menu') || 
        target.closest('.btn-menu-vertical') ||
        target.closest('.menu-item') ||
        target.closest('.todo-checkbox-input')) {
      // 如果点击的是菜单按钮，不关闭菜单，让菜单正常显示
      if (!target.closest('.btn-menu-vertical')) {
        this.closeTodoMenu();
      }
      return;
    }
    
    // 选择任务用于冲刺
    if (this.selectedTask?.id === todo.id) {
      this.selectedTask = null;
    } else {
      this.selectedTask = todo;
    }
    // 关闭菜单
    this.closeTodoMenu();
  }
  
  removeFromTodos(todo: BambooSection, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.bambooTodos = this.bambooTodos.filter(t => t.id !== todo.id);
    // 如果移除的是当前选中的任务，清空选中状态
    if (this.selectedTask?.id === todo.id) {
      this.selectedTask = null;
    }
    this.closeTodoMenu();
    this.saveBambooTodos();
  }

  toggleTodoMenu(menuId: string, event?: Event, buttonElement?: HTMLElement): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    if (this.openMenuId === menuId) {
      this.openMenuId = null;
    } else {
      this.openMenuId = menuId;
    }
  }

  closeTodoMenu(): void {
    this.openMenuId = null;
  }

  editTodoSection(todo: BambooSection, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    // 找到这个竹节所属的竹子
    this.dataService.getForests().subscribe(forests => {
      for (const forest of forests) {
        for (const field of forest.bambooFields) {
          for (const bamboo of field.bamboos) {
            if (bamboo.tasks) {
              const section = bamboo.tasks.find(s => s.id === todo.id);
              if (section) {
                // 找到所属的竹田和竹子，打开编辑对话框
                this.selectedForest = forest;
                this.selectedField = field;
                this.availableFields = [field];
                this.availableBamboos = [bamboo];
                this.dialogSections = [...bamboo.tasks];
                this.isEditingSection = true;
                this.editingSectionId = todo.id;
                this.newSection = {
                  name: todo.name,
                  description: todo.description || '',
                  completed: todo.completed || false
                };
                this.showSectionDialog = true;
                this.closeTodoMenu();
                return;
              }
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
    
    const rest: Sprint = {
      id: this.generateId(),
      taskName: '休息',
      startTime: new Date(),
      duration: 0,
      status: 'running',
      type: 'rest'
    };
    
    this.currentSprint = rest;
    this.timerStatus = 'rest';
    this.elapsedSeconds = 0;
    this.startTimer();
  }

  startBreak(): void {
    if (this.timerStatus === 'break') {
      return;
    }

    this.pauseSprint();
    
    const breakSprint: Sprint = {
      id: this.generateId(),
      taskName: '休息',
      startTime: new Date(),
      duration: 0,
      status: 'running',
      type: 'break'
    };
    
    this.currentSprint = breakSprint;
    this.timerStatus = 'break';
    this.elapsedSeconds = 0;
    this.startTimer();
  }

  pauseSprint(): void {
    if (this.currentSprint && (this.timerStatus === 'sprint' || this.timerStatus === 'rest' || this.timerStatus === 'break')) {
      this.currentSprint.status = 'paused';
      this.currentSprint.duration = this.elapsedSeconds;
      if (this.timerStatus === 'sprint') {
        this.timerStatus = 'paused';
      }
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
      this.filterSprintHistory();
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
      this.filterSprintHistory();
      this.currentSprint = null;
    }
    this.timerStatus = 'idle';
    this.stopTimer();
    this.elapsedSeconds = 0;
  }

  completeRest(): void {
    if (this.currentSprint && (this.currentSprint.type === 'rest' || this.currentSprint.type === 'break')) {
      this.currentSprint.status = 'completed';
      this.currentSprint.endTime = new Date();
      this.currentSprint.duration = this.elapsedSeconds;
      this.sprintHistory.unshift(this.currentSprint);
      this.saveSprintHistory();
      this.filterSprintHistory();
      this.currentSprint = null;
    }
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
      } else if ((this.timerStatus === 'rest' || this.timerStatus === 'break') && this.elapsedSeconds >= this.restDuration) {
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
        this.sprintHistory = [];
      }
    } else {
      this.sprintHistory = [];
    }
    this.filterSprintHistory();
  }

  saveSprintHistory(): void {
    localStorage.setItem('sprint-history', JSON.stringify(this.sprintHistory));
    // 保存后重新筛选，确保列表更新
    this.filterSprintHistory();
  }

  toggleTodoComplete(section: BambooSection, event: Event): void {
    event.stopPropagation();
    
    // 创建新的对象，避免直接修改引用导致变更检测问题
    const newCompleted = !section.completed;
    const updatedSection = {
      ...section,
      completed: newCompleted,
      completedAt: newCompleted ? new Date() : undefined,
      updatedAt: new Date()
    };
    
    // 先更新本地列表，使用新对象
    const index = this.bambooTodos.findIndex(s => s.id === section.id);
    if (index !== -1) {
      // 创建新数组，触发变更检测
      this.bambooTodos = [
        ...this.bambooTodos.slice(0, index),
        updatedSection,
        ...this.bambooTodos.slice(index + 1)
      ];
      this.saveBambooTodos();
    }
    
    // 使用 setTimeout 延迟更新数据服务，避免在同一个变更检测周期内执行
    setTimeout(() => {
      // 使用 take(1) 确保只执行一次，避免循环
      this.dataService.getForests().pipe(take(1)).subscribe(forestsList => {
        let updated = false;
        for (const forest of forestsList) {
          for (const field of forest.bambooFields) {
            for (const bamboo of field.bamboos) {
              const taskIndex = bamboo.tasks?.findIndex(s => s.id === section.id);
              if (taskIndex !== undefined && taskIndex !== -1 && bamboo.tasks) {
                // 更新对应的竹节
                const updatedBamboo = {
                  ...bamboo,
                  tasks: bamboo.tasks.map((task, idx) => 
                    idx === taskIndex ? {
                      ...task,
                      completed: newCompleted,
                      completedAt: newCompleted ? new Date() : undefined,
                      updatedAt: new Date()
                    } : task
                  )
                };
                this.dataService.updateBamboo(updatedBamboo);
                updated = true;
                break;
              }
            }
            if (updated) break;
          }
          if (updated) break;
        }
        // 只有在更新成功且竹节完成时才刷新活动列表（因为完成的竹节会从活动列表移除）
        // 使用更长的延迟，确保 updateBamboo 的更新已经完成
        if (updated && newCompleted) {
          setTimeout(() => {
            this.loadActivities();
          }, 100);
        }
      });
    }, 0);
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
                // 从待办列表中移除
                this.bambooTodos = this.bambooTodos.filter(s => s.id !== section.id);
                return;
              }
            }
          }
        }
      }
    });
  }

  getActivityDropListIds(): string[] {
    return this.activities.map(activity => 'activity-sections-' + activity.bamboo.id);
  }

  dropSectionFromActivity(event: CdkDragDrop<BambooSection[]>, activity: Activity): void {
    if (event.previousContainer === event.container) {
      // 同一列表内移动
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      // 更新数据服务
      this.updateBambooSections(activity.bamboo, activity.sections);
    }
  }

  dropSectionToTodos(event: CdkDragDrop<BambooSection[]>): void {
    if (event.previousContainer === event.container) {
      // 同一列表内移动
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // 从活动列表拖拽到待办列表
      const section = event.previousContainer.data[event.previousIndex];
      
      // 检查是否已经存在
      if (this.bambooTodos.some(s => s.id === section.id)) {
        return;
      }

      // 创建副本添加到待办列表，并标记为来自活动列表
      const sectionCopy = { 
        ...section,
        fromActivity: true  // 标记为从活动列表拖拽过来的
      } as BambooSection & { fromActivity?: boolean };
      this.bambooTodos.splice(event.currentIndex, 0, sectionCopy);

      // 刷新活动列表
      this.loadActivities();
      this.saveBambooTodos();
    }
  }

  updateBambooSections(bamboo: Bamboo, sections: BambooSection[]): void {
    if (bamboo.tasks) {
      // 更新竹节顺序
      const sectionIds = sections.map(s => s.id);
      bamboo.tasks.sort((a, b) => {
        const indexA = sectionIds.indexOf(a.id);
        const indexB = sectionIds.indexOf(b.id);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      this.dataService.updateBamboo(bamboo);
    }
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  toggleCalendar(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.showCalendar = !this.showCalendar;
    if (this.showCalendar && !this.selectedDate) {
      // 如果打开日历且没有选中日期，默认选中今天
      const today = new Date();
      this.selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      this.filterSprintHistory();
    }
    // 强制触发变更检测
    this.cdr.detectChanges();
  }

  previousMonth(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const newMonth = new Date(this.currentCalendarMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    this.currentCalendarMonth = new Date(newMonth);
    this.showYearSelector = false;
    this.showMonthSelector = false;
    // 强制触发变更检测
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  nextMonth(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const newMonth = new Date(this.currentCalendarMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    this.currentCalendarMonth = new Date(newMonth);
    this.showYearSelector = false;
    this.showMonthSelector = false;
    // 强制触发变更检测
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  previousYear(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const newYear = new Date(this.currentCalendarMonth);
    newYear.setFullYear(newYear.getFullYear() - 1);
    this.currentCalendarMonth = new Date(newYear);
    this.showYearSelector = false;
    this.showMonthSelector = false;
    // 强制触发变更检测
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  nextYear(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const newYear = new Date(this.currentCalendarMonth);
    newYear.setFullYear(newYear.getFullYear() + 1);
    this.currentCalendarMonth = new Date(newYear);
    this.showYearSelector = false;
    this.showMonthSelector = false;
    // 强制触发变更检测
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  get availableYears(): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    // 显示当前年份前后各10年
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  }

  selectYear(year: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const newDate = new Date(this.currentCalendarMonth);
    newDate.setFullYear(year);
    this.currentCalendarMonth = new Date(newDate);
    this.showYearSelector = false;
    this.showMonthSelector = false;
    // 强制触发变更检测
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  get availableMonths(): { value: number; label: string }[] {
    return [
      { value: 0, label: '1月' },
      { value: 1, label: '2月' },
      { value: 2, label: '3月' },
      { value: 3, label: '4月' },
      { value: 4, label: '5月' },
      { value: 5, label: '6月' },
      { value: 6, label: '7月' },
      { value: 7, label: '8月' },
      { value: 8, label: '9月' },
      { value: 9, label: '10月' },
      { value: 10, label: '11月' },
      { value: 11, label: '12月' }
    ];
  }

  selectMonth(month: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const newDate = new Date(this.currentCalendarMonth);
    newDate.setMonth(month);
    this.currentCalendarMonth = new Date(newDate);
    // 使用 setTimeout 延迟关闭选择器，确保事件处理完成
    setTimeout(() => {
      this.showMonthSelector = false;
      this.showYearSelector = false;
      // 强制触发变更检测
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }, 0);
  }

  getCurrentMonthYear(): string {
    const year = this.currentCalendarMonth.getFullYear();
    const month = this.currentCalendarMonth.getMonth() + 1;
    return `${year}年${month}月`;
  }

  get calendarDays(): Date[] {
    const days: Date[] = [];
    const year = this.currentCalendarMonth.getFullYear();
    const month = this.currentCalendarMonth.getMonth();
    
    // 获取当月第一天
    const firstDay = new Date(year, month, 1);
    // 获取当月最后一天
    const lastDay = new Date(year, month + 1, 0);
    
    // 获取第一天是星期几（0=周日，1=周一...）
    const firstDayOfWeek = firstDay.getDay();
    
    // 获取上个月的最后几天（用于填充日历开头）
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    // 添加上个月的最后几天
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(date);
    }
    
    // 添加当月的所有日期
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }
    
    // 获取最后一天是星期几
    const lastDayOfWeek = lastDay.getDay();
    // 添加下个月的前几天（用于填充日历结尾，使日历完整显示6行）
    const remainingDays = 6 * 7 - days.length; // 6行 * 7天 = 42天
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push(date);
    }
    
    return days;
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentCalendarMonth.getMonth() &&
           date.getFullYear() === this.currentCalendarMonth.getFullYear();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return this.isSameDay(date, today);
  }

  getDayName(date: Date): string {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return days[date.getDay()];
  }

  getDayNumber(date: Date): string {
    return date.getDate().toString();
  }

  getDayMonth(date: Date): string {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    return months[date.getMonth()];
  }

  isDateSelected(date: Date): boolean {
    if (!this.selectedDate) {
      return false;
    }
    return this.isSameDay(date, this.selectedDate);
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  selectDate(date: Date, event?: Event): void {
    console.log("selectDate", date);
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    // 创建新的日期对象，重置时间部分，只保留日期
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    this.selectedDate = selectedDate;
    this.filterSprintHistory();
    // 强制触发变更检测
    this.cdr.markForCheck();
  }

  selectToday(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const today = new Date();
    // 更新当前显示的月份为今天
    this.currentCalendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    // 选择今天
    this.selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    // 关闭选择器
    this.showMonthSelector = false;
    this.showYearSelector = false;
    // 筛选冲刺历史
    this.filterSprintHistory();
    // 强制触发变更检测
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  filterSprintHistory(): void {
    if (!this.selectedDate) {
      // 创建新数组引用，确保变更检测触发
      this.filteredSprintHistory = [...this.sprintHistory];
      return;
    }
    
    // 确保 selectedDate 的时间部分为 0
    const selectedYear = this.selectedDate.getFullYear();
    const selectedMonth = this.selectedDate.getMonth();
    const selectedDay = this.selectedDate.getDate();
    
    // 创建新数组引用，确保变更检测触发
    const filtered = this.sprintHistory.filter(sprint => {
      if (!sprint.startTime) {
        return false;
      }
      const sprintDate = new Date(sprint.startTime);
      const sprintYear = sprintDate.getFullYear();
      const sprintMonth = sprintDate.getMonth();
      const sprintDay = sprintDate.getDate();
      
      return sprintYear === selectedYear && 
             sprintMonth === selectedMonth && 
             sprintDay === selectedDay;
    });
    
    // 创建新数组引用，确保变更检测触发
    this.filteredSprintHistory = [...filtered];
  }

  toggleSprintMenu(menuId: string, event?: Event, buttonElement?: HTMLElement): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    if (this.openMenuId === menuId) {
      this.openMenuId = null;
    } else {
      this.openMenuId = menuId;
      if (buttonElement) {
        setTimeout(() => {
          this.updateDropdownPosition(buttonElement);
        }, 0);
      }
    }
  }

  closeSprintMenu(): void {
    this.openMenuId = null;
  }

  continueSprint(sprint: Sprint, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    // 如果是休息类型，直接继续休息
    if (sprint.type === 'rest' || sprint.type === 'break') {
      const newSprint: Sprint = {
        id: this.generateId(),
        taskName: sprint.taskName,
        startTime: new Date(),
        duration: 0,
        status: 'running',
        type: sprint.type
      };
      this.currentSprint = newSprint;
      this.timerStatus = sprint.type;
      // 如果原冲刺是暂停的，从之前的时长继续；否则从0开始
      this.elapsedSeconds = sprint.status === 'paused' ? sprint.duration : 0;
      this.startTimer();
      this.closeSprintMenu();
      return;
    }
    
    // 找到对应的竹节，继续冲刺
    if (sprint.taskId) {
      this.dataService.getForests().subscribe(forests => {
        for (const forest of forests) {
          for (const field of forest.bambooFields) {
            for (const bamboo of field.bamboos) {
              if (bamboo.tasks) {
                const section = bamboo.tasks.find(s => s.id === sprint.taskId);
                if (section) {
                  this.selectedTask = section;
                  // 创建新的冲刺并继续
                  const newSprint: Sprint = {
                    id: this.generateId(),
                    taskId: section.id,
                    taskName: section.name,
                    startTime: new Date(),
                    duration: 0,
                    status: 'running',
                    type: 'sprint'
                  };
                  this.currentSprint = newSprint;
                  this.timerStatus = 'sprint';
                  // 如果原冲刺是暂停的，从之前的时长继续；否则从0开始
                  this.elapsedSeconds = sprint.status === 'paused' ? sprint.duration : 0;
                  this.startTimer();
                  this.closeSprintMenu();
                  return;
                }
              }
            }
          }
        }
      });
    }
  }

  restartSprint(sprint: Sprint, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    // 找到对应的竹节，重新开始冲刺
    if (sprint.taskId) {
      this.dataService.getForests().subscribe(forests => {
        for (const forest of forests) {
          for (const field of forest.bambooFields) {
            for (const bamboo of field.bamboos) {
              if (bamboo.tasks) {
                const section = bamboo.tasks.find(s => s.id === sprint.taskId);
                if (section) {
                  this.selectedTask = section;
                  this.startSprint(section);
                  this.closeSprintMenu();
                  return;
                }
              }
            }
          }
        }
      });
    }
  }

  moveSprintToTodos(sprint: Sprint, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    // 找到对应的竹节，添加到待办列表
    if (sprint.taskId) {
      this.dataService.getForests().subscribe(forests => {
        for (const forest of forests) {
          for (const field of forest.bambooFields) {
            for (const bamboo of field.bamboos) {
              if (bamboo.tasks) {
                const section = bamboo.tasks.find(s => s.id === sprint.taskId);
                if (section) {
                  // 检查是否已经存在
                  if (!this.bambooTodos.some(s => s.id === section.id)) {
                    const sectionCopy = { ...section };
                    this.bambooTodos.push(sectionCopy);
                    this.saveBambooTodos();
                  }
                  this.closeSprintMenu();
                  return;
                }
              }
            }
          }
        }
        // 如果找不到对应的竹节，但taskName存在，可以创建一个临时的竹节
        if (sprint.taskName) {
          const tempSection: BambooSection = {
            id: sprint.taskId || this.generateId(),
            bambooId: '',
            name: sprint.taskName,
            type: 'regular',
            status: 'pending',
            priority: 0,
            tags: [],
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          if (!this.bambooTodos.some(s => s.id === tempSection.id)) {
            this.bambooTodos.push(tempSection);
            this.saveBambooTodos();
          }
          this.closeSprintMenu();
        }
      });
    } else if (sprint.taskName) {
      // 如果没有taskId但有taskName，创建临时竹节
      const tempSection: BambooSection = {
        id: this.generateId(),
        bambooId: '',
        name: sprint.taskName,
        type: 'regular',
        status: 'pending',
        priority: 0,
        tags: [],
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      if (!this.bambooTodos.some(s => s.id === tempSection.id)) {
        this.bambooTodos.push(tempSection);
        this.saveBambooTodos();
      }
      this.closeSprintMenu();
    }
  }

  deleteSprint(sprint: Sprint, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    // 从冲刺历史中删除
    this.sprintHistory = this.sprintHistory.filter(s => s.id !== sprint.id);
    this.saveSprintHistory();
    this.filterSprintHistory();
    this.closeSprintMenu();
  }

  openReviewDialog(): void {
    this.reviewDate = this.selectedDate || new Date();
    const loadedData = this.loadReviewData(this.reviewDate);
    this.reviewData = {
      score: loadedData.score,
      goodThings: loadedData.goodThings || '',
      badThings: loadedData.badThings || ''
    };
    this.showReviewDialog = true;
  }

  closeReviewDialog(): void {
    this.showReviewDialog = false;
    this.reviewData = {
      score: null,
      goodThings: '',
      badThings: ''
    };
  }

  saveReview(): void {
    const key = `review_${this.reviewDate.getFullYear()}_${this.reviewDate.getMonth()}_${this.reviewDate.getDate()}`;
    const dataToSave = {
      score: this.reviewData.score,
      goodThings: this.reviewData.goodThings.trim(),
      badThings: this.reviewData.badThings.trim()
    };
    localStorage.setItem(key, JSON.stringify(dataToSave));
    this.closeReviewDialog();
  }

  loadReviewData(date: Date): { score: number | null; goodThings: string; badThings: string } {
    const key = `review_${date.getFullYear()}_${date.getMonth()}_${date.getDate()}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 兼容旧格式（纯文本）
        if (typeof parsed === 'string') {
          return { score: null, goodThings: parsed, badThings: '' };
        }
        return {
          score: parsed.score || null,
          goodThings: parsed.goodThings || '',
          badThings: parsed.badThings || ''
        };
      } catch (e) {
        // 如果解析失败，当作旧格式处理
        return { score: null, goodThings: saved, badThings: '' };
      }
    }
    return { score: null, goodThings: '', badThings: '' };
  }

  formatReviewDate(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  }

  getStarActive(score: number): boolean {
    // 如果有悬停分数，显示悬停分数及其左侧的星星
    if (this.hoveredScore !== null) {
      return this.hoveredScore >= score;
    }
    // 如果有已选择的分数，显示已选择分数及其左侧的星星
    if (this.reviewData.score !== null) {
      return this.reviewData.score >= score;
    }
    return false;
  }

  loadBambooTodos(): void {
    const saved = localStorage.getItem('bambooTodos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 将日期字符串转换回Date对象
        this.bambooTodos = parsed.map((todo: any) => ({
          ...todo,
          createdAt: todo.createdAt ? new Date(todo.createdAt) : new Date(),
          updatedAt: todo.updatedAt ? new Date(todo.updatedAt) : new Date(),
          completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
        }));
      } catch (e) {
        console.error('Failed to load bamboo todos:', e);
        this.bambooTodos = [];
      }
    }
  }

  saveBambooTodos(): void {
    try {
      localStorage.setItem('bambooTodos', JSON.stringify(this.bambooTodos));
    } catch (e) {
      console.error('Failed to save bamboo todos:', e);
    }
  }
}

