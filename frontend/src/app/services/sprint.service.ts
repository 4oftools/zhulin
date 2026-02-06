import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Sprint } from '../models/bamboo-forest.model';
import { environment } from '../../environments/environment';
import { SerializationHelper } from '../utils/serialization.helper';

@Injectable({
  providedIn: 'root'
})
export class SprintService {
  private apiUrl = environment.apiUrl;
  private sprintsSubject = new BehaviorSubject<Sprint[]>([]);
  public sprints$ = this.sprintsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadSprints();
  }

  getSprints(): Observable<Sprint[]> {
    return this.sprints$;
  }

  loadSprints(): void {
    this.http.get<Sprint[]>(`${this.apiUrl}/sprints`).subscribe({
      next: (data) => {
        const sprints = SerializationHelper.deserializeSprints(data);
        this.sprintsSubject.next(sprints);
      },
      error: (err) => console.error('Failed to load sprints', err)
    });
  }

  addSprint(sprint: Sprint): Observable<Sprint> {
    const subject = new BehaviorSubject<Sprint>(sprint);
    this.http.post<Sprint>(`${this.apiUrl}/sprints`, sprint).subscribe(newSprint => {
      const processed = SerializationHelper.deserializeSprint(newSprint);
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
      const processed = SerializationHelper.deserializeSprint(updated);
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
}
