import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Learning } from '../models/bamboo-forest.model';
import { environment } from '../../environments/environment';
import { SerializationHelper } from '../utils/serialization.helper';
import { ForestStoreService } from './forest-store.service';

@Injectable({
  providedIn: 'root'
})
export class LearningService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private store: ForestStoreService
  ) {}

  addLearning(learning: Learning): void {
    this.http.post<Learning>(`${this.apiUrl}/learnings`, learning).subscribe(newVal => {
      const processed = SerializationHelper.deserializeLearning(newVal);
      this.store.updateForests(forests => 
        forests.map(forest => {
          if (forest.id === processed.forestId) {
            return { ...forest, learnings: [...(forest.learnings || []), processed] };
          }
          return forest;
        })
      );
    });
  }

  updateLearning(learning: Learning): void {
    this.http.put<Learning>(`${this.apiUrl}/learnings/${learning.id}`, learning).subscribe(updated => {
      const processed = SerializationHelper.deserializeLearning(updated);
      this.store.updateForests(forests => 
        forests.map(forest => {
          if (forest.id === processed.forestId) {
            return {
              ...forest,
              learnings: (forest.learnings || []).map(l => l.id === processed.id ? processed : l)
            };
          }
          return forest;
        })
      );
    });
  }

  deleteLearning(forestId: string, learningId: string): void {
    this.http.delete(`${this.apiUrl}/learnings/${learningId}`).subscribe(() => {
      this.store.updateForests(forests => 
        forests.map(forest => {
          if (forest.id === forestId) {
            return {
              ...forest,
              learnings: (forest.learnings || []).filter(l => l.id !== learningId)
            };
          }
          return forest;
        })
      );
    });
  }
}
