export const TOKENS = {
  XTZ: { address: 'XTZ', tokenId: 0 },
  SMAK: { address: 'KT1TwzD6zV3WeJ39ukuqxcfK2fJCnhvrdN1X', tokenId: 0 },
  USDTz: { address: 'KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9', tokenId: 0 },
  BTCtz: { address: 'KT1T87QbpXEVgkwsNPzz8iRoah3SS3D1MDmh', tokenId: 0 },
  ETHtz: { address: 'KT19at7rQUvyjxnZ2fBv7D9zc8rkyG7gAoU8', tokenId: 0 },
  KUSD: { address: 'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV', tokenId: 0 },
  hDAO: { address: 'KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW', tokenId: 0 },
  KALAM: { address: 'KT1A5P4ejnLix13jtadsfV9GCnXLMNnab8UT', tokenId: 0 },
  CRUNCH: { address: 'KT1BHCumksALJQJ8q8to2EPigPW6qpyTr7Ng', tokenId: 0 },
  'WRAP Governance': { address: 'KT1LRboPna9yQY9BrjtQYDS1DVxhKESK4VVd', tokenId: 0 },
  PLENTY: { address: 'KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b', tokenId: 0 },
  YOU: { address: 'KT1Xobej4mc6XgEjDoJoHtTKgbD1ELMvcQuL', tokenId: 0 },
  'Wrapped Tezos': { address: 'KT1VYsVfmobT7rsMVivvZ4J8i3bPiqz12NaH', tokenId: 0 },
  ROCKET: { address: 'KT19JYndHaesXpvUfiwgg8BtE41HKkjjGMRC', tokenId: 0 },
  MATIC: { address: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ', tokenId: 11 },
  BUSD: { address: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ', tokenId: 1 },
  LINK: { address: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ', tokenId: 10 },
  uUSD: { address: 'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW', tokenId: 0 },
  EASY: { address: 'KT1QgAtLPu3SNq9c6DPLanwL5bvfX3rgh2CS ', tokenId: 0 },
  PAUL: { address: 'KT19DUSZw7mfeEATrbWVPHRrWNVbNnmfFAE6', tokenId: 0 },
  Ctez: { address: 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4', tokenId: 0 },
  uDEFI: { address: 'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW', tokenId: 1 },
  QUIPU: { address: 'KT193D4vozYnhGJQVtw7CoxxqphqUEEwK6Vb', tokenId: 0 },
  wDAI: { address: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ', tokenId: 5 },
  wBTC: { address: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ', tokenId: 19 },
  wETH: { address: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ', tokenId: 20 },
  wUSDC: { address: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ', tokenId: 17 },
  wUSDT: { address: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ', tokenId: 18 }
}

export const SWAP_ADDRESS = {
  XTZ_SMAK: 'KT1LzyPS8rN375tC31WPAVHaQ4HyBvTSLwBu',
  XTZ_TTT: 'KT1MiwQUAWaboXRzjWm8UaLs4k4gob26f4Cb',
  XTZ_STKR: 'KT1PBoHkUwSR86XnK6FQi2HJCJ4Yv7qoTDjm',
}

export const TOKEN_METADATA = {
  [TOKENS.XTZ.address]: {
    [TOKENS.XTZ.tokenId]: {
      address: TOKENS.XTZ.address,
      metadata: {
        decimals: 6,
        symbol: 'XTZ',
        name: 'Tezos',
        thumbnailUri: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2011.png',
      },
    },
  },
  [TOKENS.SMAK.address]: {
    [TOKENS.SMAK.tokenId]: {
      address: TOKENS.SMAK.address,
      metadata: {
        decimals: 3,
        symbol: 'SMAK',
        name: 'Smartlink',
        thumbnailUri: 'https://ipfs.io/ipfs/QmQr1YCmCAxdjT7UCXkRofJhYmT2g1NGQHun2fktqi7o62',
      },
    },
  },
}

export const TEZOS_DECIMALS =
  TOKEN_METADATA[TOKENS.XTZ.address][TOKENS.XTZ.tokenId].metadata.decimals

export const FREQUENTLY_PAIRED_TOKENS = [
  TOKENS.XTZ,
  TOKENS.SMAK,
  TOKENS.USDTz,
  TOKENS.BTCtz,
  TOKENS.ETHtz,
  TOKENS.KUSD,
]

export const FIRST_TOKENS = [
  TOKENS.hDAO,
  TOKENS.KALAM,
  TOKENS.CRUNCH,
  TOKENS['WRAP Governance'],
  TOKENS.PLENTY,
  TOKENS.YOU,
  TOKENS['Wrapped Tezos'],
  TOKENS.ROCKET,
  TOKENS.MATIC,
  TOKENS.BUSD,
  TOKENS.LINK,
  TOKENS.uUSD,
  TOKENS.EASY,
  TOKENS.PAUL,
  TOKENS.Ctez,
  TOKENS.uDEFI,
  TOKENS.QUIPU,
  TOKENS.wDAI,
  TOKENS.wUSDT,
  TOKENS.wBTC,
  TOKENS.wUSDC,
  TOKENS.wETH,
]

export const WHITELISTED_TOKENS = [...FREQUENTLY_PAIRED_TOKENS, ...FIRST_TOKENS]

export const TOKEN_POOL_INFO = {
  [TOKENS.SMAK.address]: {
    [TOKENS.SMAK.tokenId]: {
      tokenAddress: 'KT1TwzD6zV3WeJ39ukuqxcfK2fJCnhvrdN1X',
      poolAddress: 'KT1LzyPS8rN375tC31WPAVHaQ4HyBvTSLwBu',
      lqtAddress: '',
      tokenId: 0,
      symbol: 'SMAK',
      name: 'Smartlink',
      decimals: 3,
      lastPriceXtz: 0.0,
      lastPriceUsd: 0.0,
      contractFormat: 'FA12',
      icon: 'ipfs://QmQr1YCmCAxdjT7UCXkRofJhYmT2g1NGQHun2fktqi7o62',
    },
  },
}

export const EMPTY_METADATA = {
  decimals: 0,
  symbol: '',
  name: '',
  thumbnailUri: '',
}