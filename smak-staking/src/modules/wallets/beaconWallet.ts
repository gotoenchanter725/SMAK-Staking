/**
 * @module staking-history
 * @author Smart-Chain
 * @version 1.0.0
 * This module builds a beacon wallet object
 */

import { TezosToolkit } from '@taquito/taquito'
import { config } from '../../../config/config'
import { NetworkType } from '@airgap/beacon-sdk'
import { BeaconWallet } from '@taquito/beacon-wallet'

export class WalletBeacon {
  private tk: TezosToolkit
  private wallet: BeaconWallet
  private network: NetworkType

  constructor(tk: TezosToolkit) {
    // Set the RPC
    this.tk = tk

    // Set the network
    this.network = config.NODE_ENV == 'development' ? NetworkType.FLORENCENET : NetworkType.MAINNET

    // Set the wallet
    const options = {
      name: 'SMAK Staking',
      iconUrl: '../assets/ticker.svg',
      preferredNetwork: this.network,
    }
    this.wallet = new BeaconWallet(options)
  }

  /**
   * This function connects the beacon wallet provider to the desired network and sets its permissions to the selected wallet. It also checks the wallet availability
   */
  public async setupWallet() {
    await this.wallet
      .requestPermissions({ network: { type: this.network } })
      .then(() => {
        this.tk.setProvider({ wallet: this.wallet })
      })

      .catch((error) => {
        console.log(error)
      })
  }

  /**
   * This function retrieves the wallet address
   * @returns {Promise<string>} wallet address
   */
  public getWalletAddress() {
    return this.wallet.getPKH()
  }

  /**
   * This function checks if the wallet is connected
   * @returns {boolean} wallet connection status
   */
  public async isConnected() {
    const activeAccount = await this.wallet.client.getActiveAccount()
    return activeAccount ? true : false
  }

  /**
   * This function returns the temple wallet object
   * @returns {BeaconWallet} temple wallet boject
   */
  public getWallet() {
    return this.wallet
  }

  /**
   * This function signs out a user
   */
  async signOut() {
    await this.wallet.clearActiveAccount()
  }
}
