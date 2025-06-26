<template>
  <div class="history-page">
    <div class="header-bar">
      <a-button type="link" @click="goBack" class="back-btn">
        返回
      </a-button>
      <h2>历史记录</h2>
    </div>
    <a-tabs v-model:activeKey="activeTab" class="custom-tabs">
      <a-tab-pane key="1" tab="冒泡排序">
        <a-list
          bordered
          :data-source="filteredList(1)"
          class="history-list"
        >
          <template #renderItem="{ item }">
            <a-list-item class="history-item">
              <div>
                <div class="item-details"><strong>内容：</strong>{{ item.details }}</div>
                <div class="item-time"><strong>时间：</strong>{{ item.createTime }}</div>
              </div>
            </a-list-item>
          </template>
        </a-list>
      </a-tab-pane>
      <a-tab-pane key="2" tab="哈夫曼树">
        <a-list
          bordered
          :data-source="filteredList(2)"
          class="history-list"
        >
          <template #renderItem="{ item }">
            <a-list-item class="history-item">
              <div>
                <div class="item-details"><strong>内容：</strong>{{ item.details }}</div>
                <div class="item-time"><strong>时间：</strong>{{ item.createTime }}</div>
              </div>
            </a-list-item>
          </template>
        </a-list>
      </a-tab-pane>
      <a-tab-pane key="3" tab="汉诺塔问题">
        <a-list
          bordered
          :data-source="filteredList(3)"
          class="history-list"
        >
          <template #renderItem="{ item }">
            <a-list-item class="history-item">
              <div>
                <div class="item-details"><strong>内容：</strong>{{ item.details }}</div>
                <div class="item-time"><strong>时间：</strong>{{ item.createTime }}</div>
              </div>
            </a-list-item>
          </template>
        </a-list>
      </a-tab-pane>
      <a-tab-pane key="4" tab="棋盘问题">
        <a-list
          bordered
          :data-source="filteredList(4)"
          class="history-list"
        >
          <template #renderItem="{ item }">
            <a-list-item class="history-item">
              <div>
                <div class="item-details"><strong>内容：</strong>{{ item.details }}</div>
                <div class="item-time"><strong>时间：</strong>{{ item.createTime }}</div>
              </div>
            </a-list-item>
          </template>
        </a-list>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getHistoryAPI } from '@/api/history/history'
import { useUserStore } from '@/store/index'
import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => router.back()

const userStore = useUserStore()
const token = userStore.token
const historyList = ref<any[]>([])
const activeTab = ref('1')

const fetchHistory = async () => {
  try {
    const res = await getHistoryAPI(token)
    historyList.value = res.data?.data || []
  } catch (e) {
    message.error('获取历史记录失败')
    historyList.value = []
  }
}

const filteredList = (type: number) => {
  return historyList.value.filter(item => item.type === type)
}

onMounted(() => {
  fetchHistory()
})
</script>

<style scoped>
.history-page {
  padding: 32px 0 0 0;
  background: #f6f8fa;
  min-height: 100vh;
}
.header-bar {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-left: 24px;
}
.header-bar h2 {
  margin: 0 0 0 16px;
  font-weight: 600;
  font-size: 24px;
  color: #222;
}
.back-btn {
  font-size: 16px;
  color: #1890ff;
  padding-left: 0;
}
.custom-tabs {
  margin: 0 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px #e6e6e6;
  padding: 24px 16px 8px 16px;
}
.history-list {
  background: #f9fbff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(24,144,255,0.04);
  margin-bottom: 16px;
}
.history-item {
  border-radius: 6px;
  transition: background 0.2s;
}
.history-item:hover {
  background: #e6f7ff;
}
.item-details {
  font-size: 15px;
  color: #333;
  margin-bottom: 4px;
}
.item-time {
  font-size: 13px;
  color: #888;
}
</style>