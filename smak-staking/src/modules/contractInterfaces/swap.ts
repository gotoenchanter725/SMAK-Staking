import { TezosToolkit, BigMapAbstraction } from '@taquito/taquito'
import { OpKind } from '@taquito/taquito'
import { FA12Contract, fa12ContractFactory } from './FA12'

interface IStorage {
  history: any
  user_investments: any
  tokenPool: number
  xtzPool: number
  tokenAddress: string
  lqtTotal: number
  lqtAddress: string
  tokenId?: number
}

interface IHistoryEntry {
  tokenPool: number
  xtzPool: number
}

export async function approveTokenTransaction(
  sender: string,
  approveFor: string,
  token: FA12Contract,
  amount: number,
  transaction: any,
) {
  if (token.isFa2()) {
    return [
      {
        kind: OpKind.TRANSACTION,
        ...(await token.approve(sender, approveFor, amount)).toTransferParams(),
      },
      transaction,
      {
        kind: OpKind.TRANSACTION,
        ...(await token.approve(sender, approveFor, 0)).toTransferParams(),
      },
    ]
  } else {
    return [
      {
        kind: OpKind.TRANSACTION,
        ...(await token.approve(sender, approveFor, 0)).toTransferParams(),
      },
      {
        kind: OpKind.TRANSACTION,
        ...(await token.approve(sender, approveFor, amount)).toTransferParams(),
      },
      transaction,
    ]
  }
}

export class SwapContract {
  private tk: TezosToolkit
  address: string
  storage: IStorage
  methods?: any
  contract?: any

  constructor(address: string, tk: TezosToolkit) {
    this.address = address
    this.tk = tk
    this.storage = {
      history: {},
      user_investments: {},
      tokenPool: 0,
      xtzPool: 0,
      tokenAddress: "",
      lqtTotal: 0,
      lqtAddress: "",
      tokenId: undefined,
    }
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

  getTokenId() {
    return this.storage.tokenId ? this.storage.tokenId : 0
  }

  async addLiquidity(
    sender: string,
    xtzAmount: number,
    minLqtMinted: number,
    maxTokensDeposited: number,
    deadline: string,
    token: FA12Contract,
    swapContractAddress: string
  ) {
    const transaction = {
      kind: OpKind.TRANSACTION,
      ...this.methods
        .addLiquidity(sender, minLqtMinted, maxTokensDeposited, deadline)
        .toTransferParams(),
      amount: xtzAmount,
    }
    return await this.tk.wallet
      .batch(await approveTokenTransaction(sender, swapContractAddress, token, maxTokensDeposited, transaction))
      .send()
  }

  async removeLiquidity(
    to_: string,
    lqtBurned: number,
    minXtzWithdrawn: number,
    minTokensWithdrawn: number,
    deadline: string
  ) {
    if (!this.contract) {
      await this.loadContract()
    }

    return await this.tk.wallet
      .batch([
        {
          kind: OpKind.TRANSACTION,
          ...this.methods
            .removeLiquidity(to_, lqtBurned, minXtzWithdrawn, minTokensWithdrawn, deadline)
            .toTransferParams(),
        },
      ])
      .send()
  }

  async xtzToToken(sender: string, xtzAmount: number, minTokensBought: number, deadline: string) {
    return await this.tk.wallet
      .batch([
        {
          kind: OpKind.TRANSACTION,
          ...this.methods.xtzToToken(sender, minTokensBought, deadline).toTransferParams(),
          amount: xtzAmount,
        },
      ])
      .send()
  }

  async tokenToXtz(
    sender: string,
    recipient: string,
    tokensSold: number,
    minXtzBought: number,
    deadline: string,
    token: FA12Contract,
    swapContractAddress: string
  ) {
    const transaction = {
      kind: OpKind.TRANSACTION,
      ...this.methods.tokenToXtz(recipient, tokensSold, minXtzBought, deadline).toTransferParams(),
    }
    return await this.tk.wallet
      .batch(await approveTokenTransaction(sender, swapContractAddress, token, tokensSold, transaction))
      .send()
  }

  async tokenToToken(
    sender: string,
    recipient: string,
    minTokensBought: number,
    tokensSold: number,
    deadline: string,
    token: FA12Contract,
    swapContractAddressIn: string,
    swapContractAddressOut: string
  ) {
    const transaction = {
      kind: OpKind.TRANSACTION,
      ...this.methods
        .tokenToToken(swapContractAddressOut, minTokensBought, recipient, tokensSold, deadline)
        .toTransferParams(),
    }
    return await this.tk.wallet
      .batch(await approveTokenTransaction(sender, swapContractAddressIn, token, tokensSold, transaction))
      .send()
  }
}

export function swapContractFactory(
  address: string,
  tk: TezosToolkit
): SwapContract {
  return new SwapContract(address, tk)
}
