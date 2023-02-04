export function xtzToTokenForward(
  mutezAmount: number,
  tokenPool: number,
  xtzPool: number,
  fee = 997
) {
  return (mutezAmount * fee * tokenPool) / (xtzPool * 1000 + mutezAmount * fee)
}

export function tokenToXtzForward(
  tokensSold: number,
  tokenPool: number,
  xtzPool: number,
  fee = 997
) {
  return (tokensSold * fee * xtzPool) / (tokenPool * 1000 + tokensSold * fee)
}

export function tokenToTokenForward(
  tokensSold: number,
  tokenPoolIn: number,
  xtzPoolIn: number,
  tokenPoolOut: number,
  xtzPoolOut: number,
  fee = 997
) {
  const xtzAmount = tokenToXtzForward(tokensSold, tokenPoolIn, xtzPoolIn, fee)
  const tokenAmount = xtzToTokenForward(xtzAmount, tokenPoolOut, xtzPoolOut, fee)
  return tokenAmount
}

export function xtzToTokenBackward(
  mutezAmount: number,
  tokenPool: number,
  xtzPool: number,
  fee = 997
) {
  return (mutezAmount * fee * tokenPool) / (xtzPool * 1000 + mutezAmount * fee)
}

export function tokenToXtzBackward(
  tokensSold: number,
  tokenPool: number,
  xtzPool: number,
  fee = 997
) {
  return (tokensSold * fee * xtzPool) / (tokenPool * 1000 + tokensSold * fee)
}

export function tokenToTokenBackward(
  tokensSold: number,
  xtzPoolIn: number,
  tokenPoolIn: number,
  xtzPoolOut: number,
  tokenPoolOut: number,
  fee = 997
) {
  const xtzAmount = tokenToXtzBackward(tokensSold, tokenPoolIn, xtzPoolIn, fee)
  const tokenAmount = xtzToTokenBackward(xtzAmount, tokenPoolOut, xtzPoolOut, fee)
  return tokenAmount
}

export function getXtzPooled(lpTokenBalance: number, xtzPool: number, lpTokenTotal: number) {
  return Math.floor((lpTokenBalance * xtzPool) / lpTokenTotal)
}

export function getTokensPooled(lpTokenBalance: number, tokenPool: number, lpTokenTotal: number) {
  return Math.floor((lpTokenBalance * tokenPool) / lpTokenTotal)
}
