<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
// 棋盘覆盖相关
const chessN = ref(2)
const chessSize = computed(() => Math.pow(2, chessN.value))
const specialX = ref(0)
const specialY = ref(0)
const chessboardArray = ref<{ color: string, tile?: number, region?: number }[][]>([])
let tileNo = 1
// const colors = [ ... ] // 已不再使用
const regionColors = [
  'rgba(112,161,255,0.18)', // 区域1
  'rgba(123,237,159,0.18)', // 区域2
  'rgba(246,229,141,0.18)', // 区域3
  'rgba(255,190,118,0.18)'  // 区域4
]

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getColor(tile: number) {
  if (tile === 0) return '#fff'
  if (tile === -1) return '#ff4757' // 特殊点
  return '#70a1ff' // 统一淡蓝色
}

function updateBoard(board: number[][], regionMap?: number[][]) {
  chessboardArray.value = board.map((row, y) => row.map((tile, x) => ({
    color: tile === -1 ? '#ff4757' : getColor(tile),
    tile,
    region: regionMap ? regionMap[y][x] : undefined
  })))
}

async function chessboardCover(board: number[][], size: number, top: number, left: number, spX: number, spY: number, depth = 0) {
  if (size === 1) return
  const t = tileNo++
  const s = size >> 1
  // 四个子棋盘的特殊点坐标
  const pos = [
    [top + s - 1, left + s - 1],     // 左上
    [top + s - 1, left + s],         // 右上
    [top + s, left + s - 1],         // 左下
    [top + s, left + s]              // 右下
  ]
  // 找到特殊点在哪个象限
  let quad = 0
  if (spY < top + s && spX < left + s) quad = 0
  else if (spY < top + s && spX >= left + s) quad = 1
  else if (spY >= top + s && spX < left + s) quad = 2
  else quad = 3
  // 在中心放L型骨牌，覆盖除特殊点所在象限外的3个中心点
  for (let i = 0; i < 4; i++) {
    if (i !== quad) {
      const [y, x] = pos[i]
      board[y][x] = t
    }
  }
  // 构造regionMap用于高亮四个子棋盘
  const regionMap = Array.from({ length: board.length }, () => Array(board.length).fill(undefined))
  for (let i = 0; i < 4; i++) {
    const rTop = top + (i >> 1) * s
    const rLeft = left + (i & 1) * s
    for (let yy = rTop; yy < rTop + s; yy++) {
      for (let xx = rLeft; xx < rLeft + s; xx++) {
        regionMap[yy][xx] = i
      }
    }
  }
  updateBoard(board, regionMap)
  await sleep(400)
  updateBoard(board) // 恢复正常
  await sleep(100)
  // 递归4个子棋盘
  await chessboardCover(
    board, s, top, left,
    quad === 0 ? spX : left + s - 1,
    quad === 0 ? spY : top + s - 1,
    depth + 1
  )
  await chessboardCover(
    board, s, top, left + s,
    quad === 1 ? spX : left + s,
    quad === 1 ? spY : top + s - 1,
    depth + 1
  )
  await chessboardCover(
    board, s, top + s, left,
    quad === 2 ? spX : left + s - 1,
    quad === 2 ? spY : top + s,
    depth + 1
  )
  await chessboardCover(
    board, s, top + s, left + s,
    quad === 3 ? spX : left + s,
    quad === 3 ? spY : top + s,
    depth + 1
  )
}

async function startChessboardCover() {
  tileNo = 1
  const size = chessSize.value
  // 初始化棋盘，0为未覆盖，-1为特殊点
  const board = Array.from({ length: size }, () => Array(size).fill(0))
  board[specialY.value][specialX.value] = -1
  updateBoard(board)
  await sleep(500)
  await chessboardCover(board, size, 0, 0, specialX.value, specialY.value)
}

function showInitialBoard() {
  const size = chessSize.value
  const board = Array.from({ length: size }, () => Array(size).fill(0))
  board[specialY.value][specialX.value] = -1
  updateBoard(board)
}

watch([chessN, specialX, specialY], showInitialBoard)

onMounted(() => {
  showInitialBoard()
  startChessboardCover()
})
</script>

<template>
  <div class="chess">
    <div class="left">
      <!-- 棋盘覆盖输入区域 -->
      <div class="chessboard-input">
        <a-form layout="inline">
          <a-form-item label="棋盘n (2^n)">
            <a-input-number v-model:value="chessN" :min="1" :max="6" />
          </a-form-item>
          <a-form-item label="特殊点x">
            <a-input-number v-model:value="specialX" :min="0" :max="chessSize - 1" />
          </a-form-item>
          <a-form-item label="特殊点y">
            <a-input-number v-model:value="specialY" :min="0" :max="chessSize - 1" />
          </a-form-item>
          <a-button type="primary" @click="startChessboardCover">开始演示</a-button>
        </a-form>
      </div>
      <!-- 棋盘覆盖可视化区域 -->
      <div class="chessboard-visual">
        <div v-if="chessboardArray.length" class="chessboard-grid"
          :style="{ gridTemplateColumns: `repeat(${chessSize}, 40px)` }">
          <div v-for="(cell, idx) in chessboardArray.flat()" :key="idx" class="chess-cell"
            :style="{ background: cell.region !== undefined ? regionColors[cell.region] : cell.color, borderColor: cell.region !== undefined ? regionColors[cell.region].replace('0.18', '0.7') : '#ccc' }">
          </div>
        </div>
      </div>
    </div>
    <div class="right">
      <div class="content">
        <h2>棋盘覆盖问题</h2>
        <div class="section">
          <p>
            棋盘覆盖是一个经典的分治算法问题。给定一个 2^k × 2^k 个方格的棋盘，其中有一个方格已被填充，要求用 L 型骨牌覆盖所有其他方格，每个骨牌恰好覆盖三个方格。
          </p>
        </div>
        <div class="section">
          <h3>算法原理</h3>
          <p>
            将棋盘分成四个相等的子棋盘，递归地解决子问题。对于每个子棋盘，如果特殊方格在该子棋盘中，递归处理；否则，在子棋盘相邻的角上放置一个 L 型骨牌，使得其中一个方格位于该子棋盘中，然后递归处理。
          </p>
        </div>

        <div class="section">
          <h3>代码实现</h3>
          <pre class="code-block">
            <code>{{ `
function chessboardCover(board, size, sRow, sCol, spRow, spCol) {
  if (size === 1) return;

  let tileNo = 0;
  let halfSize = size / 2;

  // 确定特殊方格在哪个子棋盘
  let subBoard = 0;
  if (spRow < sRow + halfSize && spCol < sCol + halfSize)
    subBoard = 0;
  else if (spRow < sRow + halfSize && spCol >= sCol + halfSize)
    subBoard = 1;
  else if (spRow >= sRow + halfSize && spCol < sCol + halfSize)
    subBoard = 2;
  else
    subBoard = 3;

  // 递归处理四个子棋盘
  chessboardCover(board, halfSize, sRow, sCol,
    subBoard === 0 ? spRow : sRow + halfSize - 1,
    subBoard === 0 ? spCol : sCol + halfSize - 1);

  // ... 其余子棋盘的递归处理
}
            ` }}</code>
          </pre>
        </div>
        <div class="section">
          <h3>复杂度分析</h3>
          <ul>
            <li>时间复杂度：O(4^k)，其中 k = log₂n</li>
            <li>空间复杂度：O(4^k)</li>
            <li>算法类型：分治算法</li>
          </ul>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.chess {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-self: center;
}

.left {
  width: 60%;
  height: 100%;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.right {
  width: 34%;
  height: 100%;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  padding: 10px;
  overflow-y: auto;
}

.content {
  padding: 10px;
}

h2 {
  color: black;
  margin-bottom: 20px;
  text-align: center;
  font-weight: bold;
}

.section {
  margin-bottom: 20px;
}

h3 {
  color: black;
  margin-bottom: 10px;
}

p {
  color: #555;
  line-height: 1.6;
}

.code-block {
  background-color: #282c34;
  border-radius: 6px;
  padding-left: 1rem;
  padding-right: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
  height: 350px;
}

code {
  font-family: 'Fira Code', 'Consolas', monospace;
  color: #abb2bf;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre;
}

ul {
  list-style-type: disc;
  padding-left: 20px;
}

li {
  color: #555;
  margin-bottom: 5px;
}

.chessboard-input {
  margin-bottom: 16px;
}

.chessboard-visual {
  margin-bottom: 24px;
}

.chessboard-grid {
  display: grid;
  gap: 4px;
}

.chess-cell {
  width: 40px;
  height: 40px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  transition: background 0.3s;
}
</style>
