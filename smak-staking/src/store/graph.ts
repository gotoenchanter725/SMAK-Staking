import { Graph } from '@/modules/timeSeriesGraph'
import { TimeSeries } from '@/modules/timeSeries'
import { ITokenMetadata, emptyMetadata } from '@/modules/contractInterfaces/FA12'

interface GraphInfo {
  amount: string
  date: string
}

interface IGraphState {
  graph: Graph
  graphLoading: boolean
  tokenA: ITokenMetadata
  tokenB: ITokenMetadata
  priceInfo: GraphInfo
}

export const graphState = {
  namespaced: true,
  state: (): IGraphState => ({
    graph: new Graph(new TimeSeries()),
    graphLoading: true,
    tokenA: emptyMetadata,
    tokenB: emptyMetadata,
    priceInfo: { amount: '0', date: '' },
  }),
  mutations: {
    updatePriceInfo: (state: IGraphState, priceInfo: GraphInfo) => (state.priceInfo = priceInfo),
    updateGraph: (state: IGraphState, graph: Graph) => (state.graph = graph),
    updateGraphLoading: (state: IGraphState, graphLoading: boolean) =>
      (state.graphLoading = graphLoading),
    updateTokenA: (state: IGraphState, tokenA: ITokenMetadata) => (state.tokenA = tokenA),
    updateTokenB: (state: IGraphState, tokenB: ITokenMetadata) => (state.tokenB = tokenB),
  },
}
