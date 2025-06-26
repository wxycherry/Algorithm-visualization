import request from '@/utils/request'

// 获取历史记录，token 作为参数传入
export const getHistoryAPI = (token: string) => {
  return request({
    url: '/system/getRecord',
    method: 'get',
    headers: {
      'Authorization': token
    }
  })
}



export const addHistoryAPI = (details: string, type: number, token: string) => {
  return request({
    url: '/system/addRecord',
    method: 'put', // 必须是 post
    data: {
      details,
      type
    },
    headers: {
      Authorization: token
    }
  })
}