import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { BambooForest } from '../../models/bamboo-forest.model';
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

