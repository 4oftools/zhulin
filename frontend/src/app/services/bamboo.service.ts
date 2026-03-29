import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Bamboo } from '../models/bamboo-forest.model';
import { environment } from '../../environments/environment';
import { SerializationHelper } from '../utils/serialization.helper';
import { ForestStoreService } from './forest-store.service';

@Injectable({
  providedIn: 'root'
})
export class BambooService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private store: ForestStoreService
  ) {}

  addBamboo(bamboo: Bamboo): void {
    this.http.post<Bamboo>(`${this.apiUrl}/bamboos`, bamboo).subscribe(newBamboo => {
      const processed = SerializationHelper.deserializeBamboo(newBamboo);
      this.store.updateForests(forests => 
        forests.map(forest => {
          return {
            ...forest,
            bambooFields: forest.bambooFields.map(field => {
              if (field.id === processed.fieldId) {
                return { ...field, bamboos: [...field.bamboos, processed] };
              }
              return field;
            })
          };
        })
      );
    });
  }

  updateBamboo(bamboo: Bamboo): void {
    this.http.put<Bamboo>(`${this.apiUrl}/bamboos/${bamboo.id}`, bamboo).subscribe(updated => {
      const processed = SerializationHelper.deserializeBamboo(updated);
      this.store.updateForests(forests => 
        forests.map(forest => {
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
        })
      );
    });
  }

  deleteBamboo(fieldId: string, bambooId: string): void {
    this.http.delete(`${this.apiUrl}/bamboos/${bambooId}`).subscribe(() => {
      this.store.updateForests(forests => 
        forests.map(forest => {
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
        })
      );
    });
  }

  archiveBamboo(fieldId: string, bambooId: string, archived: boolean): void {
    const forest = this.store.getForestsSnapshot().find(f => f.bambooFields.some(field => field.id === fieldId));
    const field = forest?.bambooFields.find(f => f.id === fieldId);
    const bamboo = field?.bamboos.find(b => b.id === bambooId);
    
    if (bamboo) {
        const updated = { ...bamboo, archived };
        this.updateBamboo(updated);
    }
  }
}
