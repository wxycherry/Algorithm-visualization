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
        <div v-if="isRunning && !isCompleted">{{ stepDescription }}</div>
        <div v-else-if="isCompleted">汉诺塔移动完成！共使用了 {{ totalMoves }} 步移动</div>
        <div v-else>准备开始汉诺塔演示</div>
        <div>当前进度：{{ currentStep }}/{{ steps.length }}</div>
      </div>
      
      <div class="visualization">
        <div class="towers-container">
          <div class="tower" v-for="(tower, index) in [towers[0], towers[1], towers[2]]" :key="index">
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
              width: `${movingDisc.width}px`,
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
import { ref, computed, reactive, watch, nextTick } from 'vue';
import { message } from 'ant-design-vue'; 
import { useUserStore } from '@/store/index'
import { addHistoryAPI } from '@/api/history/history'
const userStore = useUserStore()
const token = userStore.token 
const discCount = ref(4);      
const speed = ref(500);         
const isRunning = ref(false);   
const isCompleted = ref(false); 
const stepIndex = ref(0);      
const steps = ref([]);       
const towerNames = ['起始柱 (A)', '辅助柱 (B)', '目标柱 (C)'];
const towers = reactive({
  0: { discs: [] }, // 塔A
  1: { discs: [] }, // 塔B
  2: { discs: [] }  // 塔C
});
const discColors = [
  '#123F68', 
  '#105186', 
  '#0D5897', 
  '#0E6FBB', 
  '#1C8DDB', 
  '#44A7EC', 
  '#85C5F4', 
  '#BEDFF9', 
  '#E2EFFC', 
  '#F1F8FE', 
];
// 正在移动的圆盘信息，用于控制浮动圆盘的动画
const movingDisc = ref(null);
let animationRunning = false; 
const type=3
const handleAddHistory = async (details) => {
  try {
    const res = await addHistoryAPI(details, type, token);
    console.log('历史记录添加成功:', details);
  } catch (e) {
    console.error('新增历史记录失败:', e);
    message.error('新增历史记录失败');
  }
};
const speedLabel = computed(() => {
  if (speed.value >= 800) return '非常慢';
  if (speed.value >= 600) return '慢速';
  if (speed.value >= 400) return '中速';
  if (speed.value >= 200) return '快速';
  return '非常快';
});

// 汉诺塔总步数
const totalMoves = computed(() => Math.pow(2, discCount.value) - 1);

// 当前步骤的文字描述
const stepDescription = computed(() => {
  if (stepIndex.value >= steps.value.length) return '';
  const step = steps.value[stepIndex.value];
  return `移动 ${step.disc}号圆盘 从 ${towerNames[step.from]} 到 ${towerNames[step.to]}`;
});

// 当前进度
const currentStep = computed(() => stepIndex.value);
// 根据圆盘大小计算宽度
const discSize = (disc) => {
  return 80 + (disc - 1) * 30; 
};
const discColor = (disc) => {
  return discColors[disc - 1] || discColors[discColors.length - 1];
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// 生成汉诺塔解决方案（递归，并记录每一步）
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
// 重置汉诺塔状态到初始值
const reset = () => {
  isRunning.value = false;
  isCompleted.value = false;
  stepIndex.value = 0;
  steps.value = [];
  movingDisc.value = null; 
  animationRunning = false; 

  // 清空所有塔
  towers[0].discs = [];
  towers[1].discs = [];
  towers[2].discs = [];

  // 初始化起始柱 (A) 上的圆盘
  for (let i = discCount.value; i > 0; i--) {
    towers[0].discs.push(i);
  }

  generateSolution(discCount.value, 0, 2, 1); 
};
// 开始/暂停运行
const toggleRun = async () => {
  if (!isRunning.value && stepIndex.value === 0) {
    await handleAddHistory(`圆盘数量: ${discCount.value}，移动速度: ${speedLabel.value}`);
  }
  
  isRunning.value = !isRunning.value;

  if (isRunning.value && !isCompleted.value) {
    if (animationRunning) return; 
    animationRunning = true;
    await executeStepAnimation(); 
    animationRunning = false; 
  }
};
const executeStepAnimation = async () => {
  while (stepIndex.value < steps.value.length && isRunning.value) {
    const step = steps.value[stepIndex.value];
    const discToMove = step.disc;
    const discWidthValue = discSize(discToMove);
    const discHeight = 30; 
    const allTowers = document.querySelectorAll('.towers-container .tower');
    const sourceTowerEl = allTowers[step.from];
    const targetTowerEl = allTowers[step.to];
    const towersContainerEl = document.querySelector('.towers-container');

    if (!sourceTowerEl || !targetTowerEl || !towersContainerEl) {
        console.error('DOM elements for tower calculation not found!');
        isRunning.value = false;
        return;
    }

    const sourceTowerRect = sourceTowerEl.getBoundingClientRect();
    const targetTowerRect = targetTowerEl.getBoundingClientRect();
    const towersContainerRect = towersContainerEl.getBoundingClientRect();
    const calculateX = (towerRect) => {
        return (towerRect.left + towerRect.width / 2) - (discWidthValue / 2) - towersContainerRect.left;
    };
    const initialBottomY = (towers[step.from].discs.length * discHeight) + 12; 
    
    movingDisc.value = {
      value: discToMove,
      width: discWidthValue,
      x: calculateX(sourceTowerRect),
      y: initialBottomY,
    };

    // 提升圆盘到空中高度 
    const liftY = towersContainerRect.height + 50; 
    
    movingDisc.value.y = liftY; 
    await sleep(speed.value / 2); 

    if (!isRunning.value) break; 

    movingDisc.value.x = calculateX(targetTowerRect); 
    await sleep(speed.value / 2); 

    if (!isRunning.value) break; 

    //  放置圆盘到目标塔上 
    const removedDisc = towers[step.from].discs.pop(); 
    towers[step.to].discs.push(removedDisc);
    await nextTick(); 
    const finalBottomY = (towers[step.to].discs.length * discHeight) + 12; 
    movingDisc.value.y = finalBottomY; 
    await sleep(speed.value / 2); 

    // --- 动画完成，进入下一轮循环前的清理 ---
    movingDisc.value = null;
    stepIndex.value++; 
    await sleep(100); 

    if (!isRunning.value) break;
  }

  // 动画循环结束后处理
  if (stepIndex.value >= steps.value.length) {
    isCompleted.value = true;
    isRunning.value = false; 
    movingDisc.value = null;
  } else {
    isRunning.value = false; 
  }
};

// 监听圆盘数量变化，自动重置游戏
watch(discCount, () => {
  reset();
});

// 页面加载后立即初始化
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
  padding: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  gap: 20px;
}
.left {
  width: 65%; 
  height: auto; 
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); 
  padding: 30px; 
  display: flex;
  flex-direction: column;
}
.top {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  gap: 20px; 
  flex-wrap: wrap; 
}
.disc-input, .speed-control {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  border-radius: 10px; 
  background: #f8f9fc;
  height: 55px; 
  border: 1px solid #e0e6f0; 
  flex: 1; 
  min-width: 250px; 
}
.disc-input label, .speed-control label {
  color: #555;
  font-weight: 500;
  white-space: nowrap;
}
.disc-input input[type="range"], .speed-control input[type="range"] {
  width: 100%;
  height: 4px; 
  background: #d8e1f0; 
  border-radius: 2px;
  -webkit-appearance: none;
  appearance: none;
  outline: none;
  cursor: grab;
}
.disc-input input[type="range"]::-webkit-slider-thumb,
.speed-control input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px; 
  height: 20px;
  border-radius: 50%;
  background: #4a74fb;
  cursor: grab;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: background 0.3s ease;
}
.disc-input input[type="range"]::-webkit-slider-thumb:hover,
.speed-control input[type="range"]::-webkit-slider-thumb:hover {
  background: #3a5cc8;
}
.buttons {
  display: flex;
  gap: 15px;
}
.btn {
  height: 45px; 
  padding: 0 25px;
  border-radius: 8px; 
  border: none;
  font-weight: 600;
  font-size: 16px; 
  cursor: pointer;
  transition: all 0.3s ease; 
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0px 4px 10px rgba(0,0,0,0.05); 
}
.btn-start {
  background: linear-gradient(to right, #4a74fb, #3a5cc8);
  color: white;
}
.btn-reset {
  background: #eff4fe; 
  color: #3b60dc; 
  border: 1px solid #cdd8ff;
}
.btn:hover {
  transform: translateY(-3px); 
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  background: #e0e0e0;
  color: #999;
}
.progress-info {
  margin: 20px 0;
  padding: 15px 20px;
  background: #eef5ff;
  border-radius: 10px;
  font-size: 16px;
  color: #3a5cc8;
  border-left: 5px solid #4a74fb;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); 
}
.visualization {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center; 
  align-items: center; 
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(to bottom, #f0f7ff, #e7effa); 
  border: 1px solid #dce8f7;
  padding: 20px;
  position: relative; 
}
.towers-container {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  width: 100%;
  max-width: 700px;
  height: 300px;
  position: relative;
}
.tower {
  width: 30%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.tower-base {
  height: 16px;
  width: 100%;
  background: linear-gradient(to right, #8d6e63, #6d4c41);
  border-radius: 8px;
  position: absolute;
  bottom: 0;
  z-index: 0;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
.tower-pillar {
  width: 14px;
  height: calc(100% - 16px);
  background: linear-gradient(to top, #8d6e63, #6d4c41);
  border-radius: 7px;
  position: absolute;
  bottom: 16px;
  z-index: 0;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.discs-container {
  position: absolute;
  bottom: 16px;
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
  border-radius: 18px;
  margin: 1px 0;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  z-index: 1;
  box-shadow: 0 3px 6px rgba(0,0,0,0.15);
  border: 1px solid rgba(255,255,255,0.3);
}
.tower-label {
  position: absolute;
  bottom: -35px;
  font-weight: 600;
  font-size: 17px;
  color: #333;
}
.current-disc {
  position: absolute;
  z-index: 100;
  transition: all 0.6s ease-in-out;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 18px;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  box-shadow: 0 6px 15px rgba(0,0,0,0.35);
  border: 2px solid rgba(255,255,255,0.7);
}
.right {
  width: 35%;
  height: auto;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
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
  margin-bottom: 25px;
  text-align: center;
  font-weight: bold;
  font-size: 26px;
}
.section {
  margin-bottom: 30px;
}
h3 {
  color: #4a74fb;
  margin-bottom: 12px;
  font-size: 20px;
  border-bottom: 2px solid #e8ecfa;
  padding-bottom: 10px;
  font-weight: 600;
}
p {
  color: #555;
  line-height: 1.7;
  margin-bottom: 15px;
  font-size: 15px;
}
ul, ol {
  padding-left: 25px;
  margin: 15px 0;
}
li {
  color: #555;
  margin-bottom: 8px;
  font-size: 15px;
  line-height: 1.6;
}
.code-block {
  background-color: #282c34;
  border-radius: 8px;
  padding: 20px;
  margin: 1.5rem 0;
  overflow-x: auto;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);
}
code {
  font-family: 'Fira Code', 'Consolas', 'Courier New', monospace;
  color: #abb2bf;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>

