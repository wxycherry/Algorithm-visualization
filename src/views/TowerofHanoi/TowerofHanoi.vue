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
          <!-- 塔身渲染 -->
          <div class="tower" v-for="(tower, index) in [towers[0], towers[1], towers[2]]" :key="index">
            <div class="tower-base"></div>
            <div class="tower-pillar"></div>
            <div class="discs-container">
              <!-- 各自塔上的圆盘 -->
              <div 
                v-for="(disc, discIndex) in tower.discs" 
                :key="discIndex"
                class="disc"
                :style="{
                  width: `${discSize(disc)}px`,
                  background: discColor(disc),
                  zIndex: discIndex + 1 // 高的圆盘在上面，z-index也更高
                }"
              >
                {{ disc }}
              </div>
            </div>
            <div class="tower-label">{{ towerNames[index] }}</div>
          </div>
          
          <!-- 正在移动的圆盘 -->
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
import { message } from 'ant-design-vue'; // 假设你使用了 Ant Design Vue 的消息组件

// 假设 userStore 和 API 导入
// import { useUserStore } from '@/store/index';
// import { getHistoryAPI, addHistoryAPI } from '@/api/history/history';
// const userStore = useUserStore();
// const token = userStore.token;
// const type = 3;

// 模拟的 addHistoryAPI 函数，如果不需要后端交互，可以直接删除或注释
const addHistoryAPI = async (details, type, token) => {
  console.log(`模拟记录历史：类型 ${type}, 详情 "${details}"`);
  // return new Promise(resolve => setTimeout(resolve, 500)); // 模拟异步
};
const handleAddHistory = async (details) => {
  try {
    // 实际项目中取消注释
    // const res = await addHistoryAPI(details, type, token);
    console.log('历史记录添加成功:', details);
  } catch (e) {
    console.error('新增历史记录失败:', e);
    message.error('新增历史记录失败');
  }
};

// --- 可视化相关状态 ---
const discCount = ref(4);       // 圆盘数量
const speed = ref(500);         // 动画速度（毫秒）
const isRunning = ref(false);   // 是否正在运行
const isCompleted = ref(false); // 是否已完成
const stepIndex = ref(0);       // 当前执行到的步骤索引
const steps = ref([]);          // 存储所有移动步骤
const towerNames = ['起始柱 (A)', '辅助柱 (B)', '目标柱 (C)'];

// 塔的状态 (0: A, 1: B, 2: C)
// reactive 对象用于存储每个塔上的圆盘数组
const towers = reactive({
  0: { discs: [] }, // 塔A
  1: { discs: [] }, // 塔B
  2: { discs: [] }  // 塔C
});

// 正在移动的圆盘信息，用于控制浮动圆盘的动画
const movingDisc = ref(null);
let animationRunning = false; // 内部标志，避免在动画进行中重复启动executeStepAnimation

// --- 计算属性 ---
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

// --- 辅助函数 ---

// 根据圆盘大小计算宽度
const discSize = (disc) => {
  // 最小圆盘宽度 (disc=1) 80px，最大圆盘根据 discCount 算
  return 80 + (disc - 1) * 30; // 调整乘数使宽度差异明显
};
// 在 <script setup> 顶部添加
const discColors = [
  '#123F68', // Color 100
  '#105186', // Color 90
  '#0D5897', // Color 80
  '#0E6FBB', // Color 70
  '#1C8DDB', // Color 60
  '#44A7EC', // Color 50
  '#85C5F4', // Color 40
  '#BEDFF9', // Color 30
  '#E2EFFC', // Color 20
  '#F1F8FE', // Color 10
];

// 替换原有 discColor 函数
const discColor = (disc) => {
  return discColors[disc - 1] || discColors[discColors.length - 1];
};


// 异步延迟函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- 汉诺塔算法逻辑 ---

// 生成汉诺塔解决方案（递归，并记录每一步）
const generateSolution = (n, source, target, auxiliary) => {
  if (n === 1) {
    steps.value.push({
      disc: n,
      from: source, // 源塔索引
      to: target    // 目标塔索引
    });
    return;
  }
  // 将 n-1 个圆盘从 source 移动到 auxiliary
  generateSolution(n - 1, source, auxiliary, target);
  // 将第 n 个圆盘从 source 移动到 target
  steps.value.push({
    disc: n,
    from: source,
    to: target
  });
  // 将 n-1 个圆盘从 auxiliary 移动到 target
  generateSolution(n - 1, auxiliary, target, source);
};

// --- 控制函数 ---

// 重置汉诺塔状态到初始值
const reset = () => {
  isRunning.value = false;
  isCompleted.value = false;
  stepIndex.value = 0;
  steps.value = [];
  movingDisc.value = null; // 清除移动中的圆盘
  animationRunning = false; // 重置动画运行标志

  // 清空所有塔
  towers[0].discs = [];
  towers[1].discs = [];
  towers[2].discs = [];

  // 初始化起始柱 (A) 上的圆盘
  for (let i = discCount.value; i > 0; i--) {
    towers[0].discs.push(i);
  }

  // 重新生成解决方案
  generateSolution(discCount.value, 0, 2, 1); // n, source(0), target(2), auxiliary(1)
};

// 开始/暂停运行
const toggleRun = async () => {
  if (!isRunning.value && stepIndex.value === 0) {
    // 仅在第一次启动时记录历史
    await handleAddHistory(`圆盘数量: ${discCount.value}，移动速度: ${speedLabel.value}`);
  }
  
  isRunning.value = !isRunning.value;

  if (isRunning.value && !isCompleted.value) {
    // 如果动画已经在运行，则不重复启动
    if (animationRunning) return; 
    animationRunning = true; // 设置动画运行标志
    await executeStepAnimation(); // 启动动画执行
    animationRunning = false; // 动画结束，重置标志
  }
};

// --- 动画执行函数 ---

const executeStepAnimation = async () => {
  while (stepIndex.value < steps.value.length && isRunning.value) {
    const step = steps.value[stepIndex.value];
    const discToMove = step.disc;
    const discWidthValue = discSize(discToMove);
    const discHeight = 30; // 圆盘的固定高度

    // 获取DOM元素的位置信息
    // 使用 querySelectorAll 获取所有塔的节点列表，然后通过索引访问
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

    // 计算相对于 .towers-container 的 x 坐标
    const calculateX = (towerRect) => {
        return (towerRect.left + towerRect.width / 2) - (discWidthValue / 2) - towersContainerRect.left;
    };

    // --- 动画阶段 1: 提起圆盘到空中 ---
    // 计算圆盘在源塔顶部的位置 (底部与塔基对齐)
    // 塔基高度 12px + 圆盘堆叠高度
    const initialBottomY = (towers[step.from].discs.length * discHeight) + 12; // discs.length 此时是还没有 pop 之前的
    
    movingDisc.value = {
      value: discToMove,
      width: discWidthValue,
      x: calculateX(sourceTowerRect),
      y: initialBottomY,
    };

    // 提升圆盘到空中高度 (固定高处，例如整个容器的高度 + 额外距离)
    const liftY = towersContainerRect.height + 50; // 比容器顶部再高一点
    
    movingDisc.value.y = liftY; // 改变 Y 坐标实现上升动画
    await sleep(speed.value / 2); // 上升动画速度

    if (!isRunning.value) break; // 检查是否暂停

    // --- 动画阶段 2: 水平移动圆盘到目标塔上方 ---
    movingDisc.value.x = calculateX(targetTowerRect); // 改变 X 坐标实现水平移动
    await sleep(speed.value / 2); // 水平移动动画速度

    if (!isRunning.value) break; // 检查是否暂停

    // --- 动画阶段 3: 放置圆盘到目标塔上 ---
    // 执行数据上的移动：将圆盘从源塔移除，添加到目标塔
    // 假设被移动的圆盘总是塔顶的圆盘，所以可以直接 pop
    const removedDisc = towers[step.from].discs.pop(); 
    towers[step.to].discs.push(removedDisc);

    // 强制 Vue 在下一帧渲染，以便更新 DOM 上目标塔的圆盘数量
    // 这样我们才能计算出正确的最终落点
    await nextTick(); 

    // 计算圆盘在目标塔的最终落点 Y 坐标
    // tips: 此时 towers[step.to].discs.length 应该已经包含了刚刚 push 的圆盘
    const finalBottomY = (towers[step.to].discs.length * discHeight) + 12; 
    movingDisc.value.y = finalBottomY; // 改变 Y 坐标实现下降动画
    await sleep(speed.value / 2); // 下降动画速度

    // --- 动画完成，进入下一轮循环前的清理 ---
    movingDisc.value = null; // 隐藏浮动的圆盘，现在它在塔上被正常渲染
    stepIndex.value++; // 推进步骤
    await sleep(100); // 每步之间的短暂间隔，让人看清

    if (!isRunning.value) break; // 最终检查是否暂停
  }

  // 动画循环结束后处理
  if (stepIndex.value >= steps.value.length) {
    isCompleted.value = true;
    isRunning.value = false; // 动画完成，停止运行
    movingDisc.value = null;
  } else {
    // 动画因用户暂停而中断
    isRunning.value = false; // 确保isRunning状态为false
  }
};

// --- Watchers ---

// 监听圆盘数量变化，自动重置游戏
watch(discCount, () => {
  reset();
});

// 页面加载后立即初始化
reset();
</script>

<style scoped>
/* Scoped CSS 样式 */
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
  padding: 20px; /* 增加整体内边距 */
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  gap: 20px;
}
.left {
  width: 65%; /* 调整宽度分配 */
  height: auto; /* 高度自适应 */
  border-radius: 12px; /* 更圆润的边角 */
  background-color: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); /* 更明显的阴影 */
  padding: 30px; /* 增加内边距 */
  display: flex;
  flex-direction: column;
}
.top {
  display: flex;
  align-items: center;
  margin-bottom: 25px; /* 增加间距 */
  gap: 20px; /* 增加元素间距 */
  flex-wrap: wrap; /* 允许换行 */
}
.disc-input, .speed-control {
  display: flex;
  align-items: center;
  gap: 12px; /* 元素间距 */
  padding: 0 20px;
  border-radius: 10px; /* 更圆润 */
  background: #f8f9fc;
  height: 55px; /* 增加高度 */
  border: 1px solid #e0e6f0; /* 增加边框 */
  flex: 1; /* 弹性伸展 */
  min-width: 250px; /* 最小宽度，防止过小 */
}
.disc-input label, .speed-control label {
  color: #555;
  font-weight: 500;
  white-space: nowrap; /* 不换行 */
}
.disc-input input[type="range"], .speed-control input[type="range"] {
  width: 100%;
  height: 4px; /* 更细的滑轨 */
  background: #d8e1f0; /* 滑轨背景色 */
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
  width: 20px; /* 更大的滑块 */
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
  gap: 15px; /* 按钮间距 */
}
.btn {
  height: 45px; /* 增加按钮高度 */
  padding: 0 25px;
  border-radius: 8px; /* 更圆润 */
  border: none;
  font-weight: 600; /* 更粗的字体 */
  font-size: 16px; /* 字体大小 */
  cursor: pointer;
  transition: all 0.3s ease; /* 更平滑的过渡 */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0px 4px 10px rgba(0,0,0,0.05); /* 按钮阴影 */
}
.btn-start {
  background: linear-gradient(to right, #4a74fb, #3a5cc8);
  color: white;
}
.btn-reset {
  background: #eff4fe; /* 更淡的背景 */
  color: #3b60dc; /* 匹配主色调的文字 */
  border: 1px solid #cdd8ff;
}
.btn:hover {
  transform: translateY(-3px); /* 悬停效果更明显 */
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
  border-left: 5px solid #4a74fb; /* 更粗的左边框 */
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); /* 内阴影 */
}
.visualization {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center; /* 垂直居中塔台 */
  align-items: center; /* 水平居中塔台 */
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(to bottom, #f0f7ff, #e7effa); /* 渐变背景 */
  border: 1px solid #dce8f7;
  padding: 20px;
  position: relative; /* 为 current-disc 定位 */
}
.towers-container {
  display: flex;
  justify-content: space-around;
  align-items: flex-end; /* 塔台底部对齐 */
  width: 100%;
  max-width: 700px; /* 限制塔台区域最大宽度 */
  height: 300px; /* 固定塔台区域高度 */
  position: relative;
  /* border: 1px dashed red; /* Debug 用 */
}
.tower {
  width: 30%; /* 调整塔的宽度 */
  height: 100%; /* 塔柱高度填充容器 */
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.tower-base {
  height: 16px; /* 更厚的塔基 */
  width: 100%; /* 塔基宽度 */
  background: linear-gradient(to right, #8d6e63, #6d4c41);
  border-radius: 8px;
  position: absolute;
  bottom: 0;
  z-index: 0;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
.tower-pillar {
  width: 14px; /* 更粗的塔柱 */
  height: calc(100% - 16px); /* 塔柱高度减去塔基高度 */
  background: linear-gradient(to top, #8d6e63, #6d4c41);
  border-radius: 7px;
  position: absolute;
  bottom: 16px; /* 位于塔基之上 */
  z-index: 0;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.discs-container {
  position: absolute;
  bottom: 16px; /* 根据塔基高度调整 */
  display: flex;
  flex-direction: column-reverse; /* 圆盘从下往上堆叠 */
  align-items: center;
  width: 100%; /* 容器宽度与塔宽一致 */
  z-index: 2;
  /* background: rgba(255,0,0,0.1); /* Debug 用 */
}
.disc {
  height: 30px; /* 固定圆盘高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px; /* 更圆润 */
  margin: 1px 0; /* 更紧密的圆盘堆叠 */
  /* transition: all 0.6s ease; /* 圆盘在塔上不应该有动画 */
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  z-index: 1; /* 确保堆叠顺序 */
  box-shadow: 0 3px 6px rgba(0,0,0,0.15);
  border: 1px solid rgba(255,255,255,0.3); /* 轻微的边框 */
}
.tower-label {
  position: absolute;
  bottom: -35px; /* 标签位置 */
  font-weight: 600;
  font-size: 17px;
  color: #333;
}
.current-disc {
  position: absolute;
  z-index: 100; /* 确保在最上方 */
  transition: all 0.6s ease-in-out; /* 更柔和的动画曲线 */
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 18px;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  box-shadow: 0 6px 15px rgba(0,0,0,0.35); /* 更明显的阴影 */
  border: 2px solid rgba(255,255,255,0.7); /* 白色边框更明显 */
}
.right {
  width: 35%; /* 调整宽度分配 */
  height: auto; /* 高度自适应 */
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
  overflow-y: auto; /* 允许滚动 */
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
  font-size: 26px; /* 标题更大 */
}
.section {
  margin-bottom: 30px;
}
h3 {
  color: #4a74fb;
  margin-bottom: 12px;
  font-size: 20px;
  border-bottom: 2px solid #e8ecfa; /* 更粗的下划线 */
  padding-bottom: 10px;
  font-weight: 600;
}
p {
  color: #555;
  line-height: 1.7; /* 增加行高 */
  margin-bottom: 15px;
  font-size: 15px;
}
ul, ol {
  padding-left: 25px; /* 列表缩进 */
  margin: 15px 0;
}
li {
  color: #555;
  margin-bottom: 8px;
  font-size: 15px;
  line-height: 1.6;
}
.code-block {
  background-color: #282c34; /* 深色代码块背景 */
  border-radius: 8px;
  padding: 20px;
  margin: 1.5rem 0;
  overflow-x: auto;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);
}
code {
  font-family: 'Fira Code', 'Consolas', 'Courier New', monospace; /* 更好的字体 */
  color: #abb2bf; /* 代码颜色 */
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap; /* 允许换行 */
  word-break: break-all; /* 单词内部断行 */
}
</style>

