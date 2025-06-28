import axios from 'axios'
import type { AxiosInstance } from 'axios'
import router from '@/router'
import { useUserStore } from '@/store/index'

const userStore = useUserStore()
const token = userStore.token
// 配置新建一个 axios 实例
const service: AxiosInstance = axios.create({
  // baseURL: 'http://9o7237a298.goho.co',
  timeout: 50000,
  headers: { 'Content-Type': 'application/json' },
})

// 添加请求拦截器
// service.interceptors.request.use(
//   (config) => {
//     // 携带token
//     if (sessionStorage.getItem('token')) {
//       // config.headers.Authorization = `Bearer ${useStore.token}`;
//       config.headers.Authorization = sessionStorage.getItem('token')
//     }
//     return config
//   },
//   (err) => Promise.reject(err),
// )
service.interceptors.request.use(
  (config) => {
    // 确保 headers 存在
    config.headers = config.headers || {}
    // 携带token
    const token = sessionStorage.getItem('token')
    if (token) {
      console.log('携带token:', token)
      config.headers.Authorization = token
      // 或者 config.headers.Authorization = `Bearer ${token}` 视后端要求
    } else {
      console.log('未携带token')
    }
    return config
  },
  (err) => Promise.reject(err),
)
// 添加响应拦截器
service.interceptors.response.use(
  (res) => {
    if (res.status !== 200) {
      console.log('请求失败')
      return Promise.reject(res.data)
    }
    return res
  },
  (err) => {
    // 错误的特殊提示 401权限不足或token过期=》跳转到登录页
    if (err.response?.status === 401) {
      router.push('/login')
    }
    // 错误的默认情况  只给提示
    console.log(err.response.data.message || '服务异常')
    return Promise.reject(err)
  },
)

// 导出 axios 实例
export default service
