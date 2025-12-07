import { Component, OnInit } from '@angular/core';
import { DataService } from './services/data.service';
import { BambooSection } from './models/bamboo-forest.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent implements OnInit {
  title = '竹林工作法';
  isLoggedIn = false;
  userName = '用户';
  taskProgress = {
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    completionRate: 0
  };

  constructor(
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.loadTaskProgress();
  }

  checkLoginStatus(): void {
    // 从 localStorage 检查登录状态
    const userInfo = localStorage.getItem('zhulin-user');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      this.isLoggedIn = true;
      this.userName = user.name || '用户';
    }
  }

  loadTaskProgress(): void {
    this.dataService.getForests().subscribe(forests => {
      let allTasks: BambooSection[] = [];
      forests.forEach(forest => {
        forest.bambooFields.forEach(field => {
          field.bamboos.forEach(bamboo => {
            if (bamboo.tasks) {
              allTasks.push(...bamboo.tasks);
            }
          });
        });
      });

      this.taskProgress.total = allTasks.length;
      this.taskProgress.completed = allTasks.filter(t => t.status === 'completed').length;
      this.taskProgress.inProgress = allTasks.filter(t => t.status === 'in-progress').length;
      this.taskProgress.pending = allTasks.filter(t => t.status === 'pending').length;
      this.taskProgress.completionRate = this.taskProgress.total > 0 
        ? Math.round((this.taskProgress.completed / this.taskProgress.total) * 100) 
        : 0;
    });
  }

  login(): void {
    const userName = prompt('请输入您的姓名：');
    if (userName) {
      localStorage.setItem('zhulin-user', JSON.stringify({ name: userName }));
      this.isLoggedIn = true;
      this.userName = userName;
    }
  }

  logout(): void {
    localStorage.removeItem('zhulin-user');
    this.isLoggedIn = false;
    this.userName = '用户';
  }
}

