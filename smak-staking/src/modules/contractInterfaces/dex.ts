import { TezosToolkit } from '@taquito/taquito'
import { DexIndexer } from '@/modules/dexIndexer'
import { OpKind } from '@taquito/taquito'
import { approveTokenTransaction } from './swap'
import { FA12Contract } from './FA12'

export class DexContract {
  address: string
  private tk: TezosToolkit
  private storage: any
  methods: any
  contract: any
  private indexer: DexIndexer

  constructor(address: string, contract: any, storage: any, tk: TezosToolkit) {
    this.address = address
    this.tk = tk
    this.contract = contract
    this.storage = storage
    this.methods = this.contract.methods
    this.indexer = new DexIndexer()
  }

  async reloadStorage() {
    this.storage = await this.contract.storage()
  }

  async launchExchange(
    sender: string,
    token: FA12Contract,
    tokenAmount: number,
    xtzAmount: number,
    tokenId?: number,
  ) {
    if (tokenId != undefined) {
      const transaction = {
        kind: OpKind.TRANSACTION,
        ...this.methods
          .launchExchange(token.address, tokenAmount, tokenId)
          .toTransferParams(),
        amount: xtzAmount,
      }
      return await this.tk.wallet
        .batch(await approveTokenTransaction(sender, this.address, token, tokenAmount, transaction))
        .send()
    }

    const transaction = {
      kind: OpKind.TRANSACTION,
      ...this.methods
        .launchExchange(token.address, tokenAmount)
        .toTransferParams(),
      amount: xtzAmount,
    }
    return await this.tk.wallet
      .batch(await approveTokenTransaction(sender, this.address, token, tokenAmount, transaction))
      .send()
  }

  async getSwapAddresses() {
    return await this.indexer.getSwapContracts(this.storage.swaps.id)
  }
}

export async function dexContractFactory(address: string, tk: TezosToolkit): Promise<DexContract> {
  const contract = await tk.wallet.at(address)
  const storage = await contract.storage()

  return new DexContract(address, contract, storage, tk)
}
