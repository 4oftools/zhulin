import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BambooSection } from '../models/bamboo-forest.model';
import { environment } from '../../environments/environment';
import { SerializationHelper } from '../utils/serialization.helper';
import { ForestStoreService } from './forest-store.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private store: ForestStoreService
  ) {}

  addBambooSection(section: BambooSection): void {
    this.http.post<BambooSection>(`${this.apiUrl}/sections`, section).subscribe(newSection => {
      const processed = SerializationHelper.deserializeTask(newSection);
      this.store.updateForests(forests => 
        forests.map(forest => {
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
        })
      );
    });
  }

  updateBambooSection(section: BambooSection): void {
    this.http.put<BambooSection>(`${this.apiUrl}/sections/${section.id}`, section).subscribe(updated => {
      const processed = SerializationHelper.deserializeTask(updated);
      this.store.updateForests(forests => 
        forests.map(forest => {
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
        })
      );
    });
  }

  deleteBambooSection(bambooId: string, sectionId: string): void {
    this.http.delete(`${this.apiUrl}/sections/${sectionId}`).subscribe(() => {
      this.store.updateForests(forests => 
        forests.map(forest => {
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
        })
      );
    });
  }
}
