<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginAPI, registerAPI } from '@/api/login/login'
import { message } from 'ant-design-vue';
const router = useRouter()
const preshow = ref(true)
const percent = ref(0) // 进度条的百分比
const islogin = ref(true) // 是否登录状态

// 登录内容
const email = ref('')
const name = ref('')
const password = ref('')
// 注册内容
const email1 = ref('')
const name1 = ref('')
const password1 = ref('')
// 更新进度条的函数
const updateProgress = () => {
  if (percent.value < 100) {
    percent.value += 5; // 每次增加5%
  } else {
    percent.value = 100;
  }
}

// 两秒内从0到1的定时器
const interval = setInterval(() => {
  updateProgress();
}, 20); // 每20毫秒更新一次

setTimeout(() => {
  clearInterval(interval);
  preshow.value = false;
}, 2000);

const handleLogin = () => {
  if (islogin.value) {
    // 登录逻辑
    loginAPI({ email: email.value!, name: name.value!, password: password.value! }).then(response => {
      console.log('登录响应:', response)
      if (response.data.code === 200) {
        message.success('登录成功');
        email.value = '';
        name.value = '';
        password.value = '';
        setTimeout(() => {
          router.push('/layout')
        }, 1000)
      } else {
        message.error(response.data.msg);
      }
    }).catch(error => {
      console.error('登录错误:', error)
      message.error('登录失败');
    })
  } else {
    // 注册逻辑
    registerAPI({ email: email1.value!, name: name1.value!, password: password1.value! }).then(response => {
      console.log('登录响应:', response)
      if (response.data.code === 200) {
        message.success('注册成功');
        email1.value = '';
        name1.value = '';
        password1.value = '';
        islogin.value = true
      } else {
        message.error(response.data.msg);
      }
    }).catch(error => {
      console.error('登录错误:', error)
      message.error('注册失败');
    })
  }

}
</script>

<template>
  <div v-if="preshow" class="bg">
    <div class="line">
      <a-progress :stroke-color="{
        from: '#108ee9',
        to: '#87d068',
      }" :percent="percent" status="active" />
    </div>

    <img src="../../assets/pre-login.png" alt="" class="pre-login">
  </div>

  <div v-else class="login-page">
    <img src="../../assets/login-bg.png" alt="" class="pre-login">
    <!-- 登录 -->
    <div class="login" v-if="islogin">
      <p class="title">LOGIN</p>
      <div class="login-box">
        <p class="small-title">邮箱/email</p>
        <input type="text" class="login-input" v-model="email">
        <p class="small-title">名称/name</p>
        <input type="text" class="login-input" v-model="name">
        <p class="small-title">密码/password </p><span class="forget-password">忘记密码?</span>
        <input type="text" class="login-input" v-model="password">
      </div>
      <button @click="handleLogin" class="login-btn">登录</button>
      <p class="ques">还没有账号？<span class="zhuce" @click="islogin = false">点击注册</span></p>
    </div>
    <!-- 注册 -->
    <div class="login" v-else>
      <p class="title">SIGNUP</p>
      <div class="login-box">
        <p class="small-title">邮箱/email</p>
        <input type="text" class="login-input" v-model="email1">
        <p class="small-title">名称/name</p>
        <input type="text" class="login-input" v-model="name1">
        <p class="small-title">密码/password </p><span class="forget-password">忘记密码?</span>
        <input type="text" class="login-input" v-model="password1">
      </div>
      <button @click="handleLogin" class="login-btn">注册</button>
      <p class="ques zhuce" @click="islogin = true">返回登录</p>
    </div>

  </div>

</template>

<style scoped>
.pre-login {
  width: 100vw;
  height: 100vh;
  background-size: cover;
}

.bg {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
}

.line {
  position: absolute;
  bottom: 20px;
  width: 50vw;
}

.login-page {
  width: 100vw;
  height: 100vh;
  background-size: cover;
  position: relative;
}

.login {
  width: 580px;
  height: 680px;
  border-radius: 40px;
  background-color: #fff;
  position: absolute;
  bottom: 120px;
  right: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  /* justify-content: center; */
}

.title {
  font-size: 40px;
  color: black;
  font-family: KaiTi;
}

.login-box {
  width: 90%;
  height: 65%;
  padding: 10px;
}

.small-title {
  font-size: 25px;
  font-family: KaiTi;
  display: flex;
  margin-bottom: 10px;

}

.login-btn {
  width: 100px;
  height: 40px;
  border-radius: 20px;
  border: 1px solid #46c0cf;
  color: white;
  background-color: #46c0cf;
  font-size: 25px;
  font-weight: bold;
  font-family: KaiTi;
  cursor: pointer;
}

.login-input {
  width: 100%;
  background-color: #a8e1e8;
  height: 50px;
  border: 1px solid #a8e1e8;
  border-radius: 10px;
  margin-bottom: 38px;
}

.forget-password {
  position: absolute;
  bottom: 265px;
  right: 80px;
  font-size: 15px;
  color: #46c0cf;
}

.zhuce {
  color: #46c0cf;
  cursor: pointer;
}

.ques {
  position: absolute;
  bottom: 50px;
  right: 80px
}
</style>