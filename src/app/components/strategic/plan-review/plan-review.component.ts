import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { BambooForest, BambooField, Bamboo } from '../../../models/bamboo-forest.model';

@Component({
  selector: 'app-plan-review',
  templateUrl: './plan-review.component.html',
  styleUrls: ['./plan-review.component.css'],
  standalone: false
})
export class PlanReviewComponent implements OnInit {
  forests: BambooForest[] = [];
  selectedForest: BambooForest | undefined;
  selectedField: BambooField | undefined;
  selectedBamboo: Bamboo | undefined;
  reviewType: 'forest' | 'field' | 'bamboo' = 'bamboo';
  reviewContent: string = '';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getForests().subscribe(forests => {
      this.forests = forests;
    });
  }

  selectForest(forest: BambooForest): void {
    this.selectedForest = forest;
    this.selectedField = undefined;
    this.selectedBamboo = undefined;
  }

  selectField(field: BambooField): void {
    this.selectedField = field;
    this.selectedBamboo = undefined;
  }

  selectBamboo(bamboo: Bamboo): void {
    this.selectedBamboo = bamboo;
  }

  saveReview(): void {
    // 这里可以将回顾内容保存到本地存储或后端
    const review = {
      type: this.reviewType,
      forestId: this.selectedForest?.id,
      fieldId: this.selectedField?.id,
      bambooId: this.selectedBamboo?.id,
      content: this.reviewContent,
      createdAt: new Date()
    };
    
    const reviews = JSON.parse(localStorage.getItem('zhulin-reviews') || '[]');
    reviews.push(review);
    localStorage.setItem('zhulin-reviews', JSON.stringify(reviews));
    
    alert('回顾已保存！');
    this.reviewContent = '';
  }
}

