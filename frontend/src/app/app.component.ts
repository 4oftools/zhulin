import { Component, OnInit } from '@angular/core';
import { PingService } from './services/ping.service';
import { ForestService } from './services/forest.service';
import { SprintService } from './services/sprint.service';
import { ReviewService } from './services/review.service';
import { SettingsService, AppSettings } from './services/settings.service';
import { BambooSection } from './models/bamboo-forest.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent implements OnInit {
  title = '竹林工作法';
  checkingBackend = true;
  backendConnected = false;
  
  taskProgress = {
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    completionRate: 0
  };

  showSettingsDialog = false;
  settings: AppSettings;

  constructor(
    private pingService: PingService,
    private forestService: ForestService,
    private sprintService: SprintService,
    private reviewService: ReviewService,
    private settingsService: SettingsService
  ) {
    this.settings = this.settingsService.getSettings();
  }

  ngOnInit(): void {
    this.checkBackend();
    
    this.settingsService.getSettingsObservable().subscribe(settings => {
      this.settings = settings;
    });
  }

  checkBackend(): void {
    this.checkingBackend = true;
    this.pingService.checkBackendStatus().subscribe(status => {
      this.backendConnected = status;
      this.checkingBackend = false;
      if (status) {
        this.reloadData();
        this.loadTaskProgress();
      }
    });
  }

  reloadData(): void {
    this.forestService.loadInitialData();
    this.sprintService.loadSprints();
    this.reviewService.loadReviews();
  }

  retryConnection(): void {
    this.checkBackend();
  }

  loadTaskProgress(): void {
    this.forestService.getForests().subscribe(forests => {
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

  openSettings(): void {
    this.showSettingsDialog = true;
  }

  closeSettings(): void {
    this.showSettingsDialog = false;
  }

  onSettingsChange(key: keyof AppSettings, value: any): void {
    this.settingsService.updateSettings({ [key]: value });
  }

  onCheckboxChange(key: keyof AppSettings, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.onSettingsChange(key, target.checked);
    }
  }

  onNumberChange(key: keyof AppSettings, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.onSettingsChange(key, +target.value);
    }
  }

  resetSettings(): void {
    if (confirm('确定要重置所有设置吗？')) {
      this.settingsService.resetSettings();
    }
  }

  onDialogOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeSettings();
    }
  }
}

