import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BambooForest, BambooField, Bamboo, Goal, KeyOutput, Learning, BambooSection, Sprint, DailyReview } from '../models/bamboo-forest.model';
import { PingService } from './ping.service';
import { ForestService } from './forest.service';
import { SprintService } from './sprint.service';
import { ReviewService } from './review.service';
import { GoalService } from './goal.service';
import { KeyOutputService } from './key-output.service';
import { LearningService } from './learning.service';
import { BambooService } from './bamboo.service';
import { TaskService } from './task.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  // Re-expose observables
  public forests$: Observable<BambooForest[]>;
  public sprints$: Observable<Sprint[]>;
  public reviews$: Observable<DailyReview[]>;

  constructor(
    private pingService: PingService,
    private forestService: ForestService,
    private sprintService: SprintService,
    private reviewService: ReviewService,
    private goalService: GoalService,
    private keyOutputService: KeyOutputService,
    private learningService: LearningService,
    private bambooService: BambooService,
    private taskService: TaskService
  ) {
    this.forests$ = this.forestService.getForests();
    this.sprints$ = this.sprintService.getSprints();
    this.reviews$ = this.reviewService.getReviews();
  }

  checkBackendStatus(): Observable<boolean> {
    return this.pingService.checkBackendStatus();
  }

  reloadData(): void {
    this.forestService.loadInitialData();
    this.sprintService.loadSprints();
    this.reviewService.loadReviews();
  }

  // BambooForest CRUD
  getForests(): Observable<BambooForest[]> {
    return this.forestService.getForests();
  }

  getForest(id: string): BambooForest | undefined {
    return this.forestService.getForest(id);
  }

  addForest(forest: BambooForest): void {
    this.forestService.addForest(forest);
  }

  updateForest(forest: BambooForest): void {
    this.forestService.updateForest(forest);
  }

  deleteForest(id: string): void {
    this.forestService.deleteForest(id);
  }

  archiveForest(id: string, archived: boolean): void {
    this.forestService.archiveForest(id, archived);
  }

  // BambooField CRUD
  addField(field: BambooField): void {
    this.forestService.addField(field);
  }

  updateField(field: BambooField): void {
    this.forestService.updateField(field);
  }

  deleteField(forestId: string, fieldId: string): void {
    this.forestService.deleteField(forestId, fieldId);
  }

  updateFieldOrder(forestId: string, fields: BambooField[]): void {
    this.forestService.updateFieldOrder(forestId, fields);
  }

  archiveField(forestId: string, fieldId: string, archived: boolean): void {
    this.forestService.archiveField(forestId, fieldId, archived);
  }

  // Bamboo CRUD
  addBamboo(bamboo: Bamboo): void {
    this.bambooService.addBamboo(bamboo);
  }

  updateBamboo(bamboo: Bamboo): void {
    this.bambooService.updateBamboo(bamboo);
  }

  deleteBamboo(fieldId: string, bambooId: string): void {
    this.bambooService.deleteBamboo(fieldId, bambooId);
  }

  archiveBamboo(fieldId: string, bambooId: string, archived: boolean): void {
    this.bambooService.archiveBamboo(fieldId, bambooId, archived);
  }

  // BambooSection (Task) CRUD
  addBambooSection(section: BambooSection): void {
    this.taskService.addBambooSection(section);
  }

  updateBambooSection(section: BambooSection): void {
    this.taskService.updateBambooSection(section);
  }

  deleteBambooSection(bambooId: string, sectionId: string): void {
    this.taskService.deleteBambooSection(bambooId, sectionId);
  }

  // Goal CRUD
  addGoal(goal: Goal): void {
    this.goalService.addGoal(goal);
  }

  updateGoal(goal: Goal): void {
    this.goalService.updateGoal(goal);
  }

  deleteGoal(forestId: string, goalId: string): void {
    this.goalService.deleteGoal(forestId, goalId);
  }

  // KeyOutput CRUD
  addKeyOutput(keyOutput: KeyOutput): void {
    this.keyOutputService.addKeyOutput(keyOutput);
  }

  updateKeyOutput(keyOutput: KeyOutput): void {
    this.keyOutputService.updateKeyOutput(keyOutput);
  }

  deleteKeyOutput(forestId: string, keyOutputId: string): void {
    this.keyOutputService.deleteKeyOutput(forestId, keyOutputId);
  }

  // Learning CRUD
  addLearning(learning: Learning): void {
    this.learningService.addLearning(learning);
  }

  updateLearning(learning: Learning): void {
    this.learningService.updateLearning(learning);
  }

  deleteLearning(forestId: string, learningId: string): void {
    this.learningService.deleteLearning(forestId, learningId);
  }

  // Sprint CRUD
  getSprints(): Observable<Sprint[]> {
    return this.sprintService.getSprints();
  }

  addSprint(sprint: Sprint): Observable<Sprint> {
    return this.sprintService.addSprint(sprint);
  }

  updateSprint(sprint: Sprint): Observable<Sprint> {
    return this.sprintService.updateSprint(sprint);
  }

  deleteSprint(id: string): void {
    this.sprintService.deleteSprint(id);
  }

  // DailyReview CRUD
  getReviews(): Observable<DailyReview[]> {
    return this.reviewService.getReviews();
  }

  saveReview(review: DailyReview): Observable<DailyReview> {
    return this.reviewService.saveReview(review);
  }
}
