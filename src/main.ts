import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'

import App from './App.vue'
import router from './router'
import '@/assets/main.css'
import 'ant-design-vue/dist/reset.css'
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(Antd).mount('#app')
