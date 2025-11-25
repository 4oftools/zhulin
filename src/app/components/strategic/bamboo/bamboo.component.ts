import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { Bamboo, BambooField, BambooForest } from '../../../models/bamboo-forest.model';

@Component({
  selector: 'app-bamboo',
  templateUrl: './bamboo.component.html',
  styleUrls: ['./bamboo.component.css'],
  standalone: false
})
export class BambooComponent implements OnInit {
  fieldId: string = '';
  field: BambooField | undefined;
  forest: BambooForest | undefined;
  bamboos: Bamboo[] = [];
  showAddForm = false;
  newBamboo: Partial<Bamboo> = {
    name: '',
    startDate: new Date(),
    endDate: new Date(),
    description: ''
  };

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.fieldId = this.route.snapshot.paramMap.get('fieldId') || '';
    this.loadData();
  }

  loadData(): void {
    this.dataService.getForests().subscribe(forests => {
      for (const forest of forests) {
        const field = forest.bambooFields.find(f => f.id === this.fieldId);
        if (field) {
          this.field = field;
          this.forest = forest;
          this.bamboos = field.bamboos;
          break;
        }
      }
    });
  }

  addBamboo(): void {
    if (!this.newBamboo.name || !this.field) return;

    const bamboo: Bamboo = {
      id: this.generateId(),
      fieldId: this.fieldId,
      name: this.newBamboo.name!,
      startDate: new Date(this.newBamboo.startDate!),
      endDate: new Date(this.newBamboo.endDate!),
      description: this.newBamboo.description,
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.dataService.addBamboo(bamboo);
    this.showAddForm = false;
    this.resetForm();
    this.loadData();
  }

  deleteBamboo(id: string): void {
    if (confirm('确定要删除这个竹子吗？')) {
      this.dataService.deleteBamboo(this.fieldId, id);
      this.loadData();
    }
  }

  private resetForm(): void {
    this.newBamboo = {
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

