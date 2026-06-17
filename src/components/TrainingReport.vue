<template>
  <div class="training-report">
    <h2>{{ $t('report.title') }}</h2>

    <!-- 训练记录列表 -->
    <div class="training-list">
      <div v-for="(record, index) in processedRecords" :key="record.id" class="training-item">
        <div class="training-index">#{{ processedRecords.length - index }}</div>
        <div class="training-info">
          <div class="training-date">{{ new Date(record.startTime).toLocaleDateString('en-US') }}</div>
          <div class="training-mode">{{ record.mode }}</div>
          <div class="training-quality">{{ $t('common.trainingQualityLabel') }}: {{ formatPercent(record.overallStats.quality) }}%</div>
        </div>
      </div>
    </div>

    <!-- 图表控制按钮 -->
    <div class="report-controls">
      <button @click="toggleChart">{{ showChart ? $t('common.collapseChart') : $t('common.expandChart') }}</button>
    </div>

    <!-- 统计图表 -->
    <div v-if="showChart" class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';
import { useTrainingStore } from '@/stores/training';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// 默认隐藏图表
const showChart = ref(false);
const trainingStore = useTrainingStore();

// 获取训练记录并处理
const processedRecords = computed(() => {
  const history = JSON.parse(localStorage.getItem('trainingHistory') || '[]');
  return history
    .sort((a: any, b: any) => b.startTime - a.startTime)
    .map((record: any, index: number) => ({
      ...record,
      index: history.length - index
    }));
});

// 图表数据
const chartData = computed(() => ({
  labels: processedRecords.value.map(record =>
    `#${record.index} ${new Date(record.startTime).toLocaleDateString('en-US')}`
  ),
  datasets: [{
    label: t('common.trainingQualityLabel'),
    data: processedRecords.value.map(record => record.overallStats.quality),
    borderColor: '#4caf50',
    tension: 0.4
  }]
}));

// 图表配置
const chartOptions = {
  responsive: true,
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      title: {
        display: true,
        text: t('common.trainingQualityLabel')
      }
    },
    x: {
      title: {
        display: true,
        text: t('common.trainingIndexAndDate')
      }
    }
  }
};

const toggleChart = () => {
  showChart.value = !showChart.value;
};

const formatPercent = (value: number) => value.toFixed(1);
</script>

<style scoped>
.training-report {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.training-list {
  margin: 20px 0;
}

.training-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 10px;
}

.training-index {
  font-size: 18px;
  font-weight: bold;
  margin-right: 20px;
  color: #4caf50;
  min-width: 50px;
}

.training-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.training-date, .training-mode, .training-quality {
  padding: 5px 10px;
  background: #fff;
  border-radius: 4px;
}

.report-controls {
  text-align: center;
  margin: 20px 0;
}

.report-controls button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chart-container {
  margin-top: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
