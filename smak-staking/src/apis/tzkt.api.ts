import http from './http'
import { IXtzPrice } from '../interfaces/tzkt.interface'

const baseURL = 'https://api.tzkt.io/v1'
const api = http(baseURL)
const endpoint = 'quotes/last'

const TzktAPI = {
  getXtzPrice: () => api.get<IXtzPrice>(endpoint),
}

export default TzktAPI
