import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Strategic
import { BambooForestComponent } from './components/strategic/bamboo-forest/bamboo-forest.component';
import { BambooFieldComponent } from './components/strategic/bamboo-field/bamboo-field.component';
import { BambooComponent } from './components/strategic/bamboo/bamboo.component';
import { GoalComponent } from './components/strategic/goal/goal.component';
import { TaskComponent } from './components/strategic/task/task.component';
import { PlanReviewComponent } from './components/strategic/plan-review/plan-review.component';

// Tactical
import { ActivityListComponent } from './components/tactical/activity-list/activity-list.component';
import { BambooTodoComponent } from './components/tactical/bamboo-todo/bamboo-todo.component';
import { BambooSectionComponent } from './components/tactical/bamboo-section/bamboo-section.component';

// Dashboard
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StrategicNavigationComponent } from './components/strategic/strategic-navigation/strategic-navigation.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'strategic', component: StrategicNavigationComponent },
  { path: 'strategic/forests', component: BambooForestComponent },
  { path: 'strategic/fields/:forestId', component: BambooFieldComponent },
  { path: 'strategic/bamboos/:fieldId', component: BambooComponent },
  { path: 'strategic/goals/:fieldId', component: GoalComponent },
  { path: 'strategic/tasks/:bambooId', component: TaskComponent },
  { path: 'strategic/plan-review', component: PlanReviewComponent },
  { path: 'tactical/activities', component: ActivityListComponent },
  { path: 'tactical/todo/:bambooId', component: BambooTodoComponent },
  { path: 'tactical/sections/:bambooId', component: BambooSectionComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

