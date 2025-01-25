<template>
  <div class="crowding-container">
    <div class="crowding-array">
      <template v-for="(row, rowIndex) in stimulusArray" :key="rowIndex">
        <div v-for="(item, colIndex) in row" :key="`${rowIndex}-${colIndex}`"
          class="crowding-item"
          :class="{ target: item.isTarget }"
          :style="{ transform: `rotate(${item.rotation}deg)` }"
        >
          {{ item.char }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 定义常量
const ROWS = 7;
const COLS = 9;

// 生成随机旋转角度
function getRandomRotation(): number {
  return Math.floor(Math.random() * 4) * 90;
}

// 生成拥挤阵列
function generateCrowdingArray() {
  const array = [];
  const centerRow = Math.floor(ROWS / 2);
  const centerCol = Math.floor(COLS / 2);

  for (let i = 0; i < ROWS; i++) {
    const row = [];
    for (let j = 0; j < COLS; j++) {
      if (i === centerRow && j === centerCol) {
        row.push({
          char: 'E',
          rotation: getRandomRotation(),
          isTarget: true
        });
      } else {
        row.push({
          char: 'E',
          rotation: getRandomRotation(),
          isTarget: false
        });
      }
    }
    array.push(row);
  }
  return array;
}

const stimulusArray = ref(generateCrowdingArray());
</script>

<style scoped>
.crowding-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #A4A4A4;
}

.crowding-array {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(7, 1fr);
  gap: 0.5em;
  padding: 1em;
}

.crowding-item {
  font-family: Arial, sans-serif;
  font-weight: bold;
  font-size: 2em;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 1.2em;
  height: 1.2em;
  color: black;
}

.target {
  color: black;
}
</style>

const generateCrowdingArray = () => {
  const rows = 7; // 增加到7行
  const cols = 9; // 增加到9列
  const array = [];
  const centerRow = Math.floor(rows / 2);
  const centerCol = Math.floor(cols / 2);

  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      if (i === centerRow && j === centerCol) {
        // 中心位置是目标E
        row.push({
          char: 'E',
          rotation: getRandomRotation(),
          isTarget: true
        });
      } else {
        // 周围的干扰E
        row.push({
          char: 'E',
          rotation: getRandomRotation(),
          isTarget: false
        });
      }
    }
    array.push(row);
  }
  return array;
};

.crowding-array {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5em;
  justify-items: center;
  align-items: center;
}

.crowding-item {
  font-family: Arial, sans-serif;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 1.2em;
  height: 1.2em;
}

.target {
  color: inherit;
}

.distractor {
  color: inherit;
  opacity: 0.9;
}

// 修改显示函数
const showCrowdingStimulus = (unit: TrainingUnit): boolean => {
  if (!trainingCanvas.value || !currentSession.value) return false;
  const ctx = trainingCanvas.value.getContext('2d');
  if (!ctx) return false;

  console.log('Showing crowding stimulus');

  const minSize = Math.round(windowSize.value.height * 0.03); // 减小基础字母大小
  const maxSize = Math.round(windowSize.value.height * 0.06);
  const letterSize = Math.round(minSize + (maxSize - minSize) * unit.difficulty.size);
  
  const spacing = letterSize * 0.7; // 减小间距，使字母更紧密
  const flashInterval = currentSession.value.flashRate;

  // 设置字体
  ctx.font = `bold ${letterSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const centerX = Math.round(windowSize.value.width / 2);
  const centerY = Math.round(windowSize.value.height / 2);

  // 决定是否在第一次显示中间的E
  const showEFirst = Math.random() > 0.5;

  // 创建7x9的矩阵位置
  const positions = [];
  const rows = 7;
  const cols = 9;
  const startX = centerX - (cols - 1) * spacing / 2;
  const startY = centerY - (rows - 1) * spacing / 2;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      positions.push([
        startX + j * spacing,
        startY + i * spacing
      ]);
    }
  }

  const centerIndex = Math.floor(rows / 2) * cols + Math.floor(cols / 2);

  // 第一次闪烁
  showGrayBackground();
  drawStimulusFrame();
  
  // 绘制字母阵列
  ctx.fillStyle = `rgba(0, 0, 0, ${unit.difficulty.contrast})`;
  
  // 绘制7x9矩阵
  positions.forEach(([x, y], index) => {
    if (index === centerIndex) { // 中心位置
      if (showEFirst) {
        const rotation = Math.floor(Math.random() * 4) * 90;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.fillText('E', 0, 0);
        ctx.restore();
      }
    } else {
      const rotation = Math.floor(Math.random() * 4) * 90;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation * Math.PI / 180);
      ctx.fillText('E', 0, 0);
      ctx.restore();
    }
  });

  // 第二次闪烁
  stimulusTimeout.value = window.setTimeout(() => {
    showGrayBackground();
    drawStimulusFrame();
    
    // 重新绘制字母阵列
    ctx.fillStyle = `rgba(0, 0, 0, ${unit.difficulty.contrast})`;
    
    // 再次绘制7x9矩阵
    positions.forEach(([x, y], index) => {
      if (index === centerIndex) { // 中心位置
        if (!showEFirst) {
          const rotation = Math.floor(Math.random() * 4) * 90;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rotation * Math.PI / 180);
          ctx.fillText('E', 0, 0);
          ctx.restore();
        }
      } else {
        const rotation = Math.floor(Math.random() * 4) * 90;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.fillText('E', 0, 0);
        ctx.restore();
      }
    });
    
    // 设置延时等待响应
    stimulusTimeout.value = window.setTimeout(() => {
      showGrayBackground();
      if (!isProcessingResponse.value) {
        isReadyForStimulus.value = true;
      }
    }, flashInterval);
  }, flashInterval);

  return showEFirst;
}; 