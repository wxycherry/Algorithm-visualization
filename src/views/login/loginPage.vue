<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const handleLogin = () => {
  router.push('/layout')
}
</script>

<template>
  <div>
    我是login
    <button @click="handleLogin">登录</button>
  </div>
</template>

<style scoped></style>
