import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  checkBackendStatus(): Observable<boolean> {
    return this.http.get(`${this.apiUrl}/ping`, { responseType: 'text' }).pipe(
      map(response => response === 'pong'),
      catchError(() => of(false))
    );
  }
}
