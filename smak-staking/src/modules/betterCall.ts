import { config } from '@/../config/config'

const baseURL = config.BETTER_CALL_API

export const getTokenDetailsByAddress = async (tokenAddress: string, tokenId = 0) => {
  const network = config.NODE_ENV === 'mainnet' ? 'mainnet' : 'florencenet'
  const endpoint = new URL(baseURL)

  endpoint.pathname = `v1/tokens/${network}/metadata`
  endpoint.searchParams.set('contract', tokenAddress)
  endpoint.searchParams.set('token_id', `${tokenId}`)

  const response = await fetch(endpoint.href).then((res) => res.json())

  return response[0]
}
