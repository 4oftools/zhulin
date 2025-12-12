import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { BambooForest, BambooField, Bamboo, Goal, KeyOutput, Learning } from '../../../models/bamboo-forest.model';
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
  showForestDialog = false;
  showGoalDialog = false;
  showKeyOutputDialog = false;
  showLearningDialog = false;
  isEditingField = false;
  isEditingBamboo = false;
  isEditingForest = false;

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

  newForest: {
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
    goalId: string;
  } = {
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    description: '',
    completed: false,
    goalId: ''
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

  // 目标管理
  goals: Goal[] = [];
  showGoalEditDialog = false;
  isEditingGoal = false;
  editingGoalId: string | null = null;
  newGoal: {
    name: string;
    description: string;
    completed: boolean;
  } = {
    name: '',
    description: '',
    completed: false
  };

  // 关键产出管理
  keyOutputs: KeyOutput[] = [];
  showKeyOutputEditDialog = false;
  isEditingKeyOutput = false;
  editingKeyOutputId: string | null = null;
  newKeyOutput: {
    name: string;
    description: string;
    completed: boolean;
  } = {
    name: '',
    description: '',
    completed: false
  };

  // 习得管理
  learnings: Learning[] = [];
  showLearningEditDialog = false;
  isEditingLearning = false;
  editingLearningId: string | null = null;
  newLearning: {
    title: string;
    content: string;
    tags: string;
  } = {
    title: '',
    content: '',
    tags: ''
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
    if (!this.forest) {
      alert('请先选择竹林');
      return;
    }
    this.selectField(field);
    // 加载目标列表
    this.goals = this.forest.goals || [];
    if (bamboo) {
      this.isEditingBamboo = true;
      this.editingBambooId = bamboo.id;
      this.newBamboo = {
        name: bamboo.name,
        startDate: new Date(bamboo.startDate).toISOString().split('T')[0],
        endDate: new Date(bamboo.endDate).toISOString().split('T')[0],
        description: bamboo.description || '',
        completed: bamboo.completed || false,
        goalId: bamboo.goalId || ''
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
        completed: false,
        goalId: ''
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

    if (!this.newBamboo.goalId) {
      alert('请选择一个目标');
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
          goalId: this.newBamboo.goalId,
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
        goalId: this.newBamboo.goalId,
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
      completed: false,
      goalId: ''
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

  // 目标管理方法
  openGoalDialog(): void {
    if (!this.forest) {
      alert('请先选择竹林');
      return;
    }
    this.goals = this.forest.goals || [];
    this.showGoalDialog = true;
    this.closeMenu();
  }

  closeGoalDialog(): void {
    this.showGoalDialog = false;
    this.goals = [];
    this.resetGoalForm();
  }

  openGoalEditDialog(goal?: Goal): void {
    if (goal) {
      this.isEditingGoal = true;
      this.editingGoalId = goal.id;
      this.newGoal = {
        name: goal.name,
        description: goal.description || '',
        completed: goal.completed || false
      };
    } else {
      this.isEditingGoal = false;
      this.editingGoalId = null;
      this.resetGoalForm();
    }
    this.showGoalEditDialog = true;
  }

  closeGoalEditDialog(): void {
    this.showGoalEditDialog = false;
    this.isEditingGoal = false;
    this.editingGoalId = null;
    this.resetGoalForm();
  }

  addGoal(): void {
    if (!this.newGoal.name) {
      alert('请输入目标名称');
      return;
    }
    if (!this.forest) {
      alert('请先选择竹林');
      return;
    }

    const forestId = this.forest.id;

    if (this.isEditingGoal && this.editingGoalId) {
      const goal = this.goals.find(g => g.id === this.editingGoalId);
      if (goal) {
        const updatedGoal: Goal = {
          ...goal,
          name: this.newGoal.name,
          description: this.newGoal.description,
          completed: this.newGoal.completed,
          completedAt: this.newGoal.completed ? new Date() : undefined,
          updatedAt: new Date()
        };
        this.dataService.updateGoal(updatedGoal);
      }
    } else {
      const goal: Goal = {
        id: this.generateId(),
        forestId: forestId,
        name: this.newGoal.name,
        description: this.newGoal.description,
        completed: this.newGoal.completed,
        completedAt: this.newGoal.completed ? new Date() : undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.dataService.addGoal(goal);
    }
    
    // 重新加载数据并更新列表
    this.dataService.getForests().subscribe(forests => {
      const updatedForest = forests.find(f => f.id === forestId);
      if (updatedForest) {
        this.forest = updatedForest;
        this.goals = updatedForest.goals || [];
        this.fields = updatedForest.bambooFields.filter(f => !f.archived);
        this.addMockTasksToBamboos();
      }
    });
    this.closeGoalEditDialog();
  }

  deleteGoal(goal: Goal, event: Event): void {
    event.stopPropagation();
    if (confirm('确定要删除这个目标吗？此操作不可恢复！')) {
      if (!this.forest) return;
      const forestId = this.forest.id;
      this.dataService.deleteGoal(forestId, goal.id);
      this.dataService.getForests().subscribe(forests => {
        const updatedForest = forests.find(f => f.id === forestId);
        if (updatedForest) {
          this.forest = updatedForest;
          this.goals = updatedForest.goals || [];
          this.fields = updatedForest.bambooFields.filter(f => !f.archived);
          this.addMockTasksToBamboos();
        }
      });
    }
  }

  resetGoalForm(): void {
    this.newGoal = {
      name: '',
      description: '',
      completed: false
    };
  }

  // 关键产出管理方法
  openKeyOutputDialog(): void {
    if (!this.forest) {
      alert('请先选择竹林');
      return;
    }
    this.keyOutputs = this.forest.keyOutputs || [];
    this.showKeyOutputDialog = true;
    this.closeMenu();
  }

  closeKeyOutputDialog(): void {
    this.showKeyOutputDialog = false;
    this.keyOutputs = [];
    this.resetKeyOutputForm();
  }

  openKeyOutputEditDialog(keyOutput?: KeyOutput): void {
    if (keyOutput) {
      this.isEditingKeyOutput = true;
      this.editingKeyOutputId = keyOutput.id;
      this.newKeyOutput = {
        name: keyOutput.name,
        description: keyOutput.description || '',
        completed: keyOutput.completed || false
      };
    } else {
      this.isEditingKeyOutput = false;
      this.editingKeyOutputId = null;
      this.resetKeyOutputForm();
    }
    this.showKeyOutputEditDialog = true;
  }

  closeKeyOutputEditDialog(): void {
    this.showKeyOutputEditDialog = false;
    this.isEditingKeyOutput = false;
    this.editingKeyOutputId = null;
    this.resetKeyOutputForm();
  }

  addKeyOutput(): void {
    if (!this.newKeyOutput.name) {
      alert('请输入关键产出名称');
      return;
    }
    if (!this.forest) {
      alert('请先选择竹林');
      return;
    }

    const forestId = this.forest.id;

    if (this.isEditingKeyOutput && this.editingKeyOutputId) {
      const keyOutput = this.keyOutputs.find(ko => ko.id === this.editingKeyOutputId);
      if (keyOutput) {
        const updatedKeyOutput: KeyOutput = {
          ...keyOutput,
          name: this.newKeyOutput.name,
          description: this.newKeyOutput.description,
          completed: this.newKeyOutput.completed,
          completedAt: this.newKeyOutput.completed ? new Date() : undefined,
          updatedAt: new Date()
        };
        this.dataService.updateKeyOutput(updatedKeyOutput);
      }
    } else {
      const keyOutput: KeyOutput = {
        id: this.generateId(),
        forestId: forestId,
        name: this.newKeyOutput.name,
        description: this.newKeyOutput.description,
        completed: this.newKeyOutput.completed,
        completedAt: this.newKeyOutput.completed ? new Date() : undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.dataService.addKeyOutput(keyOutput);
    }
    
    // 重新加载数据并更新列表
    this.dataService.getForests().subscribe(forests => {
      const updatedForest = forests.find(f => f.id === forestId);
      if (updatedForest) {
        this.forest = updatedForest;
        this.keyOutputs = updatedForest.keyOutputs || [];
        this.fields = updatedForest.bambooFields.filter(f => !f.archived);
        this.addMockTasksToBamboos();
      }
    });
    this.closeKeyOutputEditDialog();
  }

  deleteKeyOutput(keyOutput: KeyOutput, event: Event): void {
    event.stopPropagation();
    if (confirm('确定要删除这个关键产出吗？此操作不可恢复！')) {
      if (!this.forest) return;
      const forestId = this.forest.id;
      this.dataService.deleteKeyOutput(forestId, keyOutput.id);
      this.dataService.getForests().subscribe(forests => {
        const updatedForest = forests.find(f => f.id === forestId);
        if (updatedForest) {
          this.forest = updatedForest;
          this.keyOutputs = updatedForest.keyOutputs || [];
          this.fields = updatedForest.bambooFields.filter(f => !f.archived);
          this.addMockTasksToBamboos();
        }
      });
    }
  }

  resetKeyOutputForm(): void {
    this.newKeyOutput = {
      name: '',
      description: '',
      completed: false
    };
  }

  // 习得管理方法
  openLearningDialog(): void {
    if (!this.forest) {
      alert('请先选择竹林');
      return;
    }
    this.learnings = this.forest.learnings || [];
    this.showLearningDialog = true;
    this.closeMenu();
  }

  closeLearningDialog(): void {
    this.showLearningDialog = false;
    this.learnings = [];
    this.resetLearningForm();
  }

  openLearningEditDialog(learning?: Learning): void {
    if (learning) {
      this.isEditingLearning = true;
      this.editingLearningId = learning.id;
      this.newLearning = {
        title: learning.title,
        content: learning.content,
        tags: learning.tags.join(', ')
      };
    } else {
      this.isEditingLearning = false;
      this.editingLearningId = null;
      this.resetLearningForm();
    }
    this.showLearningEditDialog = true;
  }

  closeLearningEditDialog(): void {
    this.showLearningEditDialog = false;
    this.isEditingLearning = false;
    this.editingLearningId = null;
    this.resetLearningForm();
  }

  addLearning(): void {
    if (!this.newLearning.title) {
      alert('请输入习得标题');
      return;
    }
    if (!this.forest) {
      alert('请先选择竹林');
      return;
    }

    const forestId = this.forest.id;

    if (this.isEditingLearning && this.editingLearningId) {
      const learning = this.learnings.find(l => l.id === this.editingLearningId);
      if (learning) {
        const updatedLearning: Learning = {
          ...learning,
          title: this.newLearning.title,
          content: this.newLearning.content,
          tags: this.newLearning.tags.split(',').map(t => t.trim()).filter(t => t),
          updatedAt: new Date()
        };
        this.dataService.updateLearning(updatedLearning);
      }
    } else {
      const learning: Learning = {
        id: this.generateId(),
        forestId: forestId,
        title: this.newLearning.title,
        content: this.newLearning.content,
        tags: this.newLearning.tags.split(',').map(t => t.trim()).filter(t => t),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.dataService.addLearning(learning);
    }
    
    // 重新加载数据并更新列表
    this.dataService.getForests().subscribe(forests => {
      const updatedForest = forests.find(f => f.id === forestId);
      if (updatedForest) {
        this.forest = updatedForest;
        this.learnings = updatedForest.learnings || [];
        this.fields = updatedForest.bambooFields.filter(f => !f.archived);
        this.addMockTasksToBamboos();
      }
    });
    this.closeLearningEditDialog();
  }

  deleteLearning(learning: Learning, event: Event): void {
    event.stopPropagation();
    if (confirm('确定要删除这个习得吗？此操作不可恢复！')) {
      if (!this.forest) return;
      const forestId = this.forest.id;
      this.dataService.deleteLearning(forestId, learning.id);
      this.dataService.getForests().subscribe(forests => {
        const updatedForest = forests.find(f => f.id === forestId);
        if (updatedForest) {
          this.forest = updatedForest;
          this.learnings = updatedForest.learnings || [];
          this.fields = updatedForest.bambooFields.filter(f => !f.archived);
          this.addMockTasksToBamboos();
        }
      });
    }
  }

  resetLearningForm(): void {
    this.newLearning = {
      title: '',
      content: '',
      tags: ''
    };
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

  // 竹林管理方法
  openForestDialog(): void {
    if (!this.forest) {
      alert('请先选择竹林');
      return;
    }
    this.isEditingForest = true;
    this.newForest = {
      name: this.forest.name,
      startDate: new Date(this.forest.startDate).toISOString().split('T')[0],
      endDate: new Date(this.forest.endDate).toISOString().split('T')[0],
      description: this.forest.description || ''
    };
    this.showForestDialog = true;
    this.closeMenu();
  }

  closeForestDialog(): void {
    this.showForestDialog = false;
    this.isEditingForest = false;
    this.resetForestForm();
  }

  updateForest(): void {
    if (!this.forest) {
      alert('请先选择竹林');
      return;
    }

    if (!this.newForest.name || !this.newForest.startDate || !this.newForest.endDate) {
      alert('请填写所有必填项');
      return;
    }

    const updatedForest: BambooForest = {
      ...this.forest,
      name: this.newForest.name,
      startDate: new Date(this.newForest.startDate),
      endDate: new Date(this.newForest.endDate),
      description: this.newForest.description || '',
      updatedAt: new Date()
    };
    this.dataService.updateForest(updatedForest);
    this.loadForest(this.forest.id);
    this.closeForestDialog();
  }

  resetForestForm(): void {
    this.newForest = {
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      description: ''
    };
  }
}

