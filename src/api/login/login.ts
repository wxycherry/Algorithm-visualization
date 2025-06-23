import request from '@/utils/request'
export const loginAPI = ({
  email,
  name,
  password,
}: {
  email: string
  name: string
  password: string
}) => {
  return request({
    url: '/system/login',
    method: 'post',
    data: {
      email,
      name,
      password,
    },
  })
}
export const registerAPI = ({
  email,
  name,
  password,
}: {
  email: string
  name: string
  password: string
}) => {
  return request({
    url: '/system/register',
    method: 'post',
    data: {
      email,
      name,
      password,
    },
  })
}
