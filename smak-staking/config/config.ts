// config.js
import dotenv from 'dotenv'
import path from 'path'


export const config = {
  // Environment variables
  NODE_ENV: process.env.NODE_ENV || 'mainnet',

  // Tezos Network variables
  RPC_ADDRESS: process.env.VUE_APP_RPC_ADDRESS || 'https://tezos-prod.cryptonomic-infra.tech',
  SMART_CONTRACT_ADDRESS:
    process.env.VUE_APP_SMART_CONTRACT_ADDRESS || 'KT1TR4qabnDU6aAUym6nauSGaRwJpoKU3efP',
  DEX_SMART_CONTRACT_ADDRESS:
    process.env.VUE_APP_DEX_SMART_CONTRACT_ADDRESS || 'KT1PwnTa2f1Uac958RFTk6i6EecPNgJrtHKv',
  DEX_FA2_SMART_CONTRACT_ADDRESS:
    process.env.VUE_APP_DEX_FA2_SMART_CONTRACT_ADDRESS || 'KT1RZ2VVNHN2SYtgVgwT4Lo4Go5fAYVkxuQn',
  VUE_APP_INDEXER_ROOT_URL:
    process.env.VUE_APP_INDEXER_ROOT_URL || 'https://api.granadanet.tzkt.io',

  LOTTERY_CONTRACT_ADDRESS:
    process.env.VUE_APP_LOTTERY_CONTRACT_ADDRESS || 'KT192nuuX8TLqsBK8XQo5e5uB2GLjLwNkoNy',
  CONTRACT_FA12TOKEN_CONTRACT_ADDRESS:
    process.env.VUE_APP_CONTRACT_FA12TOKEN_CONTRACT_ADDRESS ||
    'KT1TwzD6zV3WeJ39ukuqxcfK2fJCnhvrdN1X',
  TOTAL_SUPPLY: process.env.VUE_APP_TOTAL_SUPPLY || 896083333000,
  CIRCULATING_SUPPLY: process.env.VUE_APP_CIRCULATING_SUPPLY || 389521127,
  BURN_ADDRESS: process.env.VUE_APP_BURN_ADDRESS || 'tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU',
  TZKTAPI: process.env.VUE_APP_TZKTAPI || 'https://api.tzkt.io',
  DURATION_VARIATION: process.env.VUE_APP_DURATION_VARIATION || 8,
  PRICE: Number(process.env.VUE_APP_PRICE) || 1000000,
  BETTER_CALL_API: process.env.VUE_APP_BETTER_CALL_API || 'https://api.better-call.dev',
}
