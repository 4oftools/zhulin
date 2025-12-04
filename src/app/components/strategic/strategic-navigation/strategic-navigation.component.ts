import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { BambooForest, BambooField, Bamboo } from '../../../models/bamboo-forest.model';

@Component({
  selector: 'app-strategic-navigation',
  templateUrl: './strategic-navigation.component.html',
  styleUrls: ['./strategic-navigation.component.css'],
  standalone: false
})
export class StrategicNavigationComponent implements OnInit {
  forests: BambooForest[] = [];
  selectedForest: BambooForest | null = null;
  selectedField: BambooField | null = null;
  fields: BambooField[] = [];
  bamboos: Bamboo[] = [];

  // 对话框状态
  showForestDialog = false;
  showFieldDialog = false;
  showBambooDialog = false;

  // 表单数据（使用字符串类型用于 HTML input）
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
  } = {
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    description: ''
  };

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.dataService.getForests().subscribe(forests => {
      this.forests = forests;
    });
  }

  selectForest(forest: BambooForest): void {
    this.selectedForest = forest;
    this.selectedField = null;
    this.fields = forest.bambooFields;
    this.bamboos = [];
  }

  selectField(field: BambooField): void {
    this.selectedField = field;
    this.bamboos = field.bamboos;
  }

  openForestDialog(): void {
    this.newForest = {
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      description: ''
    };
    this.showForestDialog = true;
  }

  closeForestDialog(): void {
    this.showForestDialog = false;
    this.resetForestForm();
  }

  addForest(): void {
    if (!this.newForest.name || !this.newForest.startDate || !this.newForest.endDate) {
      alert('请填写所有必填项');
      return;
    }

    const forest: BambooForest = {
      id: this.generateId(),
      name: this.newForest.name!,
      startDate: new Date(this.newForest.startDate!),
      endDate: new Date(this.newForest.endDate!),
      description: this.newForest.description || '',
      bambooFields: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.dataService.addForest(forest);
    this.loadData();
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

  openFieldDialog(): void {
    if (!this.selectedForest) {
      alert('请先选择竹林');
      return;
    }
    this.newField = {
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      description: ''
    };
    this.showFieldDialog = true;
  }

  closeFieldDialog(): void {
    this.showFieldDialog = false;
    this.resetFieldForm();
  }

  addField(): void {
    if (!this.selectedForest) {
      alert('请先选择竹林');
      return;
    }

    if (!this.newField.name || !this.newField.startDate || !this.newField.endDate) {
      alert('请填写所有必填项');
      return;
    }

    const field: BambooField = {
      id: this.generateId(),
      forestId: this.selectedForest.id,
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
    this.loadData();
    if (this.selectedForest) {
      this.selectForest(this.selectedForest);
    }
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

  openBambooDialog(): void {
    if (!this.selectedField) {
      alert('请先选择竹田');
      return;
    }
    this.newBamboo = {
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      description: ''
    };
    this.showBambooDialog = true;
  }

  closeBambooDialog(): void {
    this.showBambooDialog = false;
    this.resetBambooForm();
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

    const bamboo: Bamboo = {
      id: this.generateId(),
      fieldId: this.selectedField.id,
      name: this.newBamboo.name!,
      startDate: new Date(this.newBamboo.startDate!),
      endDate: new Date(this.newBamboo.endDate!),
      description: this.newBamboo.description || '',
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.dataService.addBamboo(bamboo);
    this.loadData();
    if (this.selectedField) {
      this.selectField(this.selectedField);
    }
    this.closeBambooDialog();
  }

  resetBambooForm(): void {
    this.newBamboo = {
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      description: ''
    };
  }

  deleteForest(forest: BambooForest, event: Event): void {
    event.stopPropagation();
    if (confirm(`确定要删除竹林"${forest.name}"吗？`)) {
      this.dataService.deleteForest(forest.id);
      if (this.selectedForest?.id === forest.id) {
        this.selectedForest = null;
        this.selectedField = null;
        this.fields = [];
        this.bamboos = [];
      }
      this.loadData();
    }
  }

  deleteField(field: BambooField, event: Event): void {
    event.stopPropagation();
    if (confirm(`确定要删除竹田"${field.name}"吗？`)) {
      this.dataService.deleteField(field.forestId, field.id);
      if (this.selectedField?.id === field.id) {
        this.selectedField = null;
        this.bamboos = [];
      }
      this.loadData();
      if (this.selectedForest) {
        this.selectForest(this.selectedForest);
      }
    }
  }

  deleteBamboo(bamboo: Bamboo): void {
    if (confirm(`确定要删除竹子"${bamboo.name}"吗？`)) {
      this.dataService.deleteBamboo(bamboo.fieldId, bamboo.id);
      this.loadData();
      if (this.selectedField) {
        this.selectField(this.selectedField);
      }
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

