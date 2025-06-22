<template>
  <a-layout class="main">
    <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible theme="light" width="250">
      <div class="logo">
        <img src="../../assets/logo.png" alt="" class="logo-img">
        <transition name="logo-fade">
          <span v-if="!collapsed" class="logo-text">算法过程可视化系统</span>
        </transition>
      </div>
      <a-menu v-model:selectedKeys="selectedKeys" theme="light" mode="inline" @select="handleMenuSelect">
        <a-menu-item key="Bubbles" style="height: 60px;">
          <BarChartOutlined />
          <span>冒泡排序</span>
        </a-menu-item>
        <a-menu-item key="Tree" style="height: 60px;">
          <ApartmentOutlined />
          <span>哈夫曼树构造</span>
        </a-menu-item>
        <a-menu-item key="TowerofHanoi" style="height: 60px;">
          <AlignCenterOutlined />
          <span>汉诺塔问题</span>
        </a-menu-item>
        <a-menu-item key="Chess" style="height: 60px;">
          <TableOutlined />
          <span>棋盘覆盖问题</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout style="background: #e8f0fb;">
      <a-layout-header style="background: #fff; padding: 0;padding-left: 20px; height: 70px;">
        <menu-unfold-outlined v-if="collapsed" class="trigger" @click="() => (collapsed = !collapsed)" />
        <menu-fold-outlined v-else class="trigger" @click="() => (collapsed = !collapsed)" />
      </a-layout-header>
      <a-layout-content :style="{ margin: '15px 10px', padding: '10px', background: '#e8f0fb', minHeight: '280px', }">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
import {
  BarChartOutlined,
  ApartmentOutlined,
  AlignCenterOutlined,
  TableOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons-vue';
const selectedKeys = ref<string[]>(['Bubbles']);
const collapsed = ref<boolean>(false);
const handleMenuSelect = ({ key }: { key: string }) => {
  router.push(`/layout/${key}`);
};
</script>

<style scoped>
.main {
  height: 100vh;
  overflow-y: hidden;
  background-color: #f0f4f9;
}

.logo {
  display: flex;
  align-items: center;
  color: black;
  font-size: 18px;
  margin: 16px;
  margin-top: 23px;
  margin-bottom: 20px;
}

.logo-img {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.logo-text {
  white-space: nowrap;
}

.logo-fade-enter-active,
.logo-fade-leave-active {
  transition: opacity 0.2s ease;
}

.logo-fade-enter-from,
.logo-fade-leave-to {
  opacity: 0;
}

.trigger {
  font-size: 20px;
  line-height: 64px;
  cursor: pointer;
  transition: color 0.3s;
  margin-top: 14px;
}

#components-layout-demo-custom-trigger .trigger {
  font-size: 20px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

#components-layout-demo-custom-trigger .trigger:hover {
  color: #1890ff;
}

#components-layout-demo-custom-trigger .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.3);
  margin: 16px;
}
</style>