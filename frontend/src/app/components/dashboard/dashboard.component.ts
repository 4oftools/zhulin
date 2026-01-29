import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { BambooForest, Goal } from '../../models/bamboo-forest.model';
import { BambooSection } from '../../models/bamboo-forest.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: false
})
export class DashboardComponent implements OnInit {
  forests: BambooForest[] = [];
  allTasks: BambooSection[] = [];
  expandedForests: Set<string> = new Set(); // 跟踪展开目标列表的竹林ID
  stats = {
    totalForests: 0,
    totalFields: 0,
    totalBamboos: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    completionRate: 0
  };

  // Expose Math to template
  Math = Math;
  readonly CIRCLE_RADIUS = 54;
  readonly CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 54;

  constructor(
    private dataService: DataService
  ) {}

  getProgressDashArray(): string {
    return `${this.CIRCLE_CIRCUMFERENCE}`;
  }

  getProgressDashOffset(): number {
    return this.CIRCLE_CIRCUMFERENCE * (1 - this.stats.completionRate / 100);
  }

  getForestStats(forest: BambooForest): {
    totalFields: number;
    totalBamboos: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    completionRate: number;
  } {
    const totalFields = forest.bambooFields.length;
    const totalBamboos = forest.bambooFields.reduce((sum, field) => sum + field.bamboos.length, 0);
    
    const allTasks: BambooSection[] = [];
    forest.bambooFields.forEach(field => {
      field.bamboos.forEach(bamboo => {
        if (bamboo.tasks) {
          allTasks.push(...bamboo.tasks);
        }
      });
    });

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'completed' || t.completed).length;
    const inProgressTasks = allTasks.filter(t => t.status === 'in-progress').length;
    const pendingTasks = allTasks.filter(t => t.status === 'pending').length;
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    return {
      totalFields,
      totalBamboos,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      completionRate
    };
  }

  getGoalStats(forest: BambooForest, goal: Goal): {
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    totalTasks: number;
  } {
    const allTasks: BambooSection[] = [];
    
    // 获取该目标下的所有任务（通过竹子关联）
    forest.bambooFields.forEach(field => {
      field.bamboos.forEach(bamboo => {
        if (bamboo.goalId === goal.id && bamboo.tasks) {
          allTasks.push(...bamboo.tasks);
        }
      });
    });

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'completed' || t.completed).length;
    const inProgressTasks = allTasks.filter(t => t.status === 'in-progress').length;
    const pendingTasks = allTasks.filter(t => t.status === 'pending').length;

    return {
      completedTasks,
      inProgressTasks,
      pendingTasks,
      totalTasks
    };
  }

  toggleForestGoals(forestId: string): void {
    if (this.expandedForests.has(forestId)) {
      this.expandedForests.delete(forestId);
    } else {
      this.expandedForests.add(forestId);
    }
  }

  isForestGoalsExpanded(forestId: string): boolean {
    return this.expandedForests.has(forestId);
  }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.dataService.getForests().subscribe(forests => {
      this.forests = forests;
      this.stats.totalForests = forests.length;
      this.stats.totalFields = forests.reduce((sum, f) => sum + f.bambooFields.length, 0);
      this.stats.totalBamboos = forests.reduce((sum, f) => 
        sum + f.bambooFields.reduce((s, field) => s + field.bamboos.length, 0), 0
      );

      this.allTasks = [];
      forests.forEach(forest => {
        forest.bambooFields.forEach(field => {
          field.bamboos.forEach(bamboo => {
            if (bamboo.tasks) {
              this.allTasks.push(...bamboo.tasks);
            }
          });
        });
      });

      this.stats.totalTasks = this.allTasks.length;
      this.stats.completedTasks = this.allTasks.filter(t => t.status === 'completed').length;
      this.stats.inProgressTasks = this.allTasks.filter(t => t.status === 'in-progress').length;
      this.stats.pendingTasks = this.allTasks.filter(t => t.status === 'pending').length;
      this.stats.completionRate = this.stats.totalTasks > 0 
        ? Math.round((this.stats.completedTasks / this.stats.totalTasks) * 100) 
        : 0;
    });
  }
}

