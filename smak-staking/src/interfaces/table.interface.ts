import { ITokenMetadata } from './token.interface'

export interface ITableHeader {
  spacing?: number
  displayText: string
  key: string
  sortBy?: string
  type?: ETableItemType
  align?: ETableAlignment
}

export interface ITableItem {
  [key: string]: any
  // [key: string]: string | number | Partial<ITableItemPair>[] | ITableItemDirection
}

export interface ITableItemPair {
  text: string
  image: string
}

export interface ITableItemDirection {
  direction: EItemDirection
  value: number
}

export interface ITablePairLink {
  tokens: Partial<ITokenMetadata>[]
  link: string
}

export enum ETableAlignment {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}

export enum ETableItemType {
  TEXT = 'text',
  TEXT_PAIR = 'text-pair',

  NUMBER = 'number',
  PERCENTAGE = 'percentage',
  SHORT_NUMBER = 'short-number',

  PRICE = 'price',
  SHORT_PRICE = 'short-price',

  IMAGE = 'image',
  IMAGE_PAIR = 'image-pair',

  TOKEN = 'token',
  TOKEN_PAIR = 'token-pair',
  TOKEN_PAIR_LINK = 'token-pair-link',
  POOL = 'pool',

  PRICE_DIRECTION = 'price-direction',
  SHORT_PRICE_DIRECTION = 'short-price-direction',
  PERCENTAGE_DIRECTION = 'percentage-direction',

  LINE_CHART = 'line-chart',
}

export enum EItemDirection {
  UP = 'up',
  DOWN = 'down',
}
