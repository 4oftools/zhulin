import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BambooSection } from '../models/bamboo-section.model';

@Injectable({
  providedIn: 'root'
})
export class TimeManagementService {
  private currentSectionSubject = new BehaviorSubject<BambooSection | null>(null);
  public currentSection$ = this.currentSectionSubject.asObservable();

  private sectionsSubject = new BehaviorSubject<BambooSection[]>([]);
  public sections$ = this.sectionsSubject.asObservable();

  constructor() {
    this.loadSections();
  }

  startSection(section: BambooSection): void {
    section.status = 'active';
    section.startTime = new Date();
    this.currentSectionSubject.next(section);
    const sections = [...this.sectionsSubject.value, section];
    this.sectionsSubject.next(sections);
    this.saveSections(sections);
  }

  completeSection(sectionId: string): void {
    const sections = this.sectionsSubject.value.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          status: 'completed' as const,
          endTime: new Date()
        };
      }
      return s;
    });
    this.sectionsSubject.next(sections);
    const current = this.currentSectionSubject.value;
    if (current && current.id === sectionId) {
      this.currentSectionSubject.next(null);
    }
    this.saveSections(sections);
  }

  skipSection(sectionId: string): void {
    const sections = this.sectionsSubject.value.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          status: 'skipped' as const
        };
      }
      return s;
    });
    this.sectionsSubject.next(sections);
    this.saveSections(sections);
  }

  getSectionsByBamboo(bambooId: string): Observable<BambooSection[]> {
    return this.sections$.pipe(
      map(sections => sections.filter(s => s.bambooId === bambooId))
    );
  }

  getCurrentSection(): BambooSection | null {
    return this.currentSectionSubject.value;
  }

  private loadSections(): void {
    const data = localStorage.getItem('zhulin-sections');
    if (data) {
      const parsed = JSON.parse(data);
      const sections: BambooSection[] = parsed.map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: s.endTime ? new Date(s.endTime) : undefined,
        status: s.status as 'scheduled' | 'active' | 'completed' | 'skipped'
      }));
      this.sectionsSubject.next(sections);
    }
  }

  private saveSections(sections: BambooSection[]): void {
    localStorage.setItem('zhulin-sections', JSON.stringify(sections));
  }
}

