import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppSettings {
  // 竹子自动完成
  autoCompleteBamboo: boolean;
  
  // 提醒设置
  remindDailyReview: boolean;
  remindGoalCompletion: boolean;
  
  // 其他设置
  showCompletedTasks: boolean;
  defaultBambooDuration: number; // 默认竹子周期（天数）
  taskReminderEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  autoCompleteBamboo: true,
  remindDailyReview: true,
  remindGoalCompletion: true,
  showCompletedTasks: true,
  defaultBambooDuration: 3,
  taskReminderEnabled: true
};

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSubject = new BehaviorSubject<AppSettings>(this.loadSettings());
  public settings$ = this.settingsSubject.asObservable();

  constructor() {
    this.loadSettings();
  }

  getSettings(): AppSettings {
    return this.settingsSubject.value;
  }

  getSettingsObservable(): Observable<AppSettings> {
    return this.settings$;
  }

  updateSettings(settings: Partial<AppSettings>): void {
    const currentSettings = this.settingsSubject.value;
    const newSettings = { ...currentSettings, ...settings };
    this.settingsSubject.next(newSettings);
    this.saveSettings(newSettings);
  }

  resetSettings(): void {
    this.updateSettings(DEFAULT_SETTINGS);
  }

  private loadSettings(): AppSettings {
    const stored = localStorage.getItem('zhulin-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // 合并默认设置，确保所有字段都存在
        return { ...DEFAULT_SETTINGS, ...parsed };
      } catch (e) {
        console.error('Failed to parse settings:', e);
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  }

  private saveSettings(settings: AppSettings): void {
    localStorage.setItem('zhulin-settings', JSON.stringify(settings));
  }
}

