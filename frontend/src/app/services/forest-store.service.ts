import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BambooForest } from '../models/bamboo-forest.model';

@Injectable({
  providedIn: 'root'
})
export class ForestStoreService {
  private forestsSubject = new BehaviorSubject<BambooForest[]>([]);
  public forests$ = this.forestsSubject.asObservable();

  getForestsSnapshot(): BambooForest[] {
    return this.forestsSubject.value;
  }

  setForests(forests: BambooForest[]): void {
    this.forestsSubject.next(forests);
  }

  updateForests(updater: (forests: BambooForest[]) => BambooForest[]): void {
    const current = this.getForestsSnapshot();
    const next = updater(current);
    this.forestsSubject.next(next);
  }
}
