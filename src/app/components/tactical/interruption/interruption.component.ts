import { Component, OnInit } from '@angular/core';
import { TimeManagementService } from '../../../services/time-management.service';
import { BambooSection } from '../../../models/bamboo-section.model';

@Component({
  selector: 'app-interruption',
  templateUrl: './interruption.component.html',
  styleUrls: ['./interruption.component.css'],
  standalone: false
})
export class InterruptionComponent implements OnInit {
  currentSection: BambooSection | null = null;
  interruptionReason: string = '';

  constructor(private timeService: TimeManagementService) {}

  ngOnInit(): void {
    this.timeService.currentSection$.subscribe(section => {
      this.currentSection = section;
    });
  }

  recordInterruption(): void {
    if (!this.interruptionReason.trim()) {
      alert('请输入打断原因');
      return;
    }

    const interruptions = JSON.parse(localStorage.getItem('zhulin-interruptions') || '[]');
    interruptions.push({
      sectionId: this.currentSection?.id,
      reason: this.interruptionReason,
      createdAt: new Date()
    });
    localStorage.setItem('zhulin-interruptions', JSON.stringify(interruptions));
    
    alert('打断已记录！');
    this.interruptionReason = '';
  }
}

