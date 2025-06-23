<template>
  <div class="hanotas">
 <div class="left">
  <div class="top">
    <div class="disc-input">
      <label>节点权值（逗号分隔）：</label>
      <input v-model="inputWeights" :disabled="isRunning" style="width:120px;" />
      <button class="btn btn-start" @click="buildHuffmanTree" :disabled="isRunning">生成哈夫曼树</button>
    </div>
  </div>
  <div class="progress-info">
    <div v-if="tree">哈夫曼树已生成，带权路径长度：{{ wpl }}</div>
    <div v-else>请输入权值并生成哈夫曼树</div>
  </div>
  <div class="visualization" style="overflow:auto;">
    <svg v-if="tree" :width="svgWidth" :height="svgHeight">
      <g v-for="(node, idx) in nodesWithPos" :key="idx">
        <line v-if="node.parent" 
              :x1="node.parent.x" :y1="node.parent.y+20" 
              :x2="node.x" :y2="node.y-20" 
              stroke="#aaa" />
        <circle :cx="node.x" :cy="node.y" r="20" fill="#4a74fb" />
        <text :x="node.x" :y="node.y+5" text-anchor="middle" fill="#fff" font-size="16">
          {{ node.weight }}
        </text>
        <text v-if="node.char" :x="node.x" :y="node.y+30" text-anchor="middle" fill="#333" font-size="14">
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
      <h3>代码实现</h3>
      <pre class="code-block">
        <code>
function huffman(weights) {
  // weights: [{char: 'A', weight: 5}, ...]
  const nodes = weights.map(w => ({ ...w, left: null, right: null }));
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.weight - b.weight);
    const left = nodes.shift();
    const right = nodes.shift();
    const parent = {
      char: null,
      weight: left.weight + right.weight,
      left,
      right
    };
    nodes.push(parent);
  }
  return nodes[0]; // 返回哈夫曼树根节点
}
        </code>
      </pre>
    </div>
    <div class="section">
      <h3>复杂度分析</h3>
      <ul>
        <li>时间复杂度：O(n²)（简单实现，若用优先队列可降为 O(n log n)）</li>
        <li>空间复杂度：O(n)</li>
        <li>哈夫曼编码长度最优，整体编码长度最小</li>
      </ul>
      <p>哈夫曼树广泛应用于文件压缩、通信编码等领域，是贪心算法的经典应用。</p>
    </div>
  </div>
</div>
  </div>
</template>

<script setup>
import { ref, computed ,onMounted} from 'vue';

const inputWeights = ref('5,9,12,13,16,45');
const isRunning = ref(false);
const tree = ref(null);
const nodesWithPos = ref([]);
const svgWidth = 600;
const svgHeight = 600;
const wpl = ref(0);

function buildHuffmanTree() {
  const arr = inputWeights.value.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
  if (arr.length < 2) {
    alert('请输入至少两个权值');
    return;
  }
  // 构建哈夫曼树
  let nodes = arr.map((w, i) => ({ weight: w, char: String.fromCharCode(65 + i), left: null, right: null }));
  let allNodes = [...nodes];
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.weight - b.weight);
    const left = nodes.shift();
    const right = nodes.shift();
    const parent = {
      weight: left.weight + right.weight,
      left,
      right,
      char: null
    };
    nodes.push(parent);
    allNodes.push(parent);
  }
  tree.value = nodes[0];

  // 计算带权路径长度
  wpl.value = 0;
  function calcWPL(node, depth) {
    if (!node.left && !node.right) {
      wpl.value += node.weight * depth;
      return;
    }
    if (node.left) calcWPL(node.left, depth + 1);
    if (node.right) calcWPL(node.right, depth + 1);
  }
  calcWPL(tree.value, 0);

  // 计算每个节点的坐标（简单递归布局）
  nodesWithPos.value = [];
  let maxDepth = 0;
  function layout(node, depth, x, dx, parent = null) {
    if (!node) return;
    maxDepth = Math.max(maxDepth, depth);
    node.x = x;
    node.y = 60 + depth * 60;
    node.parent = parent;
    nodesWithPos.value.push(node);
    if (node.left) layout(node.left, depth + 1, x - dx, dx / 2, node);
    if (node.right) layout(node.right, depth + 1, x + dx, dx / 2, node);
  }
  layout(tree.value, 0, svgWidth / 2, svgWidth / 4, null);
}
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