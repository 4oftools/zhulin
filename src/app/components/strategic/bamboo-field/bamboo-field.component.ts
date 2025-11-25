import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { BambooField, BambooForest } from '../../../models/bamboo-forest.model';

@Component({
  selector: 'app-bamboo-field',
  templateUrl: './bamboo-field.component.html',
  styleUrls: ['./bamboo-field.component.css'],
  standalone: false
})
export class BambooFieldComponent implements OnInit {
  forestId: string = '';
  forest: BambooForest | undefined;
  fields: BambooField[] = [];
  showAddForm = false;
  newField: Partial<BambooField> = {
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
    this.forestId = this.route.snapshot.paramMap.get('forestId') || '';
    this.loadData();
  }

  loadData(): void {
    this.forest = this.dataService.getForest(this.forestId);
    if (this.forest) {
      this.fields = this.forest.bambooFields;
    }
  }

  addField(): void {
    if (!this.newField.name || !this.forest) return;

    const field: BambooField = {
      id: this.generateId(),
      forestId: this.forestId,
      name: this.newField.name!,
      startDate: new Date(this.newField.startDate!),
      endDate: new Date(this.newField.endDate!),
      description: this.newField.description,
      bamboos: [],
      goals: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.dataService.addField(field);
    this.showAddForm = false;
    this.resetForm();
    this.loadData();
  }

  deleteField(id: string): void {
    if (confirm('确定要删除这个竹田吗？')) {
      this.dataService.deleteField(this.forestId, id);
      this.loadData();
    }
  }

  private resetForm(): void {
    this.newField = {
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

