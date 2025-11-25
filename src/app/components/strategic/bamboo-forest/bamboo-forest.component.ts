import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { BambooForest } from '../../../models/bamboo-forest.model';

@Component({
  selector: 'app-bamboo-forest',
  templateUrl: './bamboo-forest.component.html',
  styleUrls: ['./bamboo-forest.component.css'],
  standalone: false
})
export class BambooForestComponent implements OnInit {
  forests: BambooForest[] = [];
  showAddForm = false;
  newForest: Partial<BambooForest> = {
    name: '',
    startDate: new Date(),
    endDate: new Date(),
    description: ''
  };

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getForests().subscribe(forests => {
      this.forests = forests;
    });
  }

  addForest(): void {
    if (!this.newForest.name) return;

    const forest: BambooForest = {
      id: this.generateId(),
      name: this.newForest.name!,
      startDate: new Date(this.newForest.startDate!),
      endDate: new Date(this.newForest.endDate!),
      description: this.newForest.description,
      bambooFields: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.dataService.addForest(forest);
    this.showAddForm = false;
    this.resetForm();
  }

  deleteForest(id: string): void {
    if (confirm('确定要删除这个竹林吗？')) {
      this.dataService.deleteForest(id);
    }
  }

  private resetForm(): void {
    this.newForest = {
      name: '',
      startDate: new Date(),
      endDate: new Date(),
      description: ''
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

