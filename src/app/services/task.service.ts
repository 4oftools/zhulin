import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataService } from './data.service';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(private dataService: DataService) {}

  getTasksByBamboo(bambooId: string): Observable<Task[]> {
    return this.dataService.getForests().pipe(
      map(forests => {
        for (const forest of forests) {
          for (const field of forest.bambooFields) {
            for (const bamboo of field.bamboos) {
              if (bamboo.id === bambooId) {
                return bamboo.tasks || [];
              }
            }
          }
        }
        return [];
      })
    );
  }

  getRegularTasks(bambooId: string): Observable<Task[]> {
    return this.getTasksByBamboo(bambooId).pipe(
      map(tasks => tasks.filter(t => t.type === 'regular'))
    );
  }

  getPeriodicTasks(bambooId: string): Observable<Task[]> {
    return this.getTasksByBamboo(bambooId).pipe(
      map(tasks => tasks.filter(t => t.type === 'periodic'))
    );
  }

  getTaskLabels(bambooId: string): Observable<Task[]> {
    return this.getTasksByBamboo(bambooId).pipe(
      map(tasks => tasks.filter(t => t.type === 'label'))
    );
  }

  addTask(task: Task): void {
    const forests = (this.dataService as any).forestsSubject.value;
    const updatedForests = forests.map((forest: any) => {
      return {
        ...forest,
        bambooFields: forest.bambooFields.map((field: any) => {
          return {
            ...field,
            bamboos: field.bamboos.map((bamboo: any) => {
              if (bamboo.id === task.bambooId) {
                return {
                  ...bamboo,
                  tasks: [...(bamboo.tasks || []), task]
                };
              }
              return bamboo;
            })
          };
        })
      };
    });
    (this.dataService as any).forestsSubject.next(updatedForests);
    this.saveToLocalStorage(updatedForests);
  }

  updateTask(task: Task): void {
    const forests = (this.dataService as any).forestsSubject.value;
    const updatedForests = forests.map((forest: any) => {
      return {
        ...forest,
        bambooFields: forest.bambooFields.map((field: any) => {
          return {
            ...field,
            bamboos: field.bamboos.map((bamboo: any) => {
              if (bamboo.id === task.bambooId) {
                return {
                  ...bamboo,
                  tasks: (bamboo.tasks || []).map((t: Task) => t.id === task.id ? task : t)
                };
              }
              return bamboo;
            })
          };
        })
      };
    });
    (this.dataService as any).forestsSubject.next(updatedForests);
    this.saveToLocalStorage(updatedForests);
  }

  deleteTask(bambooId: string, taskId: string): void {
    const forests = (this.dataService as any).forestsSubject.value;
    const updatedForests = forests.map((forest: any) => {
      return {
        ...forest,
        bambooFields: forest.bambooFields.map((field: any) => {
          return {
            ...field,
            bamboos: field.bamboos.map((bamboo: any) => {
              if (bamboo.id === bambooId) {
                return {
                  ...bamboo,
                  tasks: (bamboo.tasks || []).filter((t: Task) => t.id !== taskId)
                };
              }
              return bamboo;
            })
          };
        })
      };
    });
    (this.dataService as any).forestsSubject.next(updatedForests);
    this.saveToLocalStorage(updatedForests);
  }

  private saveToLocalStorage(forests: any[]): void {
    localStorage.setItem('zhulin-data', JSON.stringify(forests));
  }
}

