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
    BambooFieldsComponent,
    ActivityListComponent,
    BambooTodoComponent,
    BambooSectionComponent,
    PlanningComponent,
    SprintComponent,
    RestComponent,
    InterruptionComponent,
    DailyReviewComponent,
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

