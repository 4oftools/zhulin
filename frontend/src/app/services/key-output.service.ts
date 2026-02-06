import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { KeyOutput } from '../models/bamboo-forest.model';
import { environment } from '../../environments/environment';
import { SerializationHelper } from '../utils/serialization.helper';
import { ForestStoreService } from './forest-store.service';

@Injectable({
  providedIn: 'root'
})
export class KeyOutputService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private store: ForestStoreService
  ) {}

  addKeyOutput(keyOutput: KeyOutput): void {
    this.http.post<KeyOutput>(`${this.apiUrl}/key-outputs`, keyOutput).subscribe(newVal => {
      const processed = SerializationHelper.deserializeKeyOutput(newVal);
      this.store.updateForests(forests => 
        forests.map(forest => {
          if (forest.id === processed.forestId) {
            return { ...forest, keyOutputs: [...(forest.keyOutputs || []), processed] };
          }
          return forest;
        })
      );
    });
  }

  updateKeyOutput(keyOutput: KeyOutput): void {
    this.http.put<KeyOutput>(`${this.apiUrl}/key-outputs/${keyOutput.id}`, keyOutput).subscribe(updated => {
      const processed = SerializationHelper.deserializeKeyOutput(updated);
      this.store.updateForests(forests => 
        forests.map(forest => {
          if (forest.id === processed.forestId) {
            return {
              ...forest,
              keyOutputs: (forest.keyOutputs || []).map(k => k.id === processed.id ? processed : k)
            };
          }
          return forest;
        })
      );
    });
  }

  deleteKeyOutput(forestId: string, keyOutputId: string): void {
    this.http.delete(`${this.apiUrl}/key-outputs/${keyOutputId}`).subscribe(() => {
      this.store.updateForests(forests => 
        forests.map(forest => {
          if (forest.id === forestId) {
            return {
              ...forest,
              keyOutputs: (forest.keyOutputs || []).filter(k => k.id !== keyOutputId)
            };
          }
          return forest;
        })
      );
    });
  }
}
