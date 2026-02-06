import { BambooForest, BambooField, Bamboo, Goal, KeyOutput, Learning, BambooSection, Sprint, DailyReview } from '../models/bamboo-forest.model';

export class SerializationHelper {
  static deserializeForests(data: any[]): BambooForest[] {
    return data.map(forest => this.deserializeForest(forest));
  }

  static deserializeForest(forest: any): BambooForest {
    return {
      ...forest,
      startDate: new Date(forest.startDate),
      endDate: new Date(forest.endDate),
      createdAt: new Date(forest.createdAt),
      updatedAt: new Date(forest.updatedAt),
      archivedAt: forest.archivedAt ? new Date(forest.archivedAt) : undefined,
      bambooFields: (forest.bambooFields || []).map((f: any) => this.deserializeField(f)),
      goals: (forest.goals || []).map((g: any) => this.deserializeGoal(g)),
      keyOutputs: (forest.keyOutputs || []).map((k: any) => this.deserializeKeyOutput(k)),
      learnings: (forest.learnings || []).map((l: any) => this.deserializeLearning(l))
    };
  } 

  static deserializeField(field: any): BambooField {
    return {
      ...field,
      startDate: new Date(field.startDate),
      endDate: new Date(field.endDate),
      createdAt: new Date(field.createdAt),
      updatedAt: new Date(field.updatedAt),
      archivedAt: field.archivedAt ? new Date(field.archivedAt) : undefined,
      bamboos: (field.bamboos || []).map((b: any) => this.deserializeBamboo(b))
    };
  }

  static deserializeBamboo(bamboo: any): Bamboo {
    return {
      ...bamboo,
      startDate: new Date(bamboo.startDate),
      endDate: new Date(bamboo.endDate),
      createdAt: new Date(bamboo.createdAt),
      updatedAt: new Date(bamboo.updatedAt),
      completedAt: bamboo.completedAt ? new Date(bamboo.completedAt) : undefined,
      archivedAt: bamboo.archivedAt ? new Date(bamboo.archivedAt) : undefined,
      tasks: (bamboo.tasks || []).map((t: any) => this.deserializeTask(t))
    };
  }

  static deserializeTask(task: any): BambooSection {
    return {
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined
    };
  }

  static deserializeGoal(goal: any): Goal {
    return {
      ...goal,
      createdAt: new Date(goal.createdAt),
      updatedAt: new Date(goal.updatedAt),
      completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined
    };
  }

  static deserializeKeyOutput(ko: any): KeyOutput {
    return {
      ...ko,
      createdAt: new Date(ko.createdAt),
      updatedAt: new Date(ko.updatedAt),
      completedAt: ko.completedAt ? new Date(ko.completedAt) : undefined
    };
  }

  static deserializeLearning(l: any): Learning {
    return {
      ...l,
      createdAt: new Date(l.createdAt),
      updatedAt: new Date(l.updatedAt)
    };
  }

  static deserializeSprints(data: any[]): Sprint[] {
    return data.map(sprint => this.deserializeSprint(sprint));
  }

  static deserializeSprint(sprint: any): Sprint {
    return {
      ...sprint,
      startTime: new Date(sprint.startTime),
      endTime: sprint.endTime ? new Date(sprint.endTime) : undefined
    };
  }

  static deserializeReviews(data: any[]): DailyReview[] {
    return data.map(review => this.deserializeReview(review));
  }

  static deserializeReview(review: any): DailyReview {
    return {
      ...review,
      createdAt: review.createdAt ? new Date(review.createdAt) : undefined,
      updatedAt: review.updatedAt ? new Date(review.updatedAt) : undefined
    };
  }
}
