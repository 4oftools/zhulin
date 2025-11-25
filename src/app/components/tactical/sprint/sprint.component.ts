import { Component, OnInit } from '@angular/core';
import { TimeManagementService } from '../../../services/time-management.service';
import { BambooSection } from '../../../models/bamboo-section.model';

@Component({
  selector: 'app-sprint',
  templateUrl: './sprint.component.html',
  styleUrls: ['./sprint.component.css'],
  standalone: false
})
export class SprintComponent implements OnInit {
  currentSection: BambooSection | null = null;
  startTime: Date | null = null;
  elapsedTime: number = 0;
  timer: any;

  constructor(private timeService: TimeManagementService) {}

  ngOnInit(): void {
    this.timeService.currentSection$.subscribe(section => {
      this.currentSection = section;
      if (section && section.type === 'sprint') {
        this.startTime = new Date(section.startTime);
        this.startTimer();
      } else {
        this.stopTimer();
      }
    });
  }

  startTimer(): void {
    this.timer = setInterval(() => {
      if (this.startTime) {
        const now = new Date();
        this.elapsedTime = Math.floor((now.getTime() - this.startTime.getTime()) / 1000);
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  completeSprint(): void {
    if (this.currentSection) {
      this.timeService.completeSection(this.currentSection.id);
    }
    this.stopTimer();
  }
}

