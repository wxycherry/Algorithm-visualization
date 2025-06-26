<script setup lang="ts">
import { ref, onMounted, onUnmounted ,watch} from 'vue'
import { h } from 'vue'
import { CaretRightOutlined, UndoOutlined } from '@ant-design/icons-vue'
import * as echarts from 'echarts'
import { message } from 'ant-design-vue'
import axios from 'axios'

const showHistory = ref(false)
const historyList = ref<string[]>([])
import { useUserStore } from '@/store/index'
import { getHistoryAPI, addHistoryAPI } from '@/api/history/history'



// type 你可以根据页面实际情况传递，比如冒泡排序传 1
const type = 1

const handleAddHistory = async (details: string) => {
  try {
    const res = await addHistoryAPI(details, type, token)
   
  } catch (e) {
 console.log('新增历史记录失败:', e)
    message.error('新增历史记录失败')
  }
}
const userStore = useUserStore()
const token = userStore.token 
// 打开弹窗时获取历史记录
watch(showHistory, async (val) => {
  if (val) {
    try {
      const res = await getHistoryAPI(token)
      console.log('token1111',token)
      console.log('获取历史记录:', res.data)
      historyList.value = res.data.data
    } catch (e) {
      message.error('获取历史记录失败')
      historyList.value = []
    }
  }
})
const reset = () => {
  inputNumbers.value = '64, 34, 25, 12, 22, 11, 90'
  // 重置后自动开始新的排序演示
  setTimeout(() => {
    startSort()
  }, 100)
}

const inputNumbers = ref('64, 34, 25, 12, 22, 11, 90')
const chartContainer = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null
let sortingSteps: Array<{ data: number[]; comparison?: { i: number; j: number } }> = []
let currentStep = 0
let sortingInterval: ReturnType<typeof setInterval> | null = null
const isSorting = ref(false)
const progressText = ref('')
const isInitializing = ref(true)

// 初始化图表
const initChart = (data: number[]) => {
  if (!chartContainer.value) return

  chart = echarts.init(chartContainer.value)
  updateChartWithColors(data)
}

// 计算当前已排序的元素数量
const getSortedCount = () => {
  let sortedCount = 0
  // 遍历到当前步骤，计算有多少个没有比较状态的步骤
  for (let i = 0; i < currentStep && i < sortingSteps.length; i++) {
    if (!sortingSteps[i].comparison) {
      sortedCount++
    }
  }
  // 减去初始状态（第一个步骤没有比较状态，但不代表排序完成）
  return Math.max(0, sortedCount - 1)
}

// 更新图表数据并设置颜色
const updateChartWithColors = (data: number[], comparison?: { i: number; j: number }) => {
  if (!chart) return

  const sortedCount = getSortedCount()

  const colors = data.map((_, index) => {
    if (comparison) {
      // 当前正在比较的两个元素
      if (index === comparison.i || index === comparison.j) {
        return '#ff4757' // 红色 - 正在比较的元素
      }
      // 已经排序完成的部分（从右往左）
      // 每完成一轮，最右边的元素就排序完成
      if (index >= data.length - sortedCount && sortedCount > 0) {
        return '#2ed573' // 绿色 - 已排序
      }
    }
    // 默认颜色 - 未排序的部分
    return '#3742fa' // 蓝色 - 未排序
  })

  chart.setOption({
    title: {
      text: '冒泡排序可视化',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: function (params: { dataIndex: number; value: number }[]) {
        const dataIndex = params[0].dataIndex
        const value = params[0].value
        let status = ''
        if (comparison) {
          if (dataIndex === comparison.i || dataIndex === comparison.j) {
            status = ' (正在比较)'
          } else {
            if (dataIndex >= data.length - sortedCount && sortedCount > 0) {
              status = ' (已排序)'
            } else {
              status = ' (未排序)'
            }
          }
        } else {
          status = ' (未排序)'
        }
        return `索引 ${dataIndex + 1}: ${value}${status}`
      }
    },
    xAxis: {
      type: 'category',
      data: data.map((_, index) => `${index + 1}`),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        type: 'bar',
        data: data,
        itemStyle: {
          color: function (params: { dataIndex: number }) {
            return colors[params.dataIndex]
          },
        },
        animation: true,
        animationDuration: 500,
        animationEasing: 'cubicOut'
      },
    ],
  })
}

// 生成排序步骤
const generateSortingSteps = (arr: number[]) => {
  const steps: Array<{ data: number[]; comparison?: { i: number; j: number } }> = [
    { data: arr.slice() } // 初始状态，没有比较
  ]
  const len = arr.length

  for (let i = 0; i < len - 1; i++) {
    for (let j = 0; j < len - 1 - i; j++) {
      // 添加比较步骤
      steps.push({
        data: arr.slice(),
        comparison: { i: j, j: j + 1 }
      })

      if (arr[j] > arr[j + 1]) {
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        // 添加交换后的步骤
        steps.push({
          data: arr.slice(),
          comparison: { i: j, j: j + 1 }
        })
      }
    }
    // 每轮结束后，添加一个没有比较状态的步骤，显示已排序的部分
    // 注意：第一轮结束后，最右边的元素已经排序完成
    steps.push({
      data: arr.slice()
    })
  }

  return steps
}

// 开始排序动画
const startSort = () => {
  if (sortingInterval) {
    clearInterval(sortingInterval)
  }

  const numbers = inputNumbers.value
    .split(',')
    .map((num) => parseInt(num.trim()))
    .filter((num) => !isNaN(num))

  if (numbers.length < 2) {
    alert('请至少输入两个有效的数字！')
    return
  }

  sortingSteps = generateSortingSteps(numbers.slice())
  currentStep = 0
  isSorting.value = true
  progressText.value = '准备开始排序...'

  initChart(sortingSteps[0].data)

  sortingInterval = setInterval(() => {
    currentStep++
    if (currentStep >= sortingSteps.length) {
      if (sortingInterval) clearInterval(sortingInterval)
      // 最终状态，移除所有颜色标记
      updateChartWithColors(sortingSteps[sortingSteps.length - 1].data)
      isSorting.value = false
      progressText.value = '排序完成！'
      return
    }
    const step = sortingSteps[currentStep]
    updateChartWithColors(step.data, step.comparison)

    // 更新进度文本
    if (step.comparison) {
      const { i, j } = step.comparison
      const val1 = step.data[i]
      const val2 = step.data[j]
      if (val1 > val2) {
        progressText.value = `比较 ${val1} 和 ${val2}，${val1} > ${val2}，交换位置`
      } else {
        progressText.value = `比较 ${val1} 和 ${val2}，${val1} ≤ ${val2}，保持位置`
      }
    } else {
      // 计算当前轮数
      const sortedCount = getSortedCount()
      if (sortedCount > 0 && sortedCount < numbers.length - 1) {
        progressText.value = `第 ${sortedCount} 轮排序完成，${sortedCount} 个元素已排序`
      } else if (currentStep === 0) {
        progressText.value = '准备开始排序...'
      } else if (sortedCount === 0) {
        progressText.value = '开始第一轮排序...'
      }
    }
  }, 1000) // 增加到1秒，更容易观察
}

// 处理输入框回车事件
const handleInputEnter = () => {
    handleAddHistory(inputNumbers.value)
  startSort()
}

// 组件挂载时初始化
onMounted(() => {
  console.log(inputNumbers.value)
  window.addEventListener('resize', () => chart?.resize())

  // 页面加载后自动开始排序演示
  setTimeout(() => {
    isInitializing.value = false
    startSort()
  }, 500) // 延迟500ms确保组件完全渲染
})

// 组件卸载时清理
onUnmounted(() => {
  if (sortingInterval) clearInterval(sortingInterval)
  chart?.dispose()
  window.removeEventListener('resize', () => chart?.resize())
})
</script>

<template>
  <div class="bubbles">
    <div class="left">
      <div class="top">
        <a-space direction="vertical" style="width: 40%; margin-right: 20px">
          <a-input v-model:value="inputNumbers" placeholder="请输入一组您想要排序的数，用逗号分隔" style="height: 40px"
            @keyup.enter="handleInputEnter" />
        </a-space>
        <a-button type="primary" :icon="h(CaretRightOutlined)" style="height: 40px; margin-right: 20px"
          @click="handleInputEnter">开始演示</a-button>
        <a-button :icon="h(UndoOutlined)" style="height: 40px" @click="reset">重置</a-button>
      </div>
      <!-- 在 .top 区域按钮组后面添加 -->
<a-button style="height: 40px; margin-left: 10px" @click="showHistory = true">历史记录</a-button>
<a-modal v-model:open="showHistory" title="历史记录" width="400px" :footer="null">
  <a-list :data-source="historyList" bordered>
    <template #renderItem="{ item }">
      <a-list-item>
        <div>
          <div><strong>内容：</strong>{{ item.details }}</div>
          <div style="font-size:12px;color:#888;"><strong>时间：</strong>{{ item.createTime }}</div>
        </div>
      </a-list-item>
    </template>
  </a-list>
</a-modal>
      <div class="progress-info" v-if="isSorting || progressText || isInitializing">
        <a-alert :message="isInitializing ? '正在初始化排序演示...' : progressText" :type="isInitializing ? 'warning' : 'info'"
          show-icon :closable="false" style="margin-bottom: 10px;" />
      </div>
      <div class="bottom">
        <div class="chart-container" ref="chartContainer"></div>
      </div>
    </div>
    <div class="right">
      <div class="content">
        <h2>冒泡排序算法</h2>
        <!-- <div class="section">
          <p>
            冒泡排序是一种简单的排序算法。它重复地遍历要排序的序列，依次比较两个元素，如果他们的顺序错误就把他们交换过来。
          </p>
        </div> -->
        <div class="section">
          <h3>算法原理</h3>
          <p>
            比较相邻的元素。如果第一个比第二个大，就交换他们两个。对每一对相邻元素作同样的工作，从开始一对到结尾的最后一对，这样做完后，最后的元素会是最大的数。
          </p>
        </div>
        <div class="section">
          <h3>可视化说明</h3>
          <ul>
            <li><span style="color: #ff4757; font-weight: bold;">🔴 红色</span> - 正在比较的两个元素</li>
            <li><span style="color: #2ed573; font-weight: bold;">🟢 绿色</span> - 已经排序完成的部分</li>
            <li><span style="color: #3742fa; font-weight: bold;">🔵 蓝色</span> - 还未排序的部分</li>
          </ul>
          <p style="font-size: 14px; color: #666; margin-top: 10px;">
            <strong>排序过程：</strong>从右往左逐渐完成排序，每次比较相邻的两个元素，较大的元素会"冒泡"到右边。
          </p>
        </div>
        <div class="section">
          <h3>代码实现</h3>
          <pre class="code-block">
            <code>{{ `
function bubbleSort(arr) {
    let len = arr.length;
    for (let i = 0; i < len - 1; i++) {
        for (let j = 0; j < len - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}
            ` }}</code>
          </pre>
        </div>
        <div class="section">
          <h3>复杂度分析</h3>
          <ul>
            <li>时间复杂度：O(n²)</li>
            <li>空间复杂度：O(1)</li>
            <li>稳定性：稳定</li>
          </ul>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.bubbles {
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
}

.top {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.progress-info {
  margin-bottom: 15px;
}

.bottom {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chart-container {
  flex: 1;
  min-height: 400px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 20px;
}

.right {
  width: 34%;
  height: 100%;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  padding: 10px;
  overflow-y: auto;
  scrollbar-width: none; 
  -ms-overflow-style: none; 
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
  height: 250px;
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
</style>
