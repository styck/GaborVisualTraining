import type { TrainingSession, TrainingResult } from '@/types';

class TrainingStorage {
  private readonly SESSION_KEY = 'currentTrainingSession';
  private readonly HISTORY_KEY = 'trainingHistory';

  saveCurrentSession(session: TrainingSession) {
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (err) {
      console.error('Failed to save training session:', err);
    }
  }

  loadCurrentSession(): TrainingSession | null {
    try {
      const saved = localStorage.getItem(this.SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error('Failed to load training session:', err);
      return null;
    }
  }

  clearCurrentSession() {
    localStorage.removeItem(this.SESSION_KEY);
  }

  saveTrainingResult(result: TrainingResult) {
    try {
      const history = this.loadTrainingHistory();
      history.push(result);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    } catch (err) {
      console.error('Failed to save training result:', err);
    }
  }

  loadTrainingHistory(): TrainingResult[] {
    try {
      const saved = localStorage.getItem(this.HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Failed to load training history:', err);
      return [];
    }
  }

  clearTrainingHistory() {
    localStorage.removeItem(this.HISTORY_KEY);
  }
}

export const trainingStorage = new TrainingStorage(); 