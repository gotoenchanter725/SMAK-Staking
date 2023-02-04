import { TezosToolkit, BigMapAbstraction } from '@taquito/taquito'

interface IStorage {
  total_supply: number
}

export class LpTokenContract {
  address: string
  private storage?: IStorage
  methods?: any
  contract?: any
  views?: any
  tk: any

  constructor(address: string, tk: any) {
    this.address = address
    this.tk = tk
  }

  async loadContract(): Promise<void> {
    this.contract = await this.tk.wallet.at(this.address)
    this.methods = this.contract.methods
  }

  async reloadStorage(): Promise<void> {
    if (!this.contract) {
      await this.loadContract()
    }
    this.storage = await this.contract.storage()
  }

  async getTotalSupply(): Promise<number> {
    if (!this.storage) {
      this.reloadStorage()
    }

    if (this.storage) {
      return this.storage.total_supply
    } else {
      return 0
    }
  }

  async loadViews() {
    this.views = ((await this.tk.contract.at(this.address)) as any).views
  }

  async getUserBalance(address: string) {
    if (!this.views) {
      this.loadViews()
    }
    let balance = 0
    if (address) {
      try {
        balance = Number(await this.views.getBalance(address).read())
      } catch (e) {
        console.warn(e)
      }
    }
    return balance
  }
}

interface IStorage {
  tokens: BigMapAbstraction
}

export async function lpTokenContractFactory(address: string, tk: TezosToolkit) {
  const contract = await tk.wallet.at(address)

  return new LpTokenContract(address, tk)
}
