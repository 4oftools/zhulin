import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

// Strategic Components
import { BambooForestComponent } from './components/strategic/bamboo-forest/bamboo-forest.component';
import { BambooFieldComponent } from './components/strategic/bamboo-field/bamboo-field.component';
import { BambooComponent } from './components/strategic/bamboo/bamboo.component';
import { GoalComponent } from './components/strategic/goal/goal.component';
import { TaskComponent } from './components/strategic/task/task.component';
import { PlanReviewComponent } from './components/strategic/plan-review/plan-review.component';

// Tactical Components
import { ActivityListComponent } from './components/tactical/activity-list/activity-list.component';
import { BambooTodoComponent } from './components/tactical/bamboo-todo/bamboo-todo.component';
import { BambooSectionComponent } from './components/tactical/bamboo-section/bamboo-section.component';
import { PlanningComponent } from './components/tactical/planning/planning.component';
import { SprintComponent } from './components/tactical/sprint/sprint.component';
import { RestComponent } from './components/tactical/rest/rest.component';
import { InterruptionComponent } from './components/tactical/interruption/interruption.component';
import { DailyReviewComponent } from './components/tactical/daily-review/daily-review.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    BambooForestComponent,
    BambooFieldComponent,
    BambooComponent,
    GoalComponent,
    TaskComponent,
    PlanReviewComponent,
    ActivityListComponent,
    BambooTodoComponent,
    BambooSectionComponent,
    PlanningComponent,
    SprintComponent,
    RestComponent,
    InterruptionComponent,
    DailyReviewComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    // Angular Material Modules
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatBadgeModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule,
    MatListModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatTooltipModule,
    MatDividerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

