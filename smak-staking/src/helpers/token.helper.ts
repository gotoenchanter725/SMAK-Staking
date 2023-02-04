import { WHITELISTED_TOKENS } from '@/constants/tokens.const'

export const isTokenWhitelisted = (addressToCheck: string, tokenIdToCheck: number) => {
  for (const { address, tokenId } of WHITELISTED_TOKENS) {
    if (address == addressToCheck && tokenId == tokenIdToCheck) {
      return true
    }
  }
  return false
}

export const tokenIdentifier = (token: { address: string; tokenId: number }): string => {
  return `address:${token.address}|tokenId:${token.tokenId}`
}
