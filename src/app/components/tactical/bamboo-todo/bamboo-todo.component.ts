import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { DataService } from '../../../services/data.service';
import { Task } from '../../../models/task.model';
import { Bamboo, BambooField, BambooForest } from '../../../models/bamboo-forest.model';

@Component({
  selector: 'app-bamboo-todo',
  templateUrl: './bamboo-todo.component.html',
  styleUrls: ['./bamboo-todo.component.css'],
  standalone: false
})
export class BambooTodoComponent implements OnInit {
  bambooId: string = '';
  bamboo: Bamboo | undefined;
  field: BambooField | undefined;
  forest: BambooForest | undefined;
  tasks: Task[] = [];
  todoTasks: Task[] = [];

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
      this.todoTasks = tasks.filter(t => t.status !== 'completed');
    });

    this.dataService.getForests().subscribe(forests => {
      for (const forest of forests) {
        for (const field of forest.bambooFields) {
          const bamboo = field.bamboos.find(b => b.id === this.bambooId);
          if (bamboo) {
            this.bamboo = bamboo;
            this.field = field;
            this.forest = forest;
            break;
          }
        }
      }
    });
  }

  toggleTaskStatus(task: Task): void {
    if (task.status === 'pending') {
      task.status = 'in-progress';
    } else if (task.status === 'in-progress') {
      task.status = 'completed';
    } else {
      task.status = 'pending';
    }
    task.updatedAt = new Date();
    this.taskService.updateTask(task);
    this.loadData();
  }
}

