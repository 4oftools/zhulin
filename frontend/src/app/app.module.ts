import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SvgIconDirective } from './directives/svg-icon.directive';

// Strategic Components
import { BambooFieldsComponent } from './components/strategic/bamboo-fields/bamboo-fields.component';

// Tactical Components
import { TacticalManagementComponent } from './components/tactical/tactical-management/tactical-management.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StrategicNavigationComponent } from './components/strategic/strategic-navigation/strategic-navigation.component';
import { StatisticsComponent } from './components/statistics/statistics.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    StrategicNavigationComponent,
    BambooFieldsComponent,
    TacticalManagementComponent,
    StatisticsComponent,
    SvgIconDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    DragDropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

