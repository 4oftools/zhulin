import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppSettings {
  remindDailyReview: boolean;
  remindGoalCompletion: boolean;
  showCompletedTasks: boolean;
  taskReminderEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  remindDailyReview: true,
  remindGoalCompletion: true,
  showCompletedTasks: true,
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
        const parsed = JSON.parse(stored) as Record<string, unknown>;
        const merged = { ...DEFAULT_SETTINGS, ...parsed };
        return {
          remindDailyReview: !!merged.remindDailyReview,
          remindGoalCompletion: !!merged.remindGoalCompletion,
          showCompletedTasks: !!merged.showCompletedTasks,
          taskReminderEnabled: !!merged.taskReminderEnabled
        };
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

