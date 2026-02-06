import { Component, OnInit } from '@angular/core';
import { ForestService } from '../../services/forest.service';
import { BambooForest, BambooField, Bamboo, Goal, KeyOutput, Learning } from '../../models/bamboo-forest.model';
import { BambooSection } from '../../models/bamboo-forest.model';

interface ForestStatistics {
  forest: BambooForest;
  totalFields: number;
  totalBamboos: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  completionRate: number;
  totalGoals: number;
  completedGoals: number;
  totalKeyOutputs: number;
  completedKeyOutputs: number;
  totalLearnings: number;
}

interface GoalStatistics {
  goal: Goal;
  forest: BambooForest;
  totalBamboos: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  completionRate: number;
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
  standalone: false
})
export class StatisticsComponent implements OnInit {
  forests: BambooForest[] = [];
  forestStats: ForestStatistics[] = [];
  goalStats: GoalStatistics[] = [];
  
  overallStats = {
    totalForests: 0,
    totalFields: 0,
    totalBamboos: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    completionRate: 0,
    totalGoals: 0,
    completedGoals: 0,
    totalKeyOutputs: 0,
    completedKeyOutputs: 0,
    totalLearnings: 0
  };

  selectedTimeRange: 'all' | 'week' | 'month' | 'quarter' | 'year' = 'all';
  selectedForestId: string | null = null;

  Math = Math;

  constructor(
    private forestService: ForestService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.forestService.getForests().subscribe(forests => {
      this.forests = forests;
      this.calculateOverallStats(forests);
      this.calculateForestStats(forests);
      this.calculateGoalStats(forests);
    });
  }

  calculateOverallStats(forests: BambooForest[]): void {
    let totalFields = 0;
    let totalBamboos = 0;
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let pendingTasks = 0;
    let totalGoals = 0;
    let completedGoals = 0;
    let totalKeyOutputs = 0;
    let completedKeyOutputs = 0;
    let totalLearnings = 0;

    forests.forEach(forest => {
      totalFields += forest.bambooFields.length;
      
      forest.bambooFields.forEach(field => {
        totalBamboos += field.bamboos.length;
        
        field.bamboos.forEach(bamboo => {
          if (bamboo.tasks) {
            bamboo.tasks.forEach(task => {
              totalTasks++;
              if (task.status === 'completed' || task.completed) {
                completedTasks++;
              } else if (task.status === 'in-progress') {
                inProgressTasks++;
              } else {
                pendingTasks++;
              }
            });
          }
        });
      });

      totalGoals += forest.goals?.length || 0;
      completedGoals += forest.goals?.filter(g => g.completed).length || 0;
      
      totalKeyOutputs += forest.keyOutputs?.length || 0;
      completedKeyOutputs += forest.keyOutputs?.filter(ko => ko.completed).length || 0;
      
      totalLearnings += forest.learnings?.length || 0;
    });

    this.overallStats = {
      totalForests: forests.length,
      totalFields,
      totalBamboos,
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalGoals,
      completedGoals,
      totalKeyOutputs,
      completedKeyOutputs,
      totalLearnings
    };
  }

  calculateForestStats(forests: BambooForest[]): void {
    this.forestStats = forests.map(forest => {
      let totalFields = forest.bambooFields.length;
      let totalBamboos = 0;
      let totalTasks = 0;
      let completedTasks = 0;
      let inProgressTasks = 0;
      let pendingTasks = 0;

      forest.bambooFields.forEach(field => {
        totalBamboos += field.bamboos.length;
        
        field.bamboos.forEach(bamboo => {
          if (bamboo.tasks) {
            bamboo.tasks.forEach(task => {
              totalTasks++;
              if (task.status === 'completed' || task.completed) {
                completedTasks++;
              } else if (task.status === 'in-progress') {
                inProgressTasks++;
              } else {
                pendingTasks++;
              }
            });
          }
        });
      });

      const totalGoals = forest.goals?.length || 0;
      const completedGoals = forest.goals?.filter(g => g.completed).length || 0;
      const totalKeyOutputs = forest.keyOutputs?.length || 0;
      const completedKeyOutputs = forest.keyOutputs?.filter(ko => ko.completed).length || 0;
      const totalLearnings = forest.learnings?.length || 0;

      return {
        forest,
        totalFields,
        totalBamboos,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalGoals,
        completedGoals,
        totalKeyOutputs,
        completedKeyOutputs,
        totalLearnings
      };
    });
  }

  calculateGoalStats(forests: BambooForest[]): void {
    this.goalStats = [];
    
    forests.forEach(forest => {
      if (forest.goals) {
        forest.goals.forEach(goal => {
          let totalBamboos = 0;
          let totalTasks = 0;
          let completedTasks = 0;
          let inProgressTasks = 0;
          let pendingTasks = 0;

          forest.bambooFields.forEach(field => {
            field.bamboos.forEach(bamboo => {
              if (bamboo.goalId === goal.id) {
                totalBamboos++;
                
                if (bamboo.tasks) {
                  bamboo.tasks.forEach(task => {
                    totalTasks++;
                    if (task.status === 'completed' || task.completed) {
                      completedTasks++;
                    } else if (task.status === 'in-progress') {
                      inProgressTasks++;
                    } else {
                      pendingTasks++;
                    }
                  });
                }
              }
            });
          });

          this.goalStats.push({
            goal,
            forest,
            totalBamboos,
            totalTasks,
            completedTasks,
            inProgressTasks,
            pendingTasks,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
          });
        });
      }
    });
  }

  getFilteredForestStats(): ForestStatistics[] {
    let filtered = this.forestStats;
    
    if (this.selectedForestId) {
      filtered = filtered.filter(stat => stat.forest.id === this.selectedForestId);
    }
    
    return filtered;
  }

  getFilteredGoalStats(): GoalStatistics[] {
    let filtered = this.goalStats;
    
    if (this.selectedForestId) {
      filtered = filtered.filter(stat => stat.forest.id === this.selectedForestId);
    }
    
    return filtered;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'in-progress':
        return '#2196F3';
      case 'pending':
        return '#FF9800';
      default:
        return '#757575';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'in-progress':
        return '进行中';
      case 'pending':
        return '待办';
      default:
        return '未知';
    }
  }
}

