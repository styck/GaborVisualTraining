interface TrainingEvent {
  type: string;
  data: Record<string, any>;
  timestamp: number;
}

class Analytics {
  private events: TrainingEvent[] = [];

  trackEvent(type: string, data: Record<string, any>) {
    this.events.push({
      type,
      data,
      timestamp: Date.now()
    });

    // 当事件数量达到一定量时，自动保存
    if (this.events.length >= 100) {
      this.saveEvents();
    }
  }

  private async saveEvents() {
    try {
      const existingData = localStorage.getItem('trainingAnalytics');
      const allEvents = existingData 
        ? [...JSON.parse(existingData), ...this.events]
        : this.events;
      
      localStorage.setItem('trainingAnalytics', JSON.stringify(allEvents));
      this.events = [];
    } catch (err) {
      console.error('Failed to save analytics:', err);
    }
  }

  async getAnalytics() {
    const data = localStorage.getItem('trainingAnalytics');
    return data ? JSON.parse(data) : [];
  }
}

export const analytics = new Analytics(); 