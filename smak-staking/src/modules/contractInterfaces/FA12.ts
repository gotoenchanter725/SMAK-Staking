import { TezosToolkit, MichelsonMap } from '@taquito/taquito'
import { bytes2Char } from '@taquito/utils'
import { compose } from '@taquito/taquito';
const placeholder = require("@/assets/token-placeholder.svg")
import { tzip12 } from '@taquito/tzip12';
import { tzip16 } from '@taquito/tzip16';


export interface IMetadataKnownToken {
  network: string
  type: string
  contractAddress: string
  fa2TokenId?: number
  metadata: {
    decimals: number
    symbol: string
    name: string
    thumbnailUri: string
  }
}

// source https://github.com/madfish-solutions/quipuswap-webapp/blob/develop/public/whitelist.json
export const metadataKnownToken: IMetadataKnownToken[] = [
  {
    network: 'NetXdQprcVkpaWU',
    type: 'fa1.2',
    contractAddress: 'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV',
    metadata: {
      decimals: 18,
      symbol: 'KUSD',
      name: 'Kolibri',
      thumbnailUri: 'https://kolibri-data.s3.amazonaws.com/logo.png',
    },
  },
  {
    network: 'NetXdQprcVkpaWU',
    type: 'fa1.2',
    contractAddress: 'KT1VYsVfmobT7rsMVivvZ4J8i3bPiqz12NaH',
    metadata: {
      decimals: 6,
      symbol: 'wXTZ',
      name: 'Wrapped Tezos',
      thumbnailUri:
        'https://raw.githubusercontent.com/StakerDAO/wrapped-xtz/dev/assets/wXTZ-token-FullColor.png',
    },
  },
  {
    network: 'NetXdQprcVkpaWU',
    type: 'fa2',
    contractAddress: 'KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf',
    fa2TokenId: 0,
    metadata: {
      decimals: 6,
      symbol: 'USDS',
      name: 'Stably USD',
      thumbnailUri: 'https://quipuswap.com/tokens/stably.png',
    },
  },
  {
    network: 'NetXdQprcVkpaWU',
    type: 'fa1.2',
    contractAddress: 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn',
    metadata: {
      decimals: 8,
      symbol: 'tzBTC',
      name: 'tzBTC',
      thumbnailUri: 'https://tzbtc.io/wp-content/uploads/2020/03/tzbtc_logo_single.svg',
    },
  },
  {
    network: 'NetXdQprcVkpaWU',
    type: 'fa1.2',
    contractAddress: 'KT1AEfeckNbdEYwaMKkytBwPJPycz7jdSGea',
    metadata: {
      decimals: 18,
      symbol: 'STKR',
      name: 'Staker Governance Token',
      thumbnailUri: 'https://github.com/StakerDAO/resources/raw/main/stkr.png',
    },
  },
  {
    network: 'NetXdQprcVkpaWU',
    type: 'fa1.2',
    contractAddress: 'KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9',
    metadata: {
      decimals: 6,
      symbol: 'USDtz',
      name: 'USDtez',
      thumbnailUri: 'https://quipuswap.com/tokens/usdtz.png',
    },
  },
  {
    network: 'NetXdQprcVkpaWU',
    type: 'fa1.2',
    contractAddress: 'KT19at7rQUvyjxnZ2fBv7D9zc8rkyG7gAoU8',
    metadata: {
      decimals: 18,
      symbol: 'ETHtz',
      name: 'ETHtez',
      thumbnailUri: '/assets/images/ETHtez_purple__no_border.svg',
    },
  },
  {
    network: 'NetXdQprcVkpaWU',
    type: 'fa1.2',
    contractAddress: 'KT1TwzD6zV3WeJ39ukuqxcfK2fJCnhvrdN1X',
    metadata: {
      decimals: 3,
      symbol: 'SMAK',
      name: 'Smartlink',
      thumbnailUri:
        'https://gateway.pinata.cloud/ipfs/QmQr1YCmCAxdjT7UCXkRofJhYmT2g1NGQHun2fktqi7o62',
    },
  },
  {
    network: 'NetXdQprcVkpaWU',
    type: 'fa2',
    contractAddress: 'KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW',
    fa2TokenId: 0,
    metadata: {
      decimals: 6,
      symbol: 'hDAO',
      name: 'hic et nunc DAO',
      thumbnailUri: 'https://ipfs.io/ipfs/QmPfBrZiRsC39S2VvNbhuxH9HnNcSx8aef9uBCG51J5c4e',
    },
  },
  {
    network: 'NetXdQprcVkpaWU',
    type: 'fa1.2',
    contractAddress: 'KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b',
    metadata: {
      decimals: 18,
      symbol: 'PLENTY',
      name: 'Plenty DAO',
      thumbnailUri: 'https://services.tzkt.io/v1/avatars/KT1JQAZqShNMakSNXc2cgTzdAWZFemGcU6n1',
    },
  },
  {
    network: 'NetXdQprcVkpaWU',
    type: 'fa1.2',
    contractAddress: 'KT1BHCumksALJQJ8q8to2EPigPW6qpyTr7Ng',
    fa2TokenId: 0,
    metadata: {
      decimals: 8,
      symbol: 'CRUNCH',
      name: 'CRUNCH',
      thumbnailUri:
        'https://ipfs.io/ipfs/bafybeienhhbxz53n3gtg7stjou2zs3lmhupahwovv2kxwh5uass3bc5xzq',
    },
  },
  {
    network: 'NetXdQprcVkpaWU',
    type: 'fa1.2',
    contractAddress: 'KT19DUSZw7mfeEATrbWVPHRrWNVbNnmfFAE6',
    metadata: {
      decimals: 8,
      symbol: 'PAUL',
      name: 'PAUL Token',
      thumbnailUri: 'https://ipfs.io/ipfs/QmeoZ5ZnGnCMq8iGPeBjoS628c526DR37jnDstqEnTfkwC',
    },
  },
  {
    network: 'NetXdQprcVkpaWU',
    type: 'fa2',
    contractAddress: 'KT1A5P4ejnLix13jtadsfV9GCnXLMNnab8UT',
    fa2TokenId: 0,
    metadata: {
      decimals: 10,
      symbol: 'KALAM',
      name: 'Kalamint',
      thumbnailUri: 'https://ipfs.io/ipfs/Qme9FX9M7o2PZt9h6rvkUbfXoLpQr1HsuMQi6sL5Y75g3A',
    },
  },
  {
    network: 'NetXdQprcVkpaWU',
    type: 'fa1.2',
    contractAddress: 'KT1Xobej4mc6XgEjDoJoHtTKgbD1ELMvcQuL',
    metadata: {
      decimals: 12,
      symbol: 'YOU',
      name: 'youves YOU Governance',
      thumbnailUri: 'https://ipfs.io/ipfs/QmYAJaJvEJuwvMEgRbBoAUKrTxRTT22nCC9RuY7Jy4L4Gc',
    },
  },
  {
    network: 'NetXdQprcVkpaWU',
    type: 'fa2',
    contractAddress: 'KT1LRboPna9yQY9BrjtQYDS1DVxhKESK4VVd',
    fa2TokenId: 0,
    metadata: {
      decimals: 8,
      symbol: 'WRAP',
      name: 'Wrap Governance Token',
      thumbnailUri: 'https://ipfs.io/ipfs/Qma2o69VRZe8aPsuCUN1VRUE5k67vw2mFDXb35uDkqn17o',
    },
  },
  {
    network: 'NetXdQprcVkpaWU',
    type: 'fa2',
    contractAddress: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
    fa2TokenId: 11,
    metadata: {
      decimals: 18,
      symbol: 'wMATIC',
      name: 'Wrapped MATIC',
      thumbnailUri: 'https://ipfs.io/ipfs/QmchBnjRjpweznHes7bVKHwgzd8D6Q7Yzwf6KmA4KS6Dgi',
    },
  },
  {
    network: 'NetXdQprcVkpaWU',
    type: 'fa2',
    contractAddress: 'KT19JYndHaesXpvUfiwgg8BtE41HKkjjGMRC',
    fa2TokenId: 0,
    metadata: {
      decimals: 6,
      symbol: 'RCKT',
      name: 'Rocket',
      thumbnailUri: 'https://services.tzkt.io/v1/avatars/KT19JYndHaesXpvUfiwgg8BtE41HKkjjGMRC',
    },
  },
  {
    network: 'NetXdQprcVkpaWU',
    type: 'fa2',
    contractAddress: 'KT1T87QbpXEVgkwsNPzz8iRoah3SS3D1MDmh',
    fa2TokenId: 0,
    metadata: {
      decimals: 8,
      symbol: 'BTCtz',
      name: 'BTCtez',
      thumbnailUri:
        'https://raw.githubusercontent.com/StableTechnologies/BTCtz/cf35ab1a5e8e1e5251880e1d4a161fe706a71b88/BTCtz_SVG.svg',
    },
  },
]

export interface ITokenMetadata {
  decimals: number
  symbol: string
  name: string
  thumbnailUri: string
}

export const emptyMetadata: ITokenMetadata = {
  decimals: 0,
  symbol: '',
  name: '',
  thumbnailUri: '',
}

export class FA12Contract {
  private tk: TezosToolkit
  address: string
  private methods: any
  private contract: any
  metadata: ITokenMetadata
  private views?: any
  tokenId?: number

  constructor(
    address: string,
    metadata: any,
    tk: TezosToolkit,
    views?: any,
    tokenId?: number,
  ) {
    this.address = address
    this.tk = tk
    this.metadata = metadata
    this.views = views
    this.tokenId = tokenId
  }

  async loadContract(): Promise<void> {
    this.contract = await this.tk.wallet.at(this.address)

    if (this.tokenId !== undefined) {
      if (this.contract.methods.update_operators == undefined) {
        throw "No update_operators entrypoint"
      }
    } else {
      if (this.contract.methods.approve == undefined) {
        throw "No approve entrypoint"
      }
    }

    if (this.contract.methods.transfer == undefined) {
      throw "No transfer entrypoint"
    }

    this.methods = this.contract.methods
  }

  isFa2() {
    return this.tokenId != undefined
  }

  getTokenId() {
    return this.tokenId ? this.tokenId : 0
  }

  async approve(owner: string, approveFor: string, amount: number) {
    if (!this.contract) {
      await this.loadContract()
    }

    if (this.isFa2()) {
      const param = []
      if (amount > 0) {
        param.push({
          add_operator: {
            owner,
            operator: approveFor,
            token_id: this.tokenId
          }
        })
      } else {
        param.push({
          remove_operator: {
            owner,
            operator: approveFor,
            token_id: this.tokenId
          }
        })
      }
      return this.methods.update_operators(param)
    } else {
      return this.methods.approve(approveFor, amount)
    }
  }

  async getUserBalance(address: string) {
    if (!this.views) {
      const _contract = (await this.tk.contract.at(this.address, compose(tzip16 as any, tzip12 as any) as any)) as any
      this.views = _contract.views
    }
    if (this.isFa2()) {
      let balance = 0
      try {
        const resp = await this.views.balance_of([{ "owner": address, "token_id": this.tokenId }]).read()
        balance = Number(resp[0]["balance"])
      } catch (e) {
        console.warn(e)
      }
      return balance
    } else {
      let balance = 0
      try {
        balance = Number(await this.views.getBalance(address).read())
      } catch (e) {
        console.warn(e)
      }
      return balance
    }
  }
}

interface IMetadataEntry {
  token_id: number
  token_info: MichelsonMap<string, string>
}
interface IStorage {
  token_metadata?: MichelsonMap<number, IMetadataEntry>
}

export const cleanIpfsLink = (link: string): string => {
  if (link.slice(0, 4) == "ipfs")
    return "https://ipfs.io/ipfs/" + link.slice(7)
  else
    return link
}

async function getTokenMetadata(address: string, _contract: any, tokenId?: number): Promise<ITokenMetadata> {
  const storage = _contract.storage
  let tokenMetadata: ITokenMetadata = {
    decimals: 0,
    name: address,
    symbol: '',
    thumbnailUri: '',
  }

  const _tokenMetadata = !isNaN(Number(tokenId)) ? metadataKnownToken.filter(
    (tokenMetadata) => tokenMetadata.contractAddress == address && tokenMetadata.fa2TokenId == Number(tokenId)
  ) : metadataKnownToken.filter(
    (tokenMetadata) => tokenMetadata.contractAddress == address
  )
  if (_tokenMetadata.length) {
    tokenMetadata = _tokenMetadata[0].metadata
  } else if (!isNaN(Number(tokenId))) {
    const _metadata = await _contract.tzip12().getTokenMetadata(!isNaN(Number(tokenId)) ? tokenId : 0)
    let thumbnailUri = _metadata.thumbnailUri
    if (thumbnailUri == undefined && _metadata.icon) {
      thumbnailUri = _metadata.icon
    }
    tokenMetadata = {
      decimals: _metadata.decimals,
      name: _metadata.name ? _metadata.name : address,
      symbol: _metadata.symbol ? _metadata.symbol : "",
      thumbnailUri: thumbnailUri ? thumbnailUri : ""
    }
  }
  else if (storage.token_metadata) {
    // fetch from token metadata
    const metadata: any = await storage.token_metadata.get(0)
    //console.log("address", address, storage.token_metadata, metadata)
    if (metadata) {
      if (metadata.token_info) {
        try {
          const decimals = metadata.token_info.get('decimals')
          let thumbnailUri = metadata.token_info.get('thumbnailUri')
          if (!thumbnailUri) {
            thumbnailUri = metadata.token_info.get('icon')
          }
          const symbol = metadata.token_info.get('symbol')
          const name = metadata.token_info.get('name')
          tokenMetadata = {
            decimals: decimals ? Number(bytes2Char(decimals)) : 0,
            thumbnailUri: thumbnailUri ? bytes2Char(thumbnailUri) : '',
            symbol: symbol ? bytes2Char(symbol) : '',
            name: name ? bytes2Char(name) : '',
          }
        } catch (e) {
          const decimals = metadata.token_info.get('decimals')
          let thumbnailUri = metadata.token_info.get('thumbnailUri')
          if (!thumbnailUri) {
            thumbnailUri = metadata.token_info.get('icon')
          }
          const symbol = metadata.token_info.get('symbol')
          const name = metadata.token_info.get('name')
          tokenMetadata = {
            decimals: decimals ? decimals : 0,
            thumbnailUri: thumbnailUri ? thumbnailUri : '',
            symbol: symbol ? symbol : '',
            name: name ? name : '',
          }
        }
      } else if (metadata[1].keyMap) {
        const decimals = metadata[1].valueMap.get('"decimals"')
        let thumbnailUri = metadata[1].valueMap.get('"thumbnailUri"')
        if (!thumbnailUri) {
          thumbnailUri = metadata[1].valueMap.get('"icon"')
        }
        const symbol = metadata[1].valueMap.get('"symbol"')
        const name = metadata[1].valueMap.get('"name"')
        tokenMetadata = {
          decimals: decimals ? Number(bytes2Char(decimals)) : 0,
          thumbnailUri: thumbnailUri ? bytes2Char(thumbnailUri) : placeholder,
          symbol: symbol ? bytes2Char(symbol) : '',
          name: name ? bytes2Char(name) : '',
        }
      }
    }
  } else {
    console.log("storage", storage)
    console.warn('no metadata for', address, storage.token_metadata, storage.token_metadata)
  }

  if (tokenMetadata["thumbnailUri"].slice(0, 7) == "ipfs://") {
    tokenMetadata["thumbnailUri"] = cleanIpfsLink(tokenMetadata["thumbnailUri"])
  }

  return tokenMetadata
}

export async function fa12ContractFactory(address: string, tk: TezosToolkit, tokenId?: number, metadata?: ITokenMetadata) {
  let views = undefined
  if (!metadata) {
    const _contract = (await tk.contract.at(address, compose(tzip16 as any, tzip12 as any) as any)) as any
    views = _contract.views
    metadata = await getTokenMetadata(address, _contract, tokenId)
  }

  return new FA12Contract(address, metadata, tk, views, tokenId)
}
