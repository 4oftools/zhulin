import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { DailyReview } from '../models/bamboo-forest.model';
import { environment } from '../../environments/environment';
import { SerializationHelper } from '../utils/serialization.helper';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = environment.apiUrl;
  private reviewsSubject = new BehaviorSubject<DailyReview[]>([]);
  public reviews$ = this.reviewsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadReviews();
  }

  getReviews(): Observable<DailyReview[]> {
    return this.reviews$;
  }

  loadReviews(): void {
    this.http.get<DailyReview[]>(`${this.apiUrl}/reviews`).subscribe({
      next: (data) => {
        const reviews = SerializationHelper.deserializeReviews(data);
        this.reviewsSubject.next(reviews);
      },
      error: (err) => console.error('Failed to load reviews', err)
    });
  }

  saveReview(review: DailyReview): Observable<DailyReview> {
    const subject = new BehaviorSubject<DailyReview>(review);
    this.http.post<DailyReview>(`${this.apiUrl}/reviews`, review).subscribe(savedReview => {
      const processed = SerializationHelper.deserializeReview(savedReview);
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
}
