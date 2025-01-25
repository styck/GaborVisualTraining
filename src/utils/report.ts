import type { TrainingResult } from '@/types';

export interface TrainingReport {
  totalSessions: number;
  averageAccuracy: number;
  averageReactionTime: number;
  progressTrend: number; // 正值表示进步，负值表示退步
  recommendations: string[];
}

export class ReportGenerator {
  generateReport(results: TrainingResult[]): TrainingReport {
    if (results.length === 0) {
      return this.getEmptyReport();
    }

    const totalSessions = results.length;
    const averageAccuracy = this.calculateAverageAccuracy(results);
    const averageReactionTime = this.calculateAverageReactionTime(results);
    const progressTrend = this.calculateProgressTrend(results);
    const recommendations = this.generateRecommendations(averageAccuracy, progressTrend);

    return {
      totalSessions,
      averageAccuracy,
      averageReactionTime,
      progressTrend,
      recommendations
    };
  }

  private calculateAverageAccuracy(results: TrainingResult[]): number {
    return results.reduce((sum, result) => sum + result.accuracy, 0) / results.length;
  }

  private calculateAverageReactionTime(results: TrainingResult[]): number {
    return results.reduce((sum, result) => sum + result.reactionTime, 0) / results.length;
  }

  private calculateProgressTrend(results: TrainingResult[]): number {
    if (results.length < 2) return 0;

    const recentResults = results.slice(-5);
    const trendLine = recentResults.map((result, index) => ({
      x: index,
      y: result.accuracy * (1 - result.reactionTime / 2000) // 归一化的综合得分
    }));

    // 使用简单线性回归计算趋势
    const n = trendLine.length;
    const sumX = trendLine.reduce((sum, point) => sum + point.x, 0);
    const sumY = trendLine.reduce((sum, point) => sum + point.y, 0);
    const sumXY = trendLine.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumXX = trendLine.reduce((sum, point) => sum + point.x * point.x, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private generateRecommendations(accuracy: number, trend: number): string[] {
    const recommendations: string[] = [];

    if (accuracy < 0.7) {
      recommendations.push('建议降低训练难度，先确保基础准确率');
    }

    if (trend < -0.1) {
      recommendations.push('最近训练效果有所下降，建议适当休息或调整训练计划');
    } else if (trend > 0.1) {
      recommendations.push('训练进展良好，可以考虑适当提高难度');
    }

    return recommendations;
  }

  private getEmptyReport(): TrainingReport {
    return {
      totalSessions: 0,
      averageAccuracy: 0,
      averageReactionTime: 0,
      progressTrend: 0,
      recommendations: ['开始您的第一次训练吧！']
    };
  }
}

export const reportGenerator = new ReportGenerator(); 