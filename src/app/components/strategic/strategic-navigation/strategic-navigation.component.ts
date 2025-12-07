import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { BambooForest } from '../../../models/bamboo-forest.model';

@Component({
  selector: 'app-strategic-navigation',
  templateUrl: './strategic-navigation.component.html',
  styleUrls: ['./strategic-navigation.component.css'],
  standalone: false
})
export class StrategicNavigationComponent implements OnInit {
  forests: BambooForest[] = [];

  // 对话框状态
  showForestDialog = false;
  isEditingForest = false;

  // 下拉菜单状态
  openMenuId: string | null = null;

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

  constructor(
    private dataService: DataService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.dataService.getForests().subscribe(forests => {
      this.forests = forests;
    });
  }

  selectForest(forest: BambooForest): void {
    if (forest.archived) {
      return; // 已归档的竹林不能选择
    }
    // 导航到竹田页面（使用相对路径，因为现在是子路由）
    this.router.navigate(['forests', forest.id], { relativeTo: this.route });
  }

  openForestDialog(forest?: BambooForest): void {
    if (forest) {
      this.isEditingForest = true;
      this.newForest = {
        name: forest.name,
        startDate: new Date(forest.startDate).toISOString().split('T')[0],
        endDate: new Date(forest.endDate).toISOString().split('T')[0],
        description: forest.description || ''
      };
    } else {
      this.isEditingForest = false;
      this.newForest = {
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        description: ''
      };
    }
    this.showForestDialog = true;
    this.closeMenu();
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

    let editingForest: BambooForest | null = null;
    if (this.isEditingForest) {
      // 从路由中获取当前编辑的竹林ID
      const currentUrl = this.router.url;
      const match = currentUrl.match(/\/strategic\/forests\/([^\/]+)/);
      if (match) {
        const forestId = match[1];
        editingForest = this.forests.find(f => f.id === forestId) || null;
      }
    }

    if (this.isEditingForest && editingForest) {
      const updatedForest: BambooForest = {
        ...editingForest,
        name: this.newForest.name!,
        startDate: new Date(this.newForest.startDate!),
        endDate: new Date(this.newForest.endDate!),
        description: this.newForest.description || '',
        updatedAt: new Date()
      };
      this.dataService.updateForest(updatedForest);
    } else {
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
    }
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

  deleteForest(forest: BambooForest, event: Event): void {
    event.stopPropagation();
    if (confirm(`确定要删除竹林"${forest.name}"吗？此操作不可恢复！`)) {
      this.dataService.deleteForest(forest.id);
      this.loadData();
    }
  }

  archiveForest(forest: BambooForest, event: Event): void {
    event.stopPropagation();
    const action = forest.archived ? '取消归档' : '归档';
    if (confirm(`确定要${action}竹林"${forest.name}"吗？`)) {
      this.dataService.archiveForest(forest.id, !forest.archived);
      this.loadData();
    }
  }

  toggleMenu(menuId: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === menuId ? null : menuId;
  }

  closeMenu(): void {
    this.openMenuId = null;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

