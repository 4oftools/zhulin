import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { DataService } from '../../../services/data.service';
import { Task } from '../../../models/task.model';
import { Bamboo, BambooField, BambooForest } from '../../../models/bamboo-forest.model';
import { Goal } from '../../../models/goal.model';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
  standalone: false
})
export class TaskComponent implements OnInit {
  bambooId: string = '';
  bamboo: Bamboo | undefined;
  field: BambooField | undefined;
  forest: BambooForest | undefined;
  tasks: Task[] = [];
  goals: Goal[] = [];
  showAddForm = false;
  taskType: 'regular' | 'periodic' | 'label' = 'regular';
  newTask: Partial<Task> = {
    name: '',
    description: '',
    type: 'regular',
    status: 'pending',
    priority: 1,
    tags: []
  };

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private taskService: TaskService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.bambooId = this.route.snapshot.paramMap.get('bambooId') || '';
    this.loadData();
  }

  loadData(): void {
    this.taskService.getTasksByBamboo(this.bambooId).subscribe(tasks => {
      this.tasks = tasks;
    });

    this.dataService.getForests().subscribe(forests => {
      for (const forest of forests) {
        for (const field of forest.bambooFields) {
          const bamboo = field.bamboos.find(b => b.id === this.bambooId);
          if (bamboo) {
            this.bamboo = bamboo;
            this.field = field;
            this.forest = forest;
            this.goals = field.goals || [];
            break;
          }
        }
      }
    });
  }

  addTask(): void {
    if (!this.newTask.name) return;

    const task: Task = {
      id: this.generateId(),
      bambooId: this.bambooId,
      goalId: this.newTask.goalId,
      name: this.newTask.name!,
      description: this.newTask.description,
      type: this.taskType,
      status: 'pending',
      priority: this.newTask.priority || 1,
      estimatedDuration: this.newTask.estimatedDuration,
      tags: this.newTask.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: this.newTask.dueDate,
      period: this.taskType === 'periodic' ? this.newTask.period : undefined
    };

    this.taskService.addTask(task);
    this.showAddForm = false;
    this.resetForm();
    this.loadData();
  }

  updateTask(task: Task): void {
    task.updatedAt = new Date();
    this.taskService.updateTask(task);
    this.loadData();
  }

  deleteTask(id: string): void {
    if (confirm('确定要删除这个任务吗？')) {
      this.taskService.deleteTask(this.bambooId, id);
      this.loadData();
    }
  }

  toggleStatus(task: Task): void {
    if (task.status === 'pending') {
      task.status = 'in-progress';
    } else if (task.status === 'in-progress') {
      task.status = 'completed';
    } else {
      task.status = 'pending';
    }
    this.updateTask(task);
  }

  setTaskType(type: 'regular' | 'periodic' | 'label'): void {
    this.taskType = type;
    this.newTask.type = type;
    if (type === 'periodic' && !this.newTask.period) {
      this.newTask.period = {
        type: 'daily',
        interval: 1
      };
    }
  }

  getGoalName(goalId?: string): string {
    if (!goalId) return '';
    const goal = this.goals.find(g => g.id === goalId);
    return goal ? goal.name : '';
  }

  private resetForm(): void {
    this.newTask = {
      name: '',
      description: '',
      type: 'regular',
      status: 'pending',
      priority: 1,
      tags: []
    };
    this.taskType = 'regular';
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

