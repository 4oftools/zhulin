import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BambooForest, BambooField, Bamboo, Goal, KeyOutput, Learning, BambooSection, Sprint, DailyReview } from '../models/bamboo-forest.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = environment.apiUrl;
  private forestsSubject = new BehaviorSubject<BambooForest[]>([]);
  public forests$ = this.forestsSubject.asObservable();

  private sprintsSubject = new BehaviorSubject<Sprint[]>([]);
  public sprints$ = this.sprintsSubject.asObservable();

  private reviewsSubject = new BehaviorSubject<DailyReview[]>([]);
  public reviews$ = this.reviewsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialData();
    this.loadSprints();
    this.loadReviews();
  }

  private loadInitialData(): void {
    this.http.get<BambooForest[]>(`${this.apiUrl}/forests`).subscribe({
      next: (data) => {
        const forests = this.deserializeForests(data);
        this.forestsSubject.next(forests);
      },
      error: (err) => console.error('Failed to load forests', err)
    });
  }

  // BambooForest CRUD
  getForests(): Observable<BambooForest[]> {
    return this.forests$;
  }

  getForest(id: string): BambooForest | undefined {
    return this.forestsSubject.value.find(f => f.id === id);
  }

  addForest(forest: BambooForest): void {
    this.http.post<BambooForest>(`${this.apiUrl}/forests`, forest).subscribe(newForest => {
      const processed = this.deserializeForest(newForest);
      const forests = [...this.forestsSubject.value, processed];
      this.forestsSubject.next(forests);
    });
  }

  updateForest(forest: BambooForest): void {
    this.http.put<BambooForest>(`${this.apiUrl}/forests/${forest.id}`, forest).subscribe(updated => {
      const processed = this.deserializeForest(updated);
      const forests = this.forestsSubject.value.map(f => 
        f.id === processed.id ? processed : f
      );
      this.forestsSubject.next(forests);
    });
  }

  deleteForest(id: string): void {
    this.http.delete(`${this.apiUrl}/forests/${id}`).subscribe(() => {
      const forests = this.forestsSubject.value.filter(f => f.id !== id);
      this.forestsSubject.next(forests);
    });
  }

  archiveForest(id: string, archived: boolean): void {
    const forest = this.getForest(id);
    if (forest) {
      const updated = { ...forest, archived, archivedAt: archived ? new Date() : undefined };
      this.updateForest(updated);
    }
  }

  // BambooField CRUD
  addField(field: BambooField): void {
    this.http.post<BambooField>(`${this.apiUrl}/fields`, field).subscribe(newField => {
      const processed = this.deserializeField(newField);
      const forests = this.forestsSubject.value.map(forest => {
        if (forest.id === processed.forestId) {
          return { ...forest, bambooFields: [...forest.bambooFields, processed] };
        }
        return forest;
      });
      this.forestsSubject.next(forests);
    });
  }

  updateField(field: BambooField): void {
    this.http.put<BambooField>(`${this.apiUrl}/fields/${field.id}`, field).subscribe(updated => {
      const processed = this.deserializeField(updated);
      const forests = this.forestsSubject.value.map(forest => {
        if (forest.id === processed.forestId) {
          return {
            ...forest,
            bambooFields: forest.bambooFields.map(f => 
              f.id === processed.id ? processed : f
            )
          };
        }
        return forest;
      });
      this.forestsSubject.next(forests);
    });
  }

  deleteField(forestId: string, fieldId: string): void {
    this.http.delete(`${this.apiUrl}/fields/${fieldId}`).subscribe(() => {
      const forests = this.forestsSubject.value.map(forest => {
        if (forest.id === forestId) {
          return {
            ...forest,
            bambooFields: forest.bambooFields.filter(f => f.id !== fieldId)
          };
        }
        return forest;
      });
      this.forestsSubject.next(forests);
    });
  }

  updateFieldOrder(forestId: string, fields: BambooField[]): void {
    // Update local state first for immediate UI feedback
    const forests = this.forestsSubject.value.map(forest => {
      if (forest.id === forestId) {
        return { ...forest, bambooFields: fields };
      }
      return forest;
    });
    this.forestsSubject.next(forests);

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
    // Need to find the field first to get full object
    const forest = this.getForest(forestId);
    const field = forest?.bambooFields.find(f => f.id === fieldId);
    if (field) {
        const updated = { ...field, archived, archivedAt: archived ? new Date() : undefined };
        this.updateField(updated);
    }
  }

  // Bamboo CRUD
  addBamboo(bamboo: Bamboo): void {
    this.http.post<Bamboo>(`${this.apiUrl}/bamboos`, bamboo).subscribe(newBamboo => {
      const processed = this.deserializeBamboo(newBamboo);
      const forests = this.forestsSubject.value.map(forest => {
        return {
          ...forest,
          bambooFields: forest.bambooFields.map(field => {
            if (field.id === processed.fieldId) {
              return { ...field, bamboos: [...field.bamboos, processed] };
            }
            return field;
          })
        };
      });
      this.forestsSubject.next(forests);
    });
  }

  updateBamboo(bamboo: Bamboo): void {
    this.http.put<Bamboo>(`${this.apiUrl}/bamboos/${bamboo.id}`, bamboo).subscribe(updated => {
      const processed = this.deserializeBamboo(updated);
      const forests = this.forestsSubject.value.map(forest => {
        return {
          ...forest,
          bambooFields: forest.bambooFields.map(field => {
            if (field.id === processed.fieldId) {
              return {
                ...field,
                bamboos: field.bamboos.map(b => b.id === processed.id ? processed : b)
              };
            }
            return field;
          })
        };
      });
      this.forestsSubject.next(forests);
    });
  }

  deleteBamboo(fieldId: string, bambooId: string): void {
    this.http.delete(`${this.apiUrl}/bamboos/${bambooId}`).subscribe(() => {
      const forests = this.forestsSubject.value.map(forest => {
        return {
          ...forest,
          bambooFields: forest.bambooFields.map(field => {
            if (field.id === fieldId) {
              return {
                ...field,
                bamboos: field.bamboos.filter(b => b.id !== bambooId)
              };
            }
            return field;
          })
        };
      });
      this.forestsSubject.next(forests);
    });
  }

  archiveBamboo(fieldId: string, bambooId: string, archived: boolean): void {
    // Implementation requires finding bamboo and calling update
    // Simplified: Fetch latest forest data to ensure consistency
    // But here we try to update locally
    // For now, let's just reload all data to be safe for deep nesting
    // Or implement deep find
    // Let's rely on finding it in local state
    const forest = this.forestsSubject.value.find(f => f.bambooFields.some(field => field.id === fieldId));
    const field = forest?.bambooFields.find(f => f.id === fieldId);
    const bamboo = field?.bamboos.find(b => b.id === bambooId);
    
    if (bamboo) {
        const updated = { ...bamboo, archived, archivedAt: archived ? new Date() : undefined };
        this.updateBamboo(updated);
    }
  }

  // BambooSection (Task) CRUD
  addBambooSection(section: BambooSection): void {
    this.http.post<BambooSection>(`${this.apiUrl}/sections`, section).subscribe(newSection => {
      const processed = this.deserializeTask(newSection);
      const forests = this.forestsSubject.value.map(forest => {
        return {
          ...forest,
          bambooFields: forest.bambooFields.map(field => {
            return {
              ...field,
              bamboos: field.bamboos.map(bamboo => {
                if (bamboo.id === processed.bambooId) {
                  return { ...bamboo, tasks: [...(bamboo.tasks || []), processed] };
                }
                return bamboo;
              })
            };
          })
        };
      });
      this.forestsSubject.next(forests);
    });
  }

  updateBambooSection(section: BambooSection): void {
    this.http.put<BambooSection>(`${this.apiUrl}/sections/${section.id}`, section).subscribe(updated => {
      const processed = this.deserializeTask(updated);
      const forests = this.forestsSubject.value.map(forest => {
        return {
          ...forest,
          bambooFields: forest.bambooFields.map(field => {
            return {
              ...field,
              bamboos: field.bamboos.map(bamboo => {
                if (bamboo.id === processed.bambooId) {
                  return {
                    ...bamboo,
                    tasks: (bamboo.tasks || []).map(t => t.id === processed.id ? processed : t)
                  };
                }
                return bamboo;
              })
            };
          })
        };
      });
      this.forestsSubject.next(forests);
    });
  }

  deleteBambooSection(bambooId: string, sectionId: string): void {
    this.http.delete(`${this.apiUrl}/sections/${sectionId}`).subscribe(() => {
      const forests = this.forestsSubject.value.map(forest => {
        return {
          ...forest,
          bambooFields: forest.bambooFields.map(field => {
            return {
              ...field,
              bamboos: field.bamboos.map(bamboo => {
                if (bamboo.id === bambooId) {
                  return {
                    ...bamboo,
                    tasks: (bamboo.tasks || []).filter(t => t.id !== sectionId)
                  };
                }
                return bamboo;
              })
            };
          })
        };
      });
      this.forestsSubject.next(forests);
    });
  }

  // Goal CRUD
  addGoal(goal: Goal): void {
    this.http.post<Goal>(`${this.apiUrl}/goals`, goal).subscribe(newGoal => {
      const processed = this.deserializeGoal(newGoal);
      const forests = this.forestsSubject.value.map(forest => {
        if (forest.id === processed.forestId) {
          return { ...forest, goals: [...(forest.goals || []), processed] };
        }
        return forest;
      });
      this.forestsSubject.next(forests);
    });
  }

  updateGoal(goal: Goal): void {
    this.http.put<Goal>(`${this.apiUrl}/goals/${goal.id}`, goal).subscribe(updated => {
      const processed = this.deserializeGoal(updated);
      const forests = this.forestsSubject.value.map(forest => {
        if (forest.id === processed.forestId) {
          return {
            ...forest,
            goals: (forest.goals || []).map(g => g.id === processed.id ? processed : g)
          };
        }
        return forest;
      });
      this.forestsSubject.next(forests);
    });
  }

  deleteGoal(forestId: string, goalId: string): void {
    this.http.delete(`${this.apiUrl}/goals/${goalId}`).subscribe(() => {
      const forests = this.forestsSubject.value.map(forest => {
        if (forest.id === forestId) {
          return {
            ...forest,
            goals: (forest.goals || []).filter(g => g.id !== goalId)
          };
        }
        return forest;
      });
      this.forestsSubject.next(forests);
    });
  }

  // KeyOutput CRUD
  addKeyOutput(keyOutput: KeyOutput): void {
    this.http.post<KeyOutput>(`${this.apiUrl}/key-outputs`, keyOutput).subscribe(newVal => {
      const processed = this.deserializeKeyOutput(newVal);
      const forests = this.forestsSubject.value.map(forest => {
        if (forest.id === processed.forestId) {
          return { ...forest, keyOutputs: [...(forest.keyOutputs || []), processed] };
        }
        return forest;
      });
      this.forestsSubject.next(forests);
    });
  }

  updateKeyOutput(keyOutput: KeyOutput): void {
    this.http.put<KeyOutput>(`${this.apiUrl}/key-outputs/${keyOutput.id}`, keyOutput).subscribe(updated => {
      const processed = this.deserializeKeyOutput(updated);
      const forests = this.forestsSubject.value.map(forest => {
        if (forest.id === processed.forestId) {
          return {
            ...forest,
            keyOutputs: (forest.keyOutputs || []).map(k => k.id === processed.id ? processed : k)
          };
        }
        return forest;
      });
      this.forestsSubject.next(forests);
    });
  }

  deleteKeyOutput(forestId: string, keyOutputId: string): void {
    this.http.delete(`${this.apiUrl}/key-outputs/${keyOutputId}`).subscribe(() => {
      const forests = this.forestsSubject.value.map(forest => {
        if (forest.id === forestId) {
          return {
            ...forest,
            keyOutputs: (forest.keyOutputs || []).filter(k => k.id !== keyOutputId)
          };
        }
        return forest;
      });
      this.forestsSubject.next(forests);
    });
  }

  // Learning CRUD
  addLearning(learning: Learning): void {
    this.http.post<Learning>(`${this.apiUrl}/learnings`, learning).subscribe(newVal => {
      const processed = this.deserializeLearning(newVal);
      const forests = this.forestsSubject.value.map(forest => {
        if (forest.id === processed.forestId) {
          return { ...forest, learnings: [...(forest.learnings || []), processed] };
        }
        return forest;
      });
      this.forestsSubject.next(forests);
    });
  }

  updateLearning(learning: Learning): void {
    this.http.put<Learning>(`${this.apiUrl}/learnings/${learning.id}`, learning).subscribe(updated => {
      const processed = this.deserializeLearning(updated);
      const forests = this.forestsSubject.value.map(forest => {
        if (forest.id === processed.forestId) {
          return {
            ...forest,
            learnings: (forest.learnings || []).map(l => l.id === processed.id ? processed : l)
          };
        }
        return forest;
      });
      this.forestsSubject.next(forests);
    });
  }

  deleteLearning(forestId: string, learningId: string): void {
    this.http.delete(`${this.apiUrl}/learnings/${learningId}`).subscribe(() => {
      const forests = this.forestsSubject.value.map(forest => {
        if (forest.id === forestId) {
          return {
            ...forest,
            learnings: (forest.learnings || []).filter(l => l.id !== learningId)
          };
        }
        return forest;
      });
      this.forestsSubject.next(forests);
    });
  }

  // Sprint CRUD
  getSprints(): Observable<Sprint[]> {
    return this.sprints$;
  }

  private loadSprints(): void {
    this.http.get<Sprint[]>(`${this.apiUrl}/sprints`).subscribe({
      next: (data) => {
        const sprints = this.deserializeSprints(data);
        this.sprintsSubject.next(sprints);
      },
      error: (err) => console.error('Failed to load sprints', err)
    });
  }

  addSprint(sprint: Sprint): Observable<Sprint> {
    const subject = new BehaviorSubject<Sprint>(sprint);
    this.http.post<Sprint>(`${this.apiUrl}/sprints`, sprint).subscribe(newSprint => {
      const processed = this.deserializeSprint(newSprint);
      const sprints = [processed, ...this.sprintsSubject.value];
      this.sprintsSubject.next(sprints);
      subject.next(processed);
      subject.complete();
    });
    return subject.asObservable();
  }

  updateSprint(sprint: Sprint): Observable<Sprint> {
    const subject = new BehaviorSubject<Sprint>(sprint);
    this.http.put<Sprint>(`${this.apiUrl}/sprints/${sprint.id}`, sprint).subscribe(updated => {
      const processed = this.deserializeSprint(updated);
      const sprints = this.sprintsSubject.value.map(s => s.id === processed.id ? processed : s);
      this.sprintsSubject.next(sprints);
      subject.next(processed);
      subject.complete();
    });
    return subject.asObservable();
  }

  deleteSprint(id: string): void {
    this.http.delete(`${this.apiUrl}/sprints/${id}`).subscribe(() => {
      const sprints = this.sprintsSubject.value.filter(s => s.id !== id);
      this.sprintsSubject.next(sprints);
    });
  }

  // DailyReview CRUD
  getReviews(): Observable<DailyReview[]> {
    return this.reviews$;
  }

  private loadReviews(): void {
    this.http.get<DailyReview[]>(`${this.apiUrl}/reviews`).subscribe({
      next: (data) => {
        const reviews = this.deserializeReviews(data);
        this.reviewsSubject.next(reviews);
      },
      error: (err) => console.error('Failed to load reviews', err)
    });
  }

  saveReview(review: DailyReview): Observable<DailyReview> {
    const subject = new BehaviorSubject<DailyReview>(review);
    this.http.post<DailyReview>(`${this.apiUrl}/reviews`, review).subscribe(savedReview => {
      const processed = this.deserializeReview(savedReview);
      // Update or add to local list
      const currentReviews = this.reviewsSubject.value;
      const index = currentReviews.findIndex(r => r.date === processed.date);
      let newReviews;
      if (index !== -1) {
        newReviews = [...currentReviews];
        newReviews[index] = processed;
      } else {
        newReviews = [...currentReviews, processed];
      }
      this.reviewsSubject.next(newReviews);
      subject.next(processed);
      subject.complete();
    });
    return subject.asObservable();
  }
  
  // Helper methods for deserialization
  private deserializeForests(data: any[]): BambooForest[] {
    return data.map(forest => this.deserializeForest(forest));
  }

  private deserializeForest(forest: any): BambooForest {
    return {
      ...forest,
      startDate: new Date(forest.startDate),
      endDate: new Date(forest.endDate),
      createdAt: new Date(forest.createdAt),
      updatedAt: new Date(forest.updatedAt),
      archivedAt: forest.archivedAt ? new Date(forest.archivedAt) : undefined,
      bambooFields: (forest.bambooFields || []).map((f: any) => this.deserializeField(f)),
      goals: (forest.goals || []).map((g: any) => this.deserializeGoal(g)),
      keyOutputs: (forest.keyOutputs || []).map((k: any) => this.deserializeKeyOutput(k)),
      learnings: (forest.learnings || []).map((l: any) => this.deserializeLearning(l))
    };
  }

  private deserializeField(field: any): BambooField {
    return {
      ...field,
      startDate: new Date(field.startDate),
      endDate: new Date(field.endDate),
      createdAt: new Date(field.createdAt),
      updatedAt: new Date(field.updatedAt),
      archivedAt: field.archivedAt ? new Date(field.archivedAt) : undefined,
      bamboos: (field.bamboos || []).map((b: any) => this.deserializeBamboo(b))
    };
  }

  private deserializeBamboo(bamboo: any): Bamboo {
    return {
      ...bamboo,
      startDate: new Date(bamboo.startDate),
      endDate: new Date(bamboo.endDate),
      createdAt: new Date(bamboo.createdAt),
      updatedAt: new Date(bamboo.updatedAt),
      completedAt: bamboo.completedAt ? new Date(bamboo.completedAt) : undefined,
      archivedAt: bamboo.archivedAt ? new Date(bamboo.archivedAt) : undefined,
      tasks: (bamboo.tasks || []).map((t: any) => this.deserializeTask(t))
    };
  }

  private deserializeTask(task: any): BambooSection {
    return {
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined
    };
  }

  private deserializeGoal(goal: any): Goal {
    return {
      ...goal,
      createdAt: new Date(goal.createdAt),
      updatedAt: new Date(goal.updatedAt),
      completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined
    };
  }

  private deserializeKeyOutput(ko: any): KeyOutput {
    return {
      ...ko,
      createdAt: new Date(ko.createdAt),
      updatedAt: new Date(ko.updatedAt),
      completedAt: ko.completedAt ? new Date(ko.completedAt) : undefined
    };
  }

  private deserializeLearning(l: any): Learning {
    return {
      ...l,
      createdAt: new Date(l.createdAt),
      updatedAt: new Date(l.updatedAt)
    };
  }

  private deserializeSprints(data: any[]): Sprint[] {
    return data.map(sprint => this.deserializeSprint(sprint));
  }

  private deserializeSprint(sprint: any): Sprint {
    return {
      ...sprint,
      startTime: new Date(sprint.startTime),
      endTime: sprint.endTime ? new Date(sprint.endTime) : undefined
    };
  }

  private deserializeReviews(data: any[]): DailyReview[] {
    return data.map(review => this.deserializeReview(review));
  }

  private deserializeReview(review: any): DailyReview {
    return {
      ...review,
      createdAt: review.createdAt ? new Date(review.createdAt) : undefined,
      updatedAt: review.updatedAt ? new Date(review.updatedAt) : undefined
    };
  }

  // Mock ID generation (keep it if needed by components, but backend generates IDs)
  // Components use this to create initial objects. 
  // Backend should accept IDs or we should remove this and let components pass null.
  // But components expect string ID.
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
