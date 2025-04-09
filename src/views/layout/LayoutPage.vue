<template>
  <div class="main">
    <a-layout>
      <a-layout-header :style="{ position: 'fixed', zIndex: 1, width: '100%' }">
        <div class="logo" />
        <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="horizontal" :style="{ lineHeight: '64px' }">
          <a-menu-item key="1">图像什么玩意</a-menu-item>
          <a-menu-item key="2">图像什么玩意2</a-menu-item>
          <a-menu-item key="3">图像什么玩意3</a-menu-item>
        </a-menu>
      </a-layout-header>
      <a-layout-content :style="{ padding: '0 50px', marginTop: '100px' }">
        <div :style="{ background: '#fff', padding: '25px', minHeight: '85vh' }"><router-view></router-view></div>
      </a-layout-content>
      <a-layout-footer :style="{ textAlign: 'center' }">
      </a-layout-footer>
    </a-layout>
  </div>

</template>
<script lang="ts" setup>
import { ref } from 'vue';
const selectedKeys = ref<string[]>(['2']);
</script>
<style scoped>
.main {
  height: 100vh;
  overflow-y: hidden;
}

#components-layout-demo-fixed .logo {
  width: 120px;
  height: 31px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px 24px 16px 0;
  float: left;
}

.site-layout .site-layout-background {
  background: #fff;
}

[data-theme='dark'] .site-layout .site-layout-background {
  background: #141414;
}
</style>
