import { Component, OnInit } from '@angular/core';
import { TimeManagementService } from '../../../services/time-management.service';
import { BambooSection } from '../../../models/bamboo-section.model';

@Component({
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css'],
  standalone: false
})
export class PlanningComponent implements OnInit {
  currentSection: BambooSection | null = null;
  planContent: string = '';

  constructor(private timeService: TimeManagementService) {}

  ngOnInit(): void {
    this.timeService.currentSection$.subscribe(section => {
      this.currentSection = section;
    });
  }

  savePlan(): void {
    // 保存计划内容
    const plans = JSON.parse(localStorage.getItem('zhulin-plans') || '[]');
    plans.push({
      sectionId: this.currentSection?.id,
      content: this.planContent,
      createdAt: new Date()
    });
    localStorage.setItem('zhulin-plans', JSON.stringify(plans));
    alert('计划已保存！');
    this.planContent = '';
  }
}

