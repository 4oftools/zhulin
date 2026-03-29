import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BambooForest, BambooField } from '../models/bamboo-forest.model';
import { environment } from '../../environments/environment';
import { SerializationHelper } from '../utils/serialization.helper';
import { ForestStoreService } from './forest-store.service';

@Injectable({
  providedIn: 'root'
})
export class ForestService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private store: ForestStoreService
  ) {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.http.get<BambooForest[]>(`${this.apiUrl}/forests`).subscribe({
      next: (data) => {
        const forests = SerializationHelper.deserializeForests(data);
        this.store.setForests(forests);
      },
      error: (err) => console.error('Failed to load forests', err)
    });
  }

  getForests(): Observable<BambooForest[]> {
    return this.store.forests$;
  }

  getForest(id: string): BambooForest | undefined {
    return this.store.getForestsSnapshot().find(f => f.id === id);
  }

  addForest(forest: BambooForest): void {
    this.http.post<BambooForest>(`${this.apiUrl}/forests`, forest).subscribe(newForest => {
      const processed = SerializationHelper.deserializeForest(newForest);
      this.store.updateForests(forests => [...forests, processed]);
    });
  }

  updateForest(forest: BambooForest): void {
    this.http.put<BambooForest>(`${this.apiUrl}/forests/${forest.id}`, forest).subscribe(updated => {
      const processed = SerializationHelper.deserializeForest(updated);
      this.store.updateForests(forests => 
        forests.map(f => f.id === processed.id ? processed : f)
      );
    });
  }

  deleteForest(id: string): void {
    this.http.delete(`${this.apiUrl}/forests/${id}`).subscribe(() => {
      this.store.updateForests(forests => forests.filter(f => f.id !== id));
    });
  }

  archiveForest(id: string, archived: boolean): void {
    const forest = this.getForest(id);
    if (forest) {
      const updated = { ...forest, archived };
      this.updateForest(updated);
    }
  }

  // BambooField CRUD
  addField(field: BambooField): void {
    this.http.post<BambooField>(`${this.apiUrl}/fields`, field).subscribe(newField => {
      const processed = SerializationHelper.deserializeField(newField);
      this.store.updateForests(forests => 
        forests.map(forest => {
          if (forest.id === processed.forestId) {
            return { ...forest, bambooFields: [...forest.bambooFields, processed] };
          }
          return forest;
        })
      );
    });
  }

  updateField(field: BambooField): void {
    this.http.put<BambooField>(`${this.apiUrl}/fields/${field.id}`, field).subscribe(updated => {
      const processed = SerializationHelper.deserializeField(updated);
      this.store.updateForests(forests => 
        forests.map(forest => {
          if (forest.id === processed.forestId) {
            return {
              ...forest,
              bambooFields: forest.bambooFields.map(f => 
                f.id === processed.id ? processed : f
              )
            };
          }
          return forest;
        })
      );
    });
  }

  deleteField(forestId: string, fieldId: string): void {
    this.http.delete(`${this.apiUrl}/fields/${fieldId}`).subscribe(() => {
      this.store.updateForests(forests => 
        forests.map(forest => {
          if (forest.id === forestId) {
            return {
              ...forest,
              bambooFields: forest.bambooFields.filter(f => f.id !== fieldId)
            };
          }
          return forest;
        })
      );
    });
  }

  updateFieldOrder(forestId: string, fields: BambooField[]): void {
    // Update local state first for immediate UI feedback
    this.store.updateForests(forests => 
      forests.map(forest => {
        if (forest.id === forestId) {
          return { ...forest, bambooFields: fields };
        }
        return forest;
      })
    );

    // Call backend to persist order
    this.http.put<void>(`${this.apiUrl}/fields/order`, fields).subscribe({
      next: () => console.log('Field order updated successfully'),
      error: (err) => {
        console.error('Failed to update field order', err);
        // Revert on error could be implemented here if needed
        this.loadInitialData(); // Reload to restore correct state
      }
    });
  }

  archiveField(forestId: string, fieldId: string, archived: boolean): void {
    const forest = this.getForest(forestId);
    const field = forest?.bambooFields.find(f => f.id === fieldId);
    if (field) {
        const updated = { ...field, archived };
        this.updateField(updated);
    }
  }
}
