import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Strategic
import { StrategicNavigationComponent } from './components/strategic/strategic-navigation/strategic-navigation.component';
import { BambooFieldsComponent } from './components/strategic/bamboo-fields/bamboo-fields.component';

// Tactical
import { ActivityListComponent } from './components/tactical/activity-list/activity-list.component';
import { BambooTodoComponent } from './components/tactical/bamboo-todo/bamboo-todo.component';
import { BambooSectionComponent } from './components/tactical/bamboo-section/bamboo-section.component';

// Dashboard
import { DashboardComponent } from './components/dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { 
    path: 'strategic', 
    component: StrategicNavigationComponent,
    children: [
      { path: 'forests/:forestId', component: BambooFieldsComponent }
    ]
  },
  { path: 'tactical/activities', component: ActivityListComponent },
  { path: 'tactical/todo/:bambooId', component: BambooTodoComponent },
  { path: 'tactical/sections/:bambooId', component: BambooSectionComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

