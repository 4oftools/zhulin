import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

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
import { StrategicNavigationComponent } from './components/strategic/strategic-navigation/strategic-navigation.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    StrategicNavigationComponent,
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
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

