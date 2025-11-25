import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TimeManagementService } from '../../../services/time-management.service';
import { DataService } from '../../../services/data.service';
import { BambooSection } from '../../../models/bamboo-section.model';
import { Bamboo, BambooField, BambooForest } from '../../../models/bamboo-forest.model';
import { Task } from '../../../models/task.model';

@Component({
  selector: 'app-bamboo-section',
  templateUrl: './bamboo-section.component.html',
  styleUrls: ['./bamboo-section.component.css'],
  standalone: false
})
export class BambooSectionComponent implements OnInit {
  bambooId: string = '';
  bamboo: Bamboo | undefined;
  field: BambooField | undefined;
  forest: BambooForest | undefined;
  sections: BambooSection[] = [];
  currentSection: BambooSection | null = null;
  tasks: Task[] = [];

  sectionTypes = [
    { type: 'planning', name: '制定计划', duration: 10 },
    { type: 'sprint', name: '冲刺', duration: 30 },
    { type: 'rest', name: '休息', duration: 5 },
    { type: 'review', name: '今日回顾', duration: 10 }
  ];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private timeService: TimeManagementService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.bambooId = this.route.snapshot.paramMap.get('bambooId') || '';
    this.loadData();
    
    this.timeService.currentSection$.subscribe(section => {
      this.currentSection = section;
    });
  }

  loadData(): void {
    this.timeService.getSectionsByBamboo(this.bambooId).subscribe(sections => {
      this.sections = sections;
    });

    this.dataService.getForests().subscribe(forests => {
      for (const forest of forests) {
        for (const field of forest.bambooFields) {
          const bamboo = field.bamboos.find(b => b.id === this.bambooId);
          if (bamboo) {
            this.bamboo = bamboo;
            this.field = field;
            this.forest = forest;
            this.tasks = bamboo.tasks || [];
            break;
          }
        }
      }
    });
  }

  startSection(type: string, duration: number, taskId?: string): void {
    const section: BambooSection = {
      id: this.generateId(),
      bambooId: this.bambooId,
      type: type as any,
      startTime: new Date(),
      duration: duration,
      status: 'scheduled',
      taskId: taskId
    };
    this.timeService.startSection(section);
    this.loadData();
  }

  completeSection(sectionId: string): void {
    this.timeService.completeSection(sectionId);
    this.loadData();
  }

  skipSection(sectionId: string): void {
    this.timeService.skipSection(sectionId);
    this.loadData();
  }

  getSectionTypeName(type: string): string {
    const sectionType = this.sectionTypes.find(st => st.type === type);
    return sectionType ? sectionType.name : type;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

