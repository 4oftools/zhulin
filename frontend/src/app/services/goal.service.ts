import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Goal } from '../models/bamboo-forest.model';
import { environment } from '../../environments/environment';
import { SerializationHelper } from '../utils/serialization.helper';
import { ForestStoreService } from './forest-store.service';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private store: ForestStoreService
  ) {}

  addGoal(goal: Goal): void {
    this.http.post<Goal>(`${this.apiUrl}/goals`, goal).subscribe(newGoal => {
      const processed = SerializationHelper.deserializeGoal(newGoal);
      this.store.updateForests(forests => 
        forests.map(forest => {
          if (forest.id === processed.forestId) {
            return { ...forest, goals: [...(forest.goals || []), processed] };
          }
          return forest;
        })
      );
    });
  }

  updateGoal(goal: Goal): void {
    this.http.put<Goal>(`${this.apiUrl}/goals/${goal.id}`, goal).subscribe(updated => {
      const processed = SerializationHelper.deserializeGoal(updated);
      this.store.updateForests(forests => 
        forests.map(forest => {
          if (forest.id === processed.forestId) {
            return {
              ...forest,
              goals: (forest.goals || []).map(g => g.id === processed.id ? processed : g)
            };
          }
          return forest;
        })
      );
    });
  }

  deleteGoal(forestId: string, goalId: string): void {
    this.http.delete(`${this.apiUrl}/goals/${goalId}`).subscribe(() => {
      this.store.updateForests(forests => 
        forests.map(forest => {
          if (forest.id === forestId) {
            return {
              ...forest,
              goals: (forest.goals || []).filter(g => g.id !== goalId)
            };
          }
          return forest;
        })
      );
    });
  }
}
