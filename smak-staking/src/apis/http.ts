import axios from 'axios'

declare module 'axios' {
  export interface AxiosResponse<T = any> extends Promise<T> {}
}

const http = (baseURL: string, options = {}) => {
  const defaultOptions = {
    baseURL,
  }

  const opts = Object.assign({}, defaultOptions, options)

  const http = axios.create(opts)

  http.interceptors.response.use((response) => response.data)

  return http
}

export default http
