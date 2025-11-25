import { Component, OnInit } from '@angular/core';
import { TimeManagementService } from '../../../services/time-management.service';
import { BambooSection } from '../../../models/bamboo-section.model';

@Component({
  selector: 'app-daily-review',
  templateUrl: './daily-review.component.html',
  styleUrls: ['./daily-review.component.css'],
  standalone: false
})
export class DailyReviewComponent implements OnInit {
  currentSection: BambooSection | null = null;
  reviewContent: string = '';

  constructor(private timeService: TimeManagementService) {}

  ngOnInit(): void {
    this.timeService.currentSection$.subscribe(section => {
      this.currentSection = section;
    });
  }

  saveReview(): void {
    if (!this.reviewContent.trim()) {
      alert('请输入回顾内容');
      return;
    }

    const reviews = JSON.parse(localStorage.getItem('zhulin-daily-reviews') || '[]');
    reviews.push({
      sectionId: this.currentSection?.id,
      content: this.reviewContent,
      createdAt: new Date()
    });
    localStorage.setItem('zhulin-daily-reviews', JSON.stringify(reviews));
    
    alert('回顾已保存！');
    this.reviewContent = '';
  }
}

