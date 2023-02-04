import Vue from 'vue'
import VueRouter from 'vue-router'
import Staking from '../views/staking/Staking.vue'
import Lottery from '../views/lottery/Lottery.vue'
import Overview from '../views/dashboard/Dashboard.vue'
import Sandbox from '../views/sandbox/Sandbox.vue'
import Farms from '../views/farms/Farms.vue'
import Track from '../components/Track.vue'
import Charts from '../views/charts/Charts.vue'
import Analytics from '../views/charts/Analytics.vue'
import TopGainersLosers from '../views/charts/TopGainersLosers.vue'
import Watchlist from '../views/charts/Watchlist.vue'
import Dex from '../components/Dex.vue'
import TokenDashboard from '../components/TokenDashboard.vue'
import PoolDashboard from '../components/PoolDashboard.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Overview,
  },
  {
    path: '/play/lottery',
    name: 'Lottery',
    component: Lottery,
  },
  {
    path: '/vortex',
    name: 'Dex',
    component: Dex,
  },
  {
    path: '/track',
    name: 'Track',
    component: Track,
  },
  {
    path: '/earn/farms',
    name: 'Farms',
    component: Farms,
  },
  {
    path: '/charts',
    name: 'Charts',
    component: Charts,
  },
  {
    path: '/charts/analytics',
    name: 'Analytics',
    component: Analytics,
  },
  {
    path: '/charts/top-gainers',
    name: 'TopGainersLosers',
    component: TopGainersLosers,
  },
  {
    path: '/charts/watchlist',
    name: 'Watchlist',
    component: Watchlist,
  },
  {
    path: '/dashboard/token',
    name: 'TokenDashboard',
    component: TokenDashboard,
  },
  {
    path: '/dashboard/pool',
    name: 'PoolDashboard',
    component: PoolDashboard,
  },
  {
    path: '/earn/staking',
    name: 'Staking',
    component: Staking,
  },
  {
    path: '/sandbox',
    name: 'Sandbox',
    component: Sandbox,
  },
  {
    path: '/trade',
    name: 'Trade',
    redirect: '/vortex',
  },
  {
    path: '/play',
    name: 'Play',
    redirect: '/play/lottery',
  },
  {
    path: '/earn',
    name: 'Earn',
    redirect: '/earn/staking',
  },
  {
    path: '*',
    redirect: '/',
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach((to, from, next) => {
  window.scrollTo(0, 0)
  next()
})

export default router
