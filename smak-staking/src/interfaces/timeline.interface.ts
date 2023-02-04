export interface ITimelineItem {
  type: ETimelineItemType
  class?: string
  text?: string
  left?: string
  top?: ITimelinePosition | string
  bottom?: ITimelinePosition | string
}

export enum ETimelineItemType {
  DOT = 'dot',
  TEXT = 'text',
}

interface ITimelinePosition {
  xs: string
  sm: string
}