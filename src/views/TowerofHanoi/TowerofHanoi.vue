<template>
  <div class="hanotas">
    <div class="left">
      <div class="top">
        <div class="disc-input">
          <label>圆盘数量：</label>
          <input type="range" min="3" max="8" v-model.number="discCount" :disabled="isRunning">
          <span>{{ discCount }}</span>
        </div>
        <div class="speed-control">
          <label>移动速度：</label>
          <input type="range" min="100" max="1000" step="100" v-model.number="speed" :disabled="isRunning">
          <span>{{ speedLabel }}</span>
        </div>
        <div class="buttons">
          <button class="btn btn-start" @click="toggleRun" :disabled="isCompleted">
            {{ isRunning ? '⏸️ 暂停' : '▶️ 开始演示' }}
          </button>
          <button class="btn btn-reset" @click="reset">🔄 重置</button>
        </div>
      </div>
      <div class="progress-info">
        <div v-if="isRunning">{{ stepDescription }}</div>
        <div v-else-if="isCompleted">汉诺塔移动完成！共使用了 {{ totalMoves }} 步移动</div>
        <div v-else>准备开始汉诺塔演示</div>
        <div>当前进度：{{ currentStep }}/{{ steps.length }}</div>
      </div>
      <div class="visualization">
        <div class="towers-container">
          <div class="tower" v-for="(tower, index) in towers" :key="index">
            <div class="tower-base"></div>
            <div class="tower-pillar"></div>
            <div class="discs-container">
              <div 
                v-for="(disc, discIndex) in tower.discs" 
                :key="discIndex"
                class="disc"
                :style="{
                  width: `${discSize(disc)}px`,
                  background: discColor(disc),
                  zIndex: discIndex + 1
                }"
              >
                {{ disc }}
              </div>
            </div>
            <div class="tower-label">{{ towerNames[index] }}</div>
          </div>
          <div 
            v-if="movingDisc" 
            class="current-disc"
            :style="{
              width: `${discSize(movingDisc.value)}px`,
              height: '30px',
              background: discColor(movingDisc.value),
              left: `${movingDisc.x}px`,
              bottom: `${movingDisc.y}px`,
            }"
          >
            {{ movingDisc.value }}
          </div>
        </div>
      </div>
    </div>
    <div class="right">
      <div class="content">
        <h2>汉诺塔算法</h2>
        <div class="section">
          <h3>算法原理</h3>
          <p>汉诺塔问题是一个经典的递归问题，要求将所有圆盘从起始柱移动到目标柱，过程中必须遵循以下规则：</p>
          <ul>
            <li>每次只能移动一个圆盘</li>
            <li>大圆盘不能放在小圆盘上面</li>
            <li>只能移动最顶端的圆盘</li>
          </ul>
          <p>解决汉诺塔问题的递归策略为：</p>
          <ol>
            <li>将 n-1 个圆盘从起始柱移到辅助柱</li>
            <li>将最大的圆盘移到目标柱</li>
            <li>将 n-1 个圆盘从辅助柱移到目标柱</li>
          </ol>
        </div>
        <!-- <div class="section">
          <h3>可视化说明</h3>
          <div class="visual-key">
            <div class="key-item">
              <div class="color-box moving-disc"></div>
              <span>正在移动的圆盘</span>
            </div>
            <div class="key-item">
              <div class="color-box source"></div>
              <span>起始柱 (A)</span>
            </div>
            <div class="key-item">
              <div class="color-box target"></div>
              <span>目标柱 (C)</span>
            </div>
            <div class="key-item">
              <div class="color-box auxiliary"></div>
              <span>辅助柱 (B)</span>
            </div>
          </div>
        </div> -->
        <div class="section">
          <h3>代码实现</h3>
          <pre class="code-block">
            <code>
function hanoi(n, source, target, auxiliary) {
  if (n === 1) {
    // 移动步骤记录
    steps.push({from: source, to: target, disc: n});
    return;
  }
  // 递归移动上面的盘子
  hanoi(n - 1, source, auxiliary, target);
  // 移动最大的盘子
  steps.push({from: source, to: target, disc: n});
  // 递归移动辅助柱上的盘子
  hanoi(n - 1, auxiliary, target, source);
}
            </code>
          </pre>
        </div>
        <div class="section">
          <h3>复杂度分析</h3>
          <ul>
            <li>时间复杂度：O(2ⁿ) - 指数级复杂度</li>
            <li>空间复杂度：O(n) - 递归调用栈的深度</li>
            <li>最少步数：2ⁿ - 1 (n为圆盘数量)</li>
          </ul>
          <p>汉诺塔问题展示了递归算法的强大功能，虽然步数随盘子数指数级增长，但算法思路异常清晰简洁。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue';

// 初始参数
const discCount = ref(4);
const speed = ref(500);
const isRunning = ref(false);
const isCompleted = ref(false);
const stepIndex = ref(0);
const steps = ref([]);
const towerNames = ['起始柱 (A)', '辅助柱 (B)', '目标柱 (C)'];

// 塔的状态 (0: A, 1: B, 2: C)
const towers = reactive({
  0: { discs: [] },
  1: { discs: [] },
  2: { discs: [] }
});

// 正在移动的圆盘信息
const movingDisc = ref(null);

// 计算属性
const speedLabel = computed(() => {
  if (speed.value >= 800) return '非常慢';
  if (speed.value >= 600) return '慢速';
  if (speed.value >= 400) return '中速';
  if (speed.value >= 200) return '快速';
  return '非常快';
});

const totalMoves = computed(() => Math.pow(2, discCount.value) - 1);

const stepDescription = computed(() => {
  if (stepIndex.value >= steps.value.length) return '';
  const step = steps.value[stepIndex.value];
  return `移动 ${step.disc}号圆盘 从 ${towerNames[step.from]} 到 ${towerNames[step.to]}`;
});

const currentStep = computed(() => stepIndex.value + 1);

// 根据圆盘大小计算宽度
const discSize = (disc) => {
  return 80 + disc * 30;
};

// 圆盘颜色
const discColor = (disc) => {
  const hue = (disc - 1) * (360 / discCount.value);
  return `linear-gradient(135deg, hsl(${hue}, 80%, 60%), hsl(${hue + 20}, 80%, 55%))`;
};

// 重置汉诺塔状态
const reset = () => {
  isRunning.value = false;
  isCompleted.value = false;
  stepIndex.value = 0;
  steps.value = [];
  movingDisc.value = null;

  // 初始化塔上的圆盘
  towers[0].discs = [];
  towers[1].discs = [];
  towers[2].discs = [];

  // 将圆盘添加到起始柱 (A)
  for (let i = discCount.value; i > 0; i--) {
    towers[0].discs.push(i);
  }

  // 生成解决方案
  generateSolution(discCount.value, 0, 2, 1);
};

// 生成汉诺塔解决方案（递归）
const generateSolution = (n, source, target, auxiliary) => {
  if (n === 1) {
    steps.value.push({
      disc: n,
      from: source,
      to: target
    });
    return;
  }
  generateSolution(n - 1, source, auxiliary, target);
  steps.value.push({
    disc: n,
    from: source,
    to: target
  });
  generateSolution(n - 1, auxiliary, target, source);
};

// 开始/暂停运行
const toggleRun = () => {
  isRunning.value = !isRunning.value;
};

// 动画计时器
let animationTimer = null;

// 执行当前步骤
const executeStep = () => {
  if (stepIndex.value >= steps.value.length) {
    isRunning.value = false;
    isCompleted.value = true;
    return;
  }
  const step = steps.value[stepIndex.value];
  // 移动圆盘前显示移动中的圆盘
  movingDisc.value = {
    value: step.disc,
    x: step.from * 190 + 100 - discSize(step.disc)/2,
    y: 200 + 20 * towers[step.from].discs.length
  };
  // 动画移动圆盘
  setTimeout(() => {
    // 移动到目标位置的上方
    movingDisc.value = {
      value: step.disc,
      x: step.to * 190 + 100 - discSize(step.disc)/2,
      y: 320
    };
    // 放到目标柱上
    setTimeout(() => {
      // 从起始柱移除圆盘
      towers[step.from].discs = towers[step.from].discs.filter(d => d !== step.disc);
      // 添加到目标柱（顶部）
      towers[step.to].discs.push(step.disc);
      // 隐藏移动中的圆盘
      movingDisc.value = null;
      stepIndex.value++;
      if (isRunning.value && stepIndex.value < steps.value.length) {
        animationTimer = setTimeout(executeStep, speed.value);
      } else if (stepIndex.value >= steps.value.length) {
        isRunning.value = false;
        isCompleted.value = true;
      }
    }, speed.value / 2);
  }, speed.value);
};

// 监听运行状态变化
watch(isRunning, (running) => {
  if (running && !isCompleted.value) {
    if (stepIndex.value >= steps.value.length) {
      isCompleted.value = true;
      isRunning.value = false;
    } else {
      executeStep();
    }
  } else if (!running) {
    if (animationTimer) clearTimeout(animationTimer);
  }
});

// 监听圆盘数量变化自动重置
watch(discCount, () => {
  reset();
});

// 初始化重置
reset();
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Microsoft YaHei', sans-serif;
}
body {
  background-color: #f5f7fb;
  min-height: 100vh;
  padding: 20px;
  color: #333;
}
.hanotas {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  gap: 20px;
}
.left {
  width: 60%;
  height: 100%;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  display: flex;
  flex-direction: column;
}
.top {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
}
.disc-input, .speed-control {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 15px;
  border-radius: 8px;
  background: #f8f9fc;
  height: 50px;
  flex: 1;
}
.disc-input input, .speed-control input {
  width: 100%;
  height: 30px;
  border: none;
  background: transparent;
}
.buttons {
  display: flex;
  gap: 10px;
}
.btn {
  height: 40px;
  padding: 0 20px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-start {
  background: linear-gradient(to right, #4a74fb, #3a5cc8);
  color: white;
}
.btn-reset {
  background: #f0f4ff;
  color: #3a5cc8;
  border: 1px solid #cbd8ff;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.progress-info {
  margin: 15px 0;
  padding: 12px 16px;
  background: #f0f4ff;
  border-radius: 8px;
  font-size: 15px;
  color: #3a5cc8;
  border-left: 4px solid #4a74fb;
}
.visualization {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fc;
  border: 1px solid #e8ecfa;
  padding: 20px;
}
.towers-container {
  display: flex;
  justify-content: space-around;
  height: 300px;
  margin: 20px 0;
  position: relative;
}
.tower {
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}
.tower-base {
  height: 12px;
  width: 120%;
  background: linear-gradient(to right, #8d6e63, #6d4c41);
  border-radius: 8px;
  position: absolute;
  bottom: 0;
  z-index: 0;
}
.tower-pillar {
  width: 12px;
  height: 100%;
  background: linear-gradient(to top, #8d6e63, #6d4c41);
  border-radius: 6px;
  position: absolute;
  bottom: 12px;
  z-index: 0;
}
.discs-container {
  position: absolute;
  bottom: 12px;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  width: 100%;
  z-index: 2;
}
.disc {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  margin: 2px 0;
  transition: all 0.6s ease;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  z-index: 1;
  box-shadow: 0 3px 6px rgba(0,0,0,0.15);
}
.tower-label {
  position: absolute;
  bottom: -40px;
  font-weight: 500;
  font-size: 16px;
}
.current-disc {
  position: absolute;
  z-index: 10;
  transition: all 0.6s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  box-shadow: 0 4px 10px rgba(0,0,0,0.25);
}
.right {
  width: 34%;
  height: 100%;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  overflow-y: auto;
  scrollbar-width: none; 
  -ms-overflow-style: none; 
}
.right::-webkit-scrollbar {
  display: none; 
}
.content {
  padding: 10px;
}
h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
  font-weight: bold;
}
.section {
  margin-bottom: 25px;
}
h3 {
  color: #4a74fb;
  margin-bottom: 10px;
  font-size: 18px;
  border-bottom: 1px solid #e8ecfa;
  padding-bottom: 8px;
}
p {
  color: #555;
  line-height: 1.6;
  margin-bottom: 12px;
  font-size: 15px;
}
.code-block {
  background-color: #2d2d2d;
  border-radius: 6px;
  padding: 15px;
  margin: 1rem 0;
  overflow-x: auto;
  height: auto;
}
code {
  font-family: 'Consolas', 'Courier New', monospace;
  color: #e0e0e0;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre;
}
ul {
  list-style-type: disc;
  padding-left: 20px;
  margin: 10px 0;
}
li {
  color: #555;
  margin-bottom: 8px;
  font-size: 15px;
}
.visual-key {
  margin-top: 20px;
  padding: 15px;
  background: #f0f4ff;
  border-radius: 8px;
}
.key-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 15px;
}
.color-box {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}
.moving-disc {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
}
.source {
  background: linear-gradient(135deg, #4a74fb, #668cff);
}
.target {
  background: linear-gradient(135deg, #20c997, #2ed1a6);
}
.auxiliary {
  background: linear-gradient(135deg, #a779e9, #c0a2ff);
}
</style>