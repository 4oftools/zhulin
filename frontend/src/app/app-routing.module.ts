import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Strategic
import { StrategicNavigationComponent } from './components/strategic/strategic-navigation/strategic-navigation.component';
import { BambooFieldsComponent } from './components/strategic/bamboo-fields/bamboo-fields.component';

// Tactical
import { TacticalManagementComponent } from './components/tactical/tactical-management/tactical-management.component';

// Dashboard
import { DashboardComponent } from './components/dashboard/dashboard.component';

// Statistics
import { StatisticsComponent } from './components/statistics/statistics.component';

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
  { path: 'tactical', component: TacticalManagementComponent },
  { path: 'statistics', component: StatisticsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

