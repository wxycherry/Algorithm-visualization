<script setup lang="ts">
// const bubbleSort = (arr: number[]) => {
//   const len = arr.length
//   for (let i = 0; i < len - 1; i++) {
//     for (let j = 0; j < len - 1 - i; j++) {
//       if (arr[j] > arr[j + 1]) {
//         ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
//       }
//     }
//   }
//   return arr
// }
</script>

<template>
  <div class="bubbles">
    <div class="left"></div>
    <div class="right">
      <div class="content">
        <h2>冒泡排序算法</h2>
        <div class="section">
          <p>
            冒泡排序是一种简单的排序算法。它重复地遍历要排序的序列，依次比较两个元素，如果他们的顺序错误就把他们交换过来。
          </p>
        </div>
        <div class="section">
          <h3>算法原理</h3>
          <p>
            比较相邻的元素。如果第一个比第二个大，就交换他们两个。对每一对相邻原色作同样的工作，从开始一对到结尾的最后一对，这样做完后，最后的元素会是最大的数。
          </p>
        </div>
        <div class="section">
          <h3>代码实现</h3>
          <pre class="code-block">
            <code>
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
            </code>
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
        <div class="section">
          <h3>应用场景</h3>
          <ul>
            <li>数据量较小的排序需求</li>
            <li>教学演示排序算法的基本概念</li>
            <li>对稳定性有要求的简单排序场景</li>
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
}

.right {
  width: 34%;
  height: 100%;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  padding: 10px;
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
