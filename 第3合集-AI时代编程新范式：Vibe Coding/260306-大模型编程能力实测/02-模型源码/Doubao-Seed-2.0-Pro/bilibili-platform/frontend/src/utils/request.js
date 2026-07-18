import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true
});

request.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

export default request;
