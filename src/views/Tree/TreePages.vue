<template>
  <div class="hanotas">
    <div class="left">
      <div class="top">
        <div class="disc-input">
          <label>节点权值（逗号分隔，如 A:5,B:9）：</label>
          <input v-model="inputWeights" :disabled="isRunning" style="width:240px;" />
          <button class="btn btn-start" @click="buildHuffmanTree" :disabled="isRunning">生成哈夫曼树</button>
        </div>
      </div>
      <div class="progress-info">
        <div v-if="tree">哈夫曼树已生成，带权路径长度(WPL)：{{ wpl }}</div>
        <div v-else>请输入权值并生成哈夫曼树</div>
      </div>
      <div class="visualization" style="overflow:auto;">
        <button class="btn btn-start" @click="playBuildAnimation" :disabled="isAnimating || buildSteps.length===0">
  动画演示构建过程
</button>
        <svg v-if="nodesWithPos.length" :width="svgWidth" :height="getTreeHeight">
          <g v-for="(node, idx) in nodesWithPos" :key="idx">
            <!-- Connect parent to child -->
            <line v-if="node.parent" 
                  :x1="node.parent.x" :y1="node.parent.y + 20" 
                  :x2="node.x" :y2="node.y - 20" 
                  stroke="#aaa" />
            <circle :cx="node.x" :cy="node.y" r="20" fill="#4a74fb" />
            <text :x="node.x" :y="node.y + 5" text-anchor="middle" fill="#fff" font-size="16">
              {{ node.weight }}
            </text>
            <text v-if="node.char" :x="node.x" :y="node.y + 30" text-anchor="middle" fill="#333" font-size="14">
              {{ node.char }}
            </text>
          </g>
        </svg>
      </div>
    </div>
    <div class="right">
      <div class="content">
        <h2>哈夫曼树算法</h2>
        <div class="section">
          <h3>算法原理</h3>
          <p>哈夫曼树（Huffman Tree）是一种最优二叉树，常用于数据压缩。其核心思想是：将出现概率高的字符用较短的编码，出现概率低的字符用较长的编码，从而整体编码长度最小。</p>
          <ul>
            <li>每个叶子节点对应一个待编码的字符及其权值（出现频率）</li>
            <li>非叶子节点的权值等于其左右子节点权值之和</li>
            <li>哈夫曼树的带权路径长度（WPL）最小</li>
          </ul>
          <p>构造哈夫曼树的步骤：</p>
          <ol>
            <li>将每个字符看作一个独立的节点，权值为其频率</li>
            <li>从所有节点中选出权值最小的两个节点，合并为一个新节点</li>
            <li>新节点的权值为两个子节点权值之和</li>
            <li>将新节点加入集合，重复步骤2-3，直到只剩一个根节点</li>
          </ol>
        </div>
        
        <div class="section">
          <h3>构建过程</h3>
          <div v-if="buildSteps.length > 0">
            <div v-for="(step, index) in buildSteps" :key="index" class="build-step">
              <h4>步骤 {{ index + 1 }}</h4>
              <p>{{ step.description }}</p>
              <p v-if="step.remainingNodes">当前剩余节点权值: {{ step.remainingNodes.map(n => n.char ? `${n.char}:${n.weight}` : n.weight).join(', ') }}</p>
            </div>
          </div>
          <div v-else>
            点击 "生成哈夫曼树" 按钮查看构建过程。
          </div>
        </div>

        <div class="section">
          <h3>代码实现</h3>
          <pre class="code-block">
            <code>
function huffman(initialNodes) {
  // initialNodes: [{char: 'A', weight: 5}, ...]
  const nodes = initialNodes.map(w => ({ ...w, left: null, right: null }));
  const buildSteps = []; // 用于记录构建过程

  while (nodes.length > 1) {
    // 排序
    nodes.sort((a, b) => a.weight - b.weight);

    // 选取最小的两个
    const left = nodes.shift();
    const right = nodes.shift();

    // 创建新父节点
    const parent = {
      weight: left.weight + right.weight,
      left,
      right,
      char: null // 内部节点没有字符，除非是特殊情况
    };

    // 记录步骤
    buildSteps.push({
      description: `合并节点 ${left.char ? left.char + ':' : ''}${left.weight} 和 ${right.char ? right.char + ':' : ''}${right.weight}，生成新节点权值 ${parent.weight}`,
      remainingNodes: nodes.map(n => ({ char: n.char, weight: n.weight })) // 记录当前剩余节点
    });

    // 将新节点加回集合
    nodes.push(parent);
  }
  return { root: nodes[0], steps: buildSteps }; // 返回根节点和步骤
}
            </code>
          </pre>
        </div>
        <div class="section">
          <h3>复杂度分析</h3>
          <ul>
            <li>时间复杂度：O(n²)（若用优先队列，O(n log n)）</li>
            <li>空间复杂度：O(n)</li>
            <li>哈夫曼编码长度最优，整体编码长度最小</li>
          </ul>
          <p>哈夫曼树广泛应用于文件压缩、通信编码等领域，是贪心算法的经典应用。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup >
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue'; // 假设你安装了 antd-vue 或其他UI库用于消息提示
// import { useUserStore } from '@/store/index'; // 假设这些是用户相关的 store 和 API
// import { getHistoryAPI, addHistoryAPI } from '@/api/history/history';

const inputWeights = ref('A:5,B:9,C:12,D:13,E:16,F:45'); // 初始值改为字符:权值格式
const isRunning = ref(false);
const tree = ref(null);
const nodesWithPos = ref([]); // 用于SVG渲染的带位置信息节点
const svgWidth = 600;
const svgHeight = ref(400); // 动态调整SVG高度
const wpl = ref(0);
const buildSteps = ref([]); // 新增：存储哈夫曼树构建的每一步

// 假设 userStore 和 token 相关的代码
// const userStore = useUserStore();
// const token = userStore.token;
// const type = 2; // History type

// const handleAddHistory = async (details) => {
//   try {
//     const res = await addHistoryAPI(details, type, token);
//     console.log('新增历史记录成功:', res);
//   } catch (e) {
//     console.error('新增历史记录失败:', e);
//     message.error('新增历史记录失败');
//   }
// };

// 计算SVG高度
const getTreeHeight = computed(() => {
  if (nodesWithPos.value.length === 0) return 400;
  let maxDepth = 0;
  for (const node of nodesWithPos.value) {
    const depth = Math.floor((node.y - 60) / 60); // 转换为深度
    maxDepth = Math.max(maxDepth, depth);
  }
  return Math.max(400, (maxDepth + 1) * 70); // 节点高度20*2 + 间距 + 下方字符20 = ~60-70px per depth
});


// 核心函数：构建哈夫曼树并记录步骤
function huffmanAlgorithm(initialNodes) {
  const nodes = initialNodes.map(node => ({ ...node, left: null, right: null, id: Math.random().toString(36).substring(2, 9) }));
  const steps = [];
  let internalNodeCount = 0;

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.weight - b.weight);
    const left = nodes.shift();
    const right = nodes.shift();
    const parent = {
      weight: left.weight + right.weight,
      left,
      right,
      char: null,
      id: `internal_${internalNodeCount++}`
    };
    steps.push({
      description: `合并节点 ${left.char ? left.char + ':' : ''}${left.weight} 和 ${right.char ? right.char + ':' : ''}${right.weight}，生成新节点权值 ${parent.weight}`,
      remainingNodes: nodes.map(n => ({ char: n.char, weight: n.weight, id: n.id })),
      tree: JSON.parse(JSON.stringify(parent)) // 保存当前树快照
    });
    nodes.push(parent);
  }
  return { root: nodes[0], steps };
}

// 计算每个节点的位置用于SVG渲染
// 计算每个节点的位置用于SVG渲染
function layoutTreeNodes(treeRoot) {
  nodesWithPos.value = [];
  
  if (!treeRoot) return;

  // 使用一个Map来存储每个节点的唯一ID到其对应的SVG渲染对象的映射
  const nodeMap = new Map();

  // 定义层级和水平间距参数
  const nodeHeight = 60; // 每层节点垂直间距
  let maxDepth = 0;

  // 使用一个数组来存储所有节点，方便后续扁平化处理
  const allNodes = [];
  let currentXSerial = 0; // 用于给叶子节点分配一个唯一的X序列号

  // 第一遍DFS：计算每个节点的深度和_initialX
  // 注意：这里需要确保所有节点都被访问到，并填充_initialX
  function dfsAssignInitialX(node, depth) {
    if (!node) return;

    maxDepth = Math.max(maxDepth, depth);

    // 递归访问左右子节点
    if (node.left) {
      dfsAssignInitialX(node.left, depth + 1);
    }
    if (node.right) {
      dfsAssignInitialX(node.right, depth + 1);
    }

    // 后序遍历：在子节点处理完后，再处理当前节点
    if (!node.left && !node.right) { // 叶子节点
      node._initialX = currentXSerial++;
    } else {
      // 内部节点的X坐标是其左右子节点X坐标的平均值
      // 确保子节点存在且_initialX已计算
      let leftX = node.left ? node.left._initialX : currentXSerial; // 实际场景中如果左子节点不存在，可能是树结构问题
      let rightX = node.right ? node.right._initialX : currentXSerial; // 同上

      // 考虑只有一个子节点的情况：
      if (node.left && !node.right) { // 只有左子节点
          node._initialX = node.left._initialX;
      } else if (!node.left && node.right) { // 只有右子节点
          node._initialX = node.right._initialX;
      } else { // 左右子节点都存在
          node._initialX = (node.left._initialX + node.right._initialX) / 2;
      }
    }
    allNodes.push(node); // 将处理后的节点添加到扁平数组
  }

  // 从根节点开始第一次DFS，计算所有节点的_initialX
  dfsAssignInitialX(treeRoot, 0);

  // 检查是否所有节点都有 _initialX，以及 allNodes 是否为空
  if (allNodes.length === 0) {
      console.warn("No nodes processed for layout.");
      return;
  }

  // 找到最小和最大的 _initialX
  // 必须确保 allNodes 中的每个元素都有 _initialX 且是数字
  const validInitialXs = allNodes.filter(n => typeof n._initialX === 'number' && !isNaN(n._initialX));

  if (validInitialXs.length === 0) {
      // 如果没有有效的 _initialX，说明所有节点都是无效的，或者只有根节点且没有子节点
      // 这可能发生在只有一个节点或者输入数据导致树结构异常的情况下
      // 为这种情况设置一个默认行为，例如将唯一的节点放置在中心
      if (treeRoot && typeof treeRoot._initialX === 'number' && !isNaN(treeRoot._initialX)) {
          validInitialXs.push(treeRoot); // 如果只有一个有效根节点，作为唯一有效X
      } else {
          console.warn("No valid _initialX found for any node. Cannot layout tree.");
          return; // 无法布局，直接返回
      }
  }

  const minInitialX = Math.min(...validInitialXs.map(n => n._initialX));
  const maxInitialX = Math.max(...validInitialXs.map(n => n._initialX));

  const xRange = maxInitialX - minInitialX;
  const normalizedXRange = xRange === 0 ? 1 : xRange; // 避免除以零

  const padding = 50; // 边缘留白
  const effectiveWidth = svgWidth - 2 * padding;

  // 第二遍DFS：生成用于SVG渲染的节点数据 (nodesWithPos)
  // 这一次是为了收集所有必要的信息，并在填充 x 坐标时使用全局的 minInitialX 和 maxInitialX
  function dfsPopulateSvgNodes(node, depth, parentSvgNode = null) {
      if (!node) return;

      const svgNode = {
          id: node.id,
          weight: node.weight,
          char: node.char,
          // 根据之前计算的_initialX映射到SVG宽度
          x: padding + (node._initialX - minInitialX) / normalizedXRange * effectiveWidth,
          y: 60 + depth * nodeHeight,
          parent: parentSvgNode // 指向父节点的SVG渲染对象，以便连线
      };

      nodeMap.set(node.id, svgNode); // 存储映射，方便子节点查找父节点

      nodesWithPos.value.push(svgNode);

      // 递归处理子节点
      dfsPopulateSvgNodes(node.left, depth + 1, svgNode);
      dfsPopulateSvgNodes(node.right, depth + 1, svgNode);
  }

  // 从根节点开始第二次DFS，填充 nodesWithPos
  dfsPopulateSvgNodes(treeRoot, 0);

  // 根据最大深度调整SVG高度
  // 重新计算maxDepth，因为dfsAssignInitialX中maxDepth是基于原始节点数组更新的
  // 确保所有节点都已在nodesWithPos中，才能正确计算其在SVG上的y坐标
  let currentMaxDepth = 0;
  if(nodesWithPos.value.length > 0) {
      currentMaxDepth = Math.max(...nodesWithPos.value.map(n => Math.floor((n.y - 60) / nodeHeight)));
  }
  svgHeight.value = Math.max(400, (currentMaxDepth + 1) * nodeHeight + padding); // 加上padding作为底部留白
}
const currentStepIndex = ref(0)
const isAnimating = ref(false)
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function playBuildAnimation() {
  if (isAnimating.value || buildSteps.value.length === 0) return;
  isAnimating.value = true;
  for (let i = 0; i < buildSteps.value.length; i++) {
    currentStepIndex.value = i;
    // 重新布局当前步骤的树
    const stepTree = getStepTree(i);
    layoutTreeNodes(stepTree);
    await sleep(900); // 每步间隔
  }
  isAnimating.value = false;
}

// 获取当前步骤的树结构
function getStepTree(stepIdx) {
  // 你可以在 huffmanAlgorithm 里为每步保存一份树的快照
  // 这里假设 buildSteps.value[stepIdx].tree 是该步的树
  // 如果没有保存快照，可以考虑每步都深拷贝一份树结构
  // 这里只做演示，实际需配合你的 huffmanAlgorithm 返回每步树
  return buildSteps.value[stepIdx].tree || tree.value;
}
// 主函数：构建哈夫曼树并更新界面
function buildHuffmanTree() {
  isRunning.value = true;
  tree.value = null;
  nodesWithPos.value = [];
  wpl.value = 0;
  buildSteps.value = []; // 重置构建步骤

  const parsedWeights = [];
  const parts = inputWeights.value.split(',');
  for (const part of parts) {
    const pair = part.split(':').map(s => s.trim());
    if (pair.length === 2) {
      const char = pair[0];
      const weight = Number(pair[1]);
      if (!isNaN(weight) && weight > 0) {
        parsedWeights.push({ char, weight });
      } else {
        message.error(`无效的权值: ${pair[1]}，请检查输入格式 (如 A:5)`);
        isRunning.value = false;
        return;
      }
    } else {
      message.error(`无效的格式: ${part}，请使用 字符:权值 格式 (如 A:5)`);
      isRunning.value = false;
      return;
    }
  }

  if (parsedWeights.length < 2) {
    message.error('请输入至少两个字符及其权值');
    isRunning.value = false;
    return;
  }

  // 对输入数据进行排序，确保构建过程的一致性
  parsedWeights.sort((a, b) => a.weight - b.weight || a.char.localeCompare(b.char));

  const { root, steps } = huffmanAlgorithm(parsedWeights);
  tree.value = root;
  buildSteps.value = steps; // 更新构建步骤

  // 计算带权路径长度 (WPL)
  let calculatedWPL = 0;
  function calculateWPL(node, depth) {
    if (!node) return;
    if (!node.left && !node.right) { // 叶子节点
      calculatedWPL += node.weight * depth;
      return;
    }
    calculateWPL(node.left, depth + 1);
    calculateWPL(node.right, depth + 1);
  }
  calculateWPL(tree.value, 0);
  wpl.value = calculatedWPL;

  // 布局树节点用于SVG渲染
  layoutTreeNodes(tree.value);

  // const details = `权值: ${inputWeights.value}, WPL: ${wpl.value}`;
  // handleAddHistory(details); // 记录历史操作

  isRunning.value = false;
}

// 页面加载时自动构建一次
onMounted(() => {
  buildHuffmanTree();
});
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
  height: 90vh; 
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
.disc-input label {
  white-space: nowrap; 
}
.disc-input input, .speed-control input {
  flex: 1; 
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
  border-left: 4px solid #A8E1E8;
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
  overflow-y: auto; 
}
.right {
  width: 34%;
  height: 100%;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  overflow-y: auto;
  scrollbar-width: thin; 
  scrollbar-color: #A8E1E8 #f0f4ff; 
}
.right::-webkit-scrollbar {
  width: 8px; 
}
.right::-webkit-scrollbar-track {
  background: #f0f4ff; 
  border-radius: 4px;
}
.right::-webkit-scrollbar-thumb {
  background-color: #A8E1E8; 
  border-radius: 4px;
  border: 2px solid #f0f4ff; 
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

.build-step {
  background: #f8f9fc;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #4CAF50;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.build-step h4 {
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 16px;
}
.build-step p {
  font-size: 14px;
  line-height: 1.5;
  color: #666;
  margin-bottom: 5px; 
}
.visualization::-webkit-scrollbar,
.right::-webkit-scrollbar {
  width: 0 !important;
  background: transparent;
}
.visualization,
.right {
  scrollbar-width: none; 
}
</style>
