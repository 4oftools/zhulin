import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../../services/task.service';
import { DataService } from '../../../services/data.service';
import { Task } from '../../../models/task.model';
import { BambooForest, BambooField, Bamboo } from '../../../models/bamboo-forest.model';

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.css'],
  standalone: false
})
export class ActivityListComponent implements OnInit {
  forests: BambooForest[] = [];
  allTasks: Task[] = [];
  regularTasks: Task[] = [];

  constructor(
    private taskService: TaskService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.dataService.getForests().subscribe(forests => {
      this.forests = forests;
      this.allTasks = [];
      this.regularTasks = [];
      
      forests.forEach(forest => {
        forest.bambooFields.forEach(field => {
          field.bamboos.forEach(bamboo => {
            if (bamboo.tasks) {
              this.allTasks.push(...bamboo.tasks);
              this.regularTasks.push(...bamboo.tasks.filter(t => t.type === 'regular' && t.status !== 'completed'));
            }
          });
        });
      });
    });
  }

  getBambooForTask(task: Task): { forest: BambooForest, field: BambooField, bamboo: Bamboo } | null {
    for (const forest of this.forests) {
      for (const field of forest.bambooFields) {
        for (const bamboo of field.bamboos) {
          if (bamboo.id === task.bambooId && bamboo.tasks?.some(t => t.id === task.id)) {
            return { forest, field, bamboo };
          }
        }
      }
    }
    return null;
  }
}

