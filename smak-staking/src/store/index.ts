import Vue from 'vue'
import Vuex from 'vuex'

import { notificationCenterState } from '@/store/notificationCenter'
import { walletState } from '@/store/wallet'
import { dexContractsState } from '@/store/dexContracts'
import { swapState } from '@/store/swap'
import { graphState } from '@/store/graph'
import { poolState } from '@/store/pool'
import { dashboardState } from '@/store/dashboard'
import { marketState } from '@/store/market'
import { farms } from '@/store/farms'
import { smak } from '@/store/smak'
import { staking } from '@/store/staking'
import { pools } from '@/store/pools'
import { tokens } from '@/store/tokens'

const setCookie = (name: string, value: string, days: number) => {
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = '; expires=' + date.toUTCString()
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/'
}

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    wallet: walletState,
    swap: swapState,
    notificationCenter: notificationCenterState,
    dexContracts: dexContractsState,
    graph: graphState,
    pool: poolState,
    dashboard: dashboardState,
    market: marketState,
    farms,
    smak,
    staking,
    pools,
    tokens,
  } as any,
  state: {
    theme: 'dark',
    drawer: false,
  },
  mutations: {
    updateTheme(state, theme) {
      state.theme = theme
      setCookie('theme', theme, 30)
    },
    updateMobileDrawer(state, drawer) {
      state.drawer = drawer
    },
  },
  getters: {
    themeClass(state): { light: boolean; dark: boolean } {
      return {
        light: state.theme === 'light',
        dark: state.theme === 'dark',
      }
    },
  },
})
