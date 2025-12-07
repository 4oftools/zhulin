import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { BambooForest, BambooField, Bamboo } from '../../../models/bamboo-forest.model';
import { BambooSection } from '../../../models/bamboo-forest.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-bamboo-fields',
  templateUrl: './bamboo-fields.component.html',
  styleUrls: ['./bamboo-fields.component.css'],
  standalone: false
})
export class BambooFieldsComponent implements OnInit {
  forest: BambooForest | null = null;
  selectedField: BambooField | null = null;
  fields: BambooField[] = [];

  // 对话框状态
  showFieldDialog = false;
  showBambooDialog = false;
  isEditingField = false;
  isEditingBamboo = false;

  // 下拉菜单状态
  openMenuId: string | null = null;

  // 表单数据
  newField: {
    name: string;
    startDate: string;
    endDate: string;
    description: string;
  } = {
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    description: ''
  };

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

  editingBambooId: string | null = null;

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const forestId = params['forestId'];
      if (forestId) {
        this.loadForest(forestId);
      }
    });
  }

  loadForest(forestId: string): void {
    this.dataService.getForests().subscribe(forests => {
      this.forest = forests.find(f => f.id === forestId) || null;
      if (this.forest) {
        this.fields = this.forest.bambooFields.filter(f => !f.archived);
        // 为每个竹子添加假竹节数据（如果还没有竹节）
        this.addMockTasksToBamboos();
      } else {
        // 如果找不到竹林，重定向到战略管理页面
        this.router.navigate(['/strategic']);
      }
    });
  }

  addMockTasksToBamboos(): void {
    if (!this.forest) return;
    
    const mockTasks: { [key: string]: BambooSection[] } = {
      'task1': [
        {
          id: 't1',
          bambooId: '',
          name: '完成项目需求分析',
          description: '梳理用户需求，编写需求文档',
          type: 'regular' as const,
          status: 'in-progress' as const,
          priority: 1,
          tags: ['重要', '紧急'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 't2',
          bambooId: '',
          name: '设计系统架构',
          description: '绘制架构图，确定技术栈',
          type: 'regular' as const,
          status: 'pending' as const,
          priority: 2,
          tags: ['设计'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 't3',
          bambooId: '',
          name: '代码审查',
          description: '审查团队提交的代码',
          type: 'regular' as const,
          status: 'completed' as const,
          priority: 3,
          tags: ['审查'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      'task2': [
        {
          id: 't4',
          bambooId: '',
          name: '编写单元测试',
          description: '为核心功能编写测试用例',
          type: 'regular' as const,
          status: 'pending' as const,
          priority: 1,
          tags: ['测试'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 't5',
          bambooId: '',
          name: '优化数据库查询',
          description: '分析慢查询，优化SQL语句',
          type: 'regular' as const,
          status: 'in-progress' as const,
          priority: 2,
          tags: ['优化'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      'task3': [
        {
          id: 't6',
          bambooId: '',
          name: '部署到生产环境',
          description: '配置服务器，部署应用',
          type: 'regular' as const,
          status: 'pending' as const,
          priority: 1,
          tags: ['部署'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 't7',
          bambooId: '',
          name: '性能测试',
          description: '进行压力测试和性能分析',
          type: 'regular' as const,
          status: 'pending' as const,
          priority: 2,
          tags: ['测试'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 't8',
          bambooId: '',
          name: '修复已知bug',
          description: '修复测试中发现的问题',
          type: 'regular' as const,
          status: 'completed' as const,
          priority: 1,
          tags: ['修复'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    };

    // 为每个竹田的每个竹子添加假任务
    this.fields.forEach((field, fieldIndex) => {
      field.bamboos.forEach((bamboo, bambooIndex) => {
        // 如果竹子还没有竹节，添加假竹节
        if (!bamboo.tasks || bamboo.tasks.length === 0) {
          const sectionKey = `task${(bambooIndex % 3) + 1}`;
          const sections = mockTasks[sectionKey] || [];
          // 为每个竹节设置正确的 bambooId
          bamboo.tasks = sections.map((section: BambooSection) => ({
            ...section,
            bambooId: bamboo.id,
            id: `${bamboo.id}-${section.id}`
          }));
        }
      });
    });
  }

  selectField(field: BambooField): void {
    if (field.archived) {
      return;
    }
    this.selectedField = field;
  }

  dropField(event: CdkDragDrop<BambooField[]>): void {
    if (!this.forest) return;
    
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;
    
    const field = this.fields[previousIndex];
    this.fields.splice(previousIndex, 1);
    this.fields.splice(currentIndex, 0, field);
    
    this.dataService.updateFieldOrder(this.forest.id, this.fields);
  }

  dropBamboo(event: CdkDragDrop<Bamboo[]>): void {
    if (!this.forest) return;

    const draggedBamboo = event.item.data;
    
    // 获取源竹田和目标竹田
    const previousContainerId = event.previousContainer.id;
    const currentContainerId = event.container.id;
    
    const previousFieldId = previousContainerId.replace('bamboo-list-', '');
    const targetFieldId = currentContainerId.replace('bamboo-list-', '');
    
    const previousField = this.fields.find(f => f.id === previousFieldId);
    const targetField = this.fields.find(f => f.id === targetFieldId);
    
    if (!previousField || !targetField) return;

    // 如果是同一个竹田内的拖拽
    if (previousFieldId === targetFieldId) {
      const bamboos = [...targetField.bamboos];
      const previousIndex = event.previousIndex;
      const currentIndex = event.currentIndex;
      
      // 移动竹子
      const [movedBamboo] = bamboos.splice(previousIndex, 1);
      bamboos.splice(currentIndex, 0, movedBamboo);
      
      // 更新竹田的竹子列表
      const updatedField: BambooField = {
        ...targetField,
        bamboos: bamboos
      };
      this.dataService.updateField(updatedField);
    } else {
      // 跨竹田拖拽
      const previousBamboos = [...previousField.bamboos];
      const targetBamboos = [...targetField.bamboos];
      
      // 从原竹田移除
      const [movedBamboo] = previousBamboos.splice(event.previousIndex, 1);
      
      // 更新竹子的fieldId和所有竹节的bambooId
      movedBamboo.fieldId = targetField.id;
      if (movedBamboo.tasks) {
        movedBamboo.tasks = movedBamboo.tasks.map(section => ({
          ...section,
          bambooId: movedBamboo.id
        }));
      }
      
      // 添加到目标竹田
      targetBamboos.splice(event.currentIndex, 0, movedBamboo);
      
      // 更新两个竹田
      const updatedPreviousField: BambooField = {
        ...previousField,
        bamboos: previousBamboos
      };
      const updatedTargetField: BambooField = {
        ...targetField,
        bamboos: targetBamboos
      };
      
      this.dataService.updateField(updatedPreviousField);
      this.dataService.updateField(updatedTargetField);
    }
    
    // 重新加载数据
    this.loadForest(this.forest.id);
  }

  openFieldDialog(field?: BambooField): void {
    if (!this.forest) {
      alert('请先选择竹林');
      return;
    }
    if (field) {
      this.isEditingField = true;
      this.selectedField = field;
      this.newField = {
        name: field.name,
        startDate: new Date(field.startDate).toISOString().split('T')[0],
        endDate: new Date(field.endDate).toISOString().split('T')[0],
        description: field.description || ''
      };
    } else {
      this.isEditingField = false;
      this.newField = {
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        description: ''
      };
    }
    this.showFieldDialog = true;
    this.closeMenu();
  }

  closeFieldDialog(): void {
    this.showFieldDialog = false;
    this.resetFieldForm();
  }

  addField(): void {
    if (!this.forest) {
      alert('请先选择竹林');
      return;
    }

    if (!this.newField.name || !this.newField.startDate || !this.newField.endDate) {
      alert('请填写所有必填项');
      return;
    }

    if (this.isEditingField && this.selectedField) {
      const updatedField: BambooField = {
        ...this.selectedField,
        name: this.newField.name!,
        startDate: new Date(this.newField.startDate!),
        endDate: new Date(this.newField.endDate!),
        description: this.newField.description || '',
        updatedAt: new Date()
      };
      this.dataService.updateField(updatedField);
    } else {
      const field: BambooField = {
        id: this.generateId(),
        forestId: this.forest.id,
        name: this.newField.name!,
        startDate: new Date(this.newField.startDate!),
        endDate: new Date(this.newField.endDate!),
        description: this.newField.description || '',
        bamboos: [],
        goals: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.dataService.addField(field);
    }
    this.loadForest(this.forest.id);
    this.closeFieldDialog();
  }

  resetFieldForm(): void {
    this.newField = {
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      description: ''
    };
  }

  openBambooDialog(field: BambooField, bamboo?: Bamboo, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!field) {
      alert('请先选择竹田');
      return;
    }
    this.selectField(field);
    if (bamboo) {
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
    } else {
      this.isEditingBamboo = false;
      this.editingBambooId = null;
      this.newBamboo = {
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        description: '',
        completed: false
      };
      // 新建时，竹节列表为空
      this.dialogSections = [];
    }
    this.showBambooDialog = true;
    this.closeMenu();
  }

  closeBambooDialog(): void {
    this.showBambooDialog = false;
    this.resetBambooForm();
    this.dialogSections = [];
    this.closeSectionDialog();
  }

  addBamboo(): void {
    if (!this.selectedField) {
      alert('请先选择竹田');
      return;
    }

    if (!this.newBamboo.name || !this.newBamboo.startDate || !this.newBamboo.endDate) {
      alert('请填写所有必填项');
      return;
    }

    if (this.isEditingBamboo && this.editingBambooId) {
      const currentBamboo = this.selectedField.bamboos.find(b => b.id === this.editingBambooId);
      if (currentBamboo) {
        const updatedBamboo: Bamboo = {
          ...currentBamboo,
          name: this.newBamboo.name!,
          startDate: new Date(this.newBamboo.startDate!),
          endDate: new Date(this.newBamboo.endDate!),
          description: this.newBamboo.description || '',
          completed: this.newBamboo.completed,
          completedAt: this.newBamboo.completed ? new Date() : undefined,
          tasks: this.dialogSections.map(section => ({
            ...section,
            bambooId: currentBamboo.id
          })),
          updatedAt: new Date()
        };
        this.dataService.updateBamboo(updatedBamboo);
      }
    } else {
      const bambooId = this.generateId();
      const bamboo: Bamboo = {
        id: bambooId,
        fieldId: this.selectedField.id,
        name: this.newBamboo.name!,
        startDate: new Date(this.newBamboo.startDate!),
        endDate: new Date(this.newBamboo.endDate!),
        description: this.newBamboo.description || '',
        completed: this.newBamboo.completed,
        completedAt: this.newBamboo.completed ? new Date() : undefined,
        tasks: this.dialogSections.map(section => ({
          ...section,
          bambooId: bambooId,
          id: section.id || this.generateId()
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.dataService.addBamboo(bamboo);
    }
    if (this.forest) {
      this.loadForest(this.forest.id);
    }
    this.closeBambooDialog();
  }

  resetBambooForm(): void {
    this.newBamboo = {
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      description: '',
      completed: false
    };
  }

  toggleMenu(menuId: string, event: Event): void {
    event.stopPropagation();
    if (this.openMenuId === menuId) {
      this.openMenuId = null;
    } else {
      this.openMenuId = menuId;
    }
  }

  closeMenu(): void {
    this.openMenuId = null;
  }

  archiveField(field: BambooField, event: Event): void {
    event.stopPropagation();
    if (!this.forest) return;
    if (confirm(`确定要${field.archived ? '取消归档' : '归档'}这个竹田吗？`)) {
      this.dataService.archiveField(this.forest.id, field.id, !field.archived);
      this.loadForest(this.forest.id);
    }
    this.closeMenu();
  }

  deleteField(field: BambooField, event: Event): void {
    event.stopPropagation();
    if (!this.forest) return;
    if (confirm('确定要删除这个竹田吗？此操作不可恢复！')) {
      this.dataService.deleteField(this.forest.id, field.id);
      this.loadForest(this.forest.id);
    }
    this.closeMenu();
  }

  archiveBamboo(bamboo: Bamboo, event: Event): void {
    event.stopPropagation();
    if (!this.selectedField) return;
    if (confirm(`确定要归档这个竹子吗？`)) {
      this.dataService.archiveBamboo(this.selectedField.id, bamboo.id, true);
      if (this.forest) {
        this.loadForest(this.forest.id);
      }
    }
    this.closeMenu();
  }

  deleteBamboo(bamboo: Bamboo, event: Event): void {
    event.stopPropagation();
    if (!this.selectedField) return;
    if (confirm('确定要删除这个竹子吗？此操作不可恢复！')) {
      this.dataService.deleteBamboo(this.selectedField.id, bamboo.id);
      if (this.forest) {
        this.loadForest(this.forest.id);
      }
    }
    this.closeMenu();
  }

  openGoalDialog(): void {
    // TODO: 实现目标管理
    alert('目标管理功能待实现');
  }

  openKeyOutputDialog(): void {
    // TODO: 实现关键产出管理
    alert('关键产出管理功能待实现');
  }

  openLearningDialog(): void {
    // TODO: 实现习得管理
    alert('习得管理功能待实现');
  }

  toggleBambooCompleted(bamboo: Bamboo, event: Event): void {
    event.stopPropagation();
    if (!this.forest) return;
    
    bamboo.completed = !bamboo.completed;
    if (bamboo.completed) {
      bamboo.completedAt = new Date();
    } else {
      bamboo.completedAt = undefined;
    }
    bamboo.updatedAt = new Date();
    
    this.dataService.updateBamboo(bamboo);
    if (this.forest) {
      this.loadForest(this.forest.id);
    }
  }

  toggleSectionCompleted(bamboo: Bamboo, section: BambooSection, event: Event): void {
    event.stopPropagation();
    if (!this.forest) return;
    
    section.completed = !section.completed;
    if (section.completed) {
      section.completedAt = new Date();
    } else {
      section.completedAt = undefined;
    }
    section.updatedAt = new Date();
    
    // 更新竹节
    const sectionIndex = bamboo.tasks.findIndex(s => s.id === section.id);
    if (sectionIndex !== -1) {
      bamboo.tasks[sectionIndex] = section;
      this.dataService.updateBamboo(bamboo);
      if (this.forest) {
        this.loadForest(this.forest.id);
      }
    }
  }

  deleteSection(bamboo: Bamboo, section: BambooSection, event: Event): void {
    event.stopPropagation();
    if (!this.forest) return;
    
    if (confirm('确定要删除这个竹节吗？此操作不可恢复！')) {
      // 从竹子的竹节列表中移除该竹节
      const sectionIndex = bamboo.tasks.findIndex(s => s.id === section.id);
      if (sectionIndex !== -1) {
        bamboo.tasks.splice(sectionIndex, 1);
        bamboo.updatedAt = new Date();
        this.dataService.updateBamboo(bamboo);
        if (this.forest) {
          this.loadForest(this.forest.id);
        }
      }
    }
  }

  // 竹节管理方法
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
    if (!this.newSection.name) {
      alert('请输入竹节名称');
      return;
    }

    if (this.isEditingSection && this.editingSectionId) {
      const sectionIndex = this.dialogSections.findIndex(s => s.id === this.editingSectionId);
      if (sectionIndex !== -1) {
        this.dialogSections[sectionIndex] = {
          ...this.dialogSections[sectionIndex],
          name: this.newSection.name,
          description: this.newSection.description,
          completed: this.newSection.completed,
          completedAt: this.newSection.completed ? new Date() : undefined,
          updatedAt: new Date()
        };
      }
    } else {
      const section: BambooSection = {
        id: this.generateId(),
        bambooId: this.editingBambooId || '',
        name: this.newSection.name,
        description: this.newSection.description,
        type: 'regular',
        status: 'pending',
        completed: this.newSection.completed,
        completedAt: this.newSection.completed ? new Date() : undefined,
        priority: 0,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.dialogSections.push(section);
    }
    this.closeSectionDialog();
  }

  deleteSectionFromDialog(section: BambooSection): void {
    if (confirm('确定要删除这个竹节吗？')) {
      const index = this.dialogSections.findIndex(s => s.id === section.id);
      if (index !== -1) {
        this.dialogSections.splice(index, 1);
      }
    }
  }

  dropSection(event: CdkDragDrop<BambooSection[]>): void {
    moveItemInArray(this.dialogSections, event.previousIndex, event.currentIndex);
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

