// 删除单个训练记录
const deleteRecord = (index: number) => {
  if (confirm('确定要删除这条训练记录吗？')) {
    const history = JSON.parse(localStorage.getItem('training_history') || '[]');
    // 保存要删除的记录的 mode，以便后续比较
    const deletedMode = history[index].mode;
    // 删除记录
    history.splice(index, 1);
    // 确保其他记录的 mode 不受影响
    history.forEach(record => {
      if (record.mode !== 'mixed') {
        record.mode = record.units[0].mode;
      }
    });
    localStorage.setItem('training_history', JSON.stringify(history));
    trainingStore.loadTrainingHistory(); // 重新加载训练记录
  }
};

// 计算训练质量
const calculateQuality = (session) => {
  if (!session || !session.units) return 0;
  
  // 计算所有单元的平均质量
  const unitQualities = session.units.map(unit => {
    if (!unit.stats) return 0;
    // 确保数值类型转换
    const accuracy = Number(unit.stats.correctTrials) / Number(unit.stats.totalTrials);
    const stability = Number(unit.stats.stability) || 0;
    return (accuracy * 0.7 + stability * 0.3) * 100;
  });
  
  // 过滤掉0值并计算平均值
  const validQualities = unitQualities.filter(q => q > 0);
  if (validQualities.length === 0) return 0;
  return validQualities.reduce((sum, q) => sum + q, 0) / validQualities.length;
};

// 在模板中使用
<template>
  <div class="report">
    <div class="report-content">
      <div class="report-header">
        <h1>{{ $t('report.title') }}</h1>
        <div class="controls">
          <button class="control-btn" @click="toggleChart">
            {{ showChart ? '隐藏图表' : '显示图表' }}
          </button>
          <button class="clear-btn" @click="confirmClearHistory">
            清空记录
          </button>
        </div>
      </div>

      <!-- 训练质量折线图 -->
      <div v-if="showChart" class="chart-container">
        <LineChart :data="chartData" />
      </div>

      <!-- 训练记录表格 -->
      <div class="training-records">
        <div v-for="(record, index) in recentSessions" :key="index" class="record-item">
          <div class="record-info">
            <div class="record-header">
              <span class="record-type">{{ getTrainingModeTitle(record.mode) }}</span>
              <span class="record-time">{{ formatTime(record.startTime) }}</span>
            </div>
            <div class="record-stats">
              <span>正确率: {{ formatPercent(record.accuracy) }}%</span>
              <span>稳定性: {{ formatPercent(record.stability) }}%</span>
              <span>质量: {{ formatPercent(record.quality) }}%</span>
            </div>
          </div>
          <div class="record-actions">
            <button class="delete-btn" @click="deleteRecord(index)">删除</button>
          </div>
        </div>
      </div>

      <!-- 确认清空对话框 -->
      <div v-if="showClearDialog" class="dialog-overlay" @click.self="showClearDialog = false">
        <div class="dialog">
          <h3>确认清空</h3>
          <p>确定要清空所有训练记录吗？此操作不可恢复。</p>
          <div class="dialog-actions">
            <button class="confirm-btn" @click="clearHistory">确定</button>
            <button class="cancel-btn" @click="showClearDialog = false">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 初始化时隐藏图表
const showChart = ref(false);

// 切换图表显示状态
const toggleChart = () => {
  showChart.value = !showChart.value;
};
</script>

// 在 recentSessions 计算属性中使用
const recentSessions = computed(() => {
  return trainingStore.trainingHistory.map(session => ({
    ...session,
    quality: calculateQuality(session)
  })).sort((a, b) => b.startTime - a.startTime);
}); 