import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { BambooField, BambooForest } from '../../../models/bamboo-forest.model';
import { Goal } from '../../../models/goal.model';

@Component({
  selector: 'app-goal',
  templateUrl: './goal.component.html',
  styleUrls: ['./goal.component.css'],
  standalone: false
})
export class GoalComponent implements OnInit {
  fieldId: string = '';
  field: BambooField | undefined;
  forest: BambooForest | undefined;
  goals: Goal[] = [];
  showAddForm = false;
  newGoal: Partial<Goal> = {
    name: '',
    description: '',
    status: 'active',
    priority: 1
  };

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.fieldId = this.route.snapshot.paramMap.get('fieldId') || '';
    this.loadData();
  }

  loadData(): void {
    this.dataService.getForests().subscribe(forests => {
      for (const forest of forests) {
        const field = forest.bambooFields.find(f => f.id === this.fieldId);
        if (field) {
          this.field = field;
          this.forest = forest;
          this.goals = field.goals || [];
          break;
        }
      }
    });
  }

  addGoal(): void {
    if (!this.newGoal.name || !this.field) return;

    if (this.goals.length >= 7) {
      alert('目标数量不能超过7个！');
      return;
    }

    const goal: Goal = {
      id: this.generateId(),
      fieldId: this.fieldId,
      name: this.newGoal.name!,
      description: this.newGoal.description,
      status: this.newGoal.status || 'active',
      priority: this.newGoal.priority || 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.dataService.addGoal(goal);
    this.showAddForm = false;
    this.resetForm();
    this.loadData();
  }

  updateGoal(goal: Goal): void {
    goal.updatedAt = new Date();
    this.dataService.updateGoal(goal);
    this.loadData();
  }

  deleteGoal(id: string): void {
    if (confirm('确定要删除这个目标吗？')) {
      this.dataService.deleteGoal(this.fieldId, id);
      this.loadData();
    }
  }

  toggleStatus(goal: Goal): void {
    if (goal.status === 'active') {
      goal.status = 'completed';
    } else if (goal.status === 'completed') {
      goal.status = 'paused';
    } else {
      goal.status = 'active';
    }
    this.updateGoal(goal);
  }

  private resetForm(): void {
    this.newGoal = {
      name: '',
      description: '',
      status: 'active',
      priority: 1
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

