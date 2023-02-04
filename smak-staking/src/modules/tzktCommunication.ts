/**
 * @module tzkt-comminication
 * @author Smart-Chain
 * @version 1.0.0
 * This module sends requests to the tzkt indexer API in order to access to information such as bigmap keys or SMAK price
 */

 import { config } from '@/../config/config' // Config
 import dayjs, { Dayjs } from 'dayjs' // Date computation library
 import { StakeData, StakeHistory } from './stakingHistory' // Staking history module
 import lotteryData from '@/modules/lottery-data'
 
 export class tzktCommunication {
   /**
    * This function sends a request to a given url
    * @param {string} url : url to which the request is made
    * @returns {Promise<any>} response of the request in json format if there is any
    */
 
   private async queryTZKT(url: string) {
     let result: any
 
     const response = await fetch(url, {
       method: 'GET',
     })
 
     if (response.ok) {
       result = await response.json()
       return result
     } else return null
   }
 
   /**
    * This function computes the SMAK price thanks to the quipuswap DEX smart contract
    * @returns {Promise<number>} SMAK price
    */
   async computeSMAKPrice() {
     return (await this.queryTZKT('https://smartlink-indexer-api.deployments.smart-chain.fr/v1/pools')).filter((token: any) => token.symbol === "SMAK").pop().last_price_usd.toFixed(4)
   }
 
   /**
    * This function computes the SMAK price variation for a given time period in the configuration
    * @returns {Promise<any>} SMAK price variation object with the sign and the value of the SMAK price variation
    */
   async computeTokenVar() {
     const result = await this.queryTZKT(
       'https://api.tzkt.io/v1/contracts/KT1Gdix8LoDoQng7YqdPNhdP5V7JRX8FqWvM/storage/history?limit=1000'
     )
     let tokenVar = 0
     if (result) {
       let id = 0
 
       // Travel the response until there is a result older than the number of hours given in the config file
       while (
         dayjs()
           .add(-1 * Number(config.DURATION_VARIATION), 'hours')
           .isBefore(dayjs(result[id].timestamp)) &&
         id < result.length - 1
       ) {
         id += 1
       }
       const oldRatio = result[id].value.storage.tez_pool / result[id].value.storage.token_pool
       const currentRatio = result[0].value.storage.tez_pool / result[0].value.storage.token_pool
 
       tokenVar = ((currentRatio - oldRatio) / oldRatio) * 100
     }
     return 0 < tokenVar
       ? { sign: '+', value: '+' + tokenVar.toFixed(2) }
       : { sign: '-', value: tokenVar.toFixed(2) }
   }
 
   /**
    * This function computes the SMAK staking history
    * @returns {Promise<StakeHistory>} staked SMAK value history
    */
   async getStakingHistory(mapNumber: number, stakeHistory: StakeHistory, offset = 0) {
     let no_more_results = false
     const limit = mapNumber === 6240 ? 3504 : 10000 // number of results per query (from 10 to 1000)
 
     // const stakeHistory: StakeHistory = new StakeHistory()
     // Until there is no more results, make calls to the API and add them to the stake history object
     while (!no_more_results) {
       const result = await this.queryTZKT(
         config.TZKTAPI +
           '/v1/bigmaps/updates?bigmap=' +
           mapNumber +
           '&limit=' +
           limit +
           '&offset=' +
           offset
       )
       if (0 < result.length) {
         for (let i = 0; i < result.length; i++) {
           if (result[i].action != 'allocate') {
             stakeHistory.incrementTemp(Number(result[i].content.value))
             const stakeData = new StakeData(result[i].content.key, stakeHistory.getTemp() / 1000)
             stakeHistory.addStakeData(stakeData)
           }
           offset += 1
         }
       }
       no_more_results = result.length < 10000
     }
     return stakeHistory
   }
 
   async getGraph(stakeHistory: StakeHistory) {
     const result = await this.queryTZKT("https://smartlink-indexer-api.deployments.smart-chain.fr/v1/investor/total_stake")
     for (const data of result) {
       stakeHistory.addStakeData(new StakeData(data.timestamp, data.flex_total + data.lock_total))
     }
     return stakeHistory
   }
 
   async getClaimRewardsTransactionsHistory() {
     let no_more_results = false
     const limit = 1000
     let lastId = ''
     let operation: Array<any> = []
 
     while (!no_more_results) {
       const claimRewardEntryPoint = await this.queryTZKT(
         'https://api.tzkt.io/v1/accounts/KT1AEhxRxLkzLiTXhayjq2bZM6jw7mtfdUg2/operations?entrypoint.in=claimRewardFlex&limit=' +
           limit +
           '&lastId=' +
           lastId
       )
       if (claimRewardEntryPoint.length > 0) {
         lastId = claimRewardEntryPoint[claimRewardEntryPoint.length - 1].id
         const result = Object.values(claimRewardEntryPoint).filter(
           (result: any) => result.type != 'origination' && result.status == 'applied'
         )
         operation = operation.concat(result)
       }
       no_more_results = claimRewardEntryPoint.length < limit
     }
 
     return operation
   }
 
   async getFlexPackStorageHistory() {
     let no_more_results = false
     const limit = 10000
     let offset = 0
     let storage: Array<any> = []
 
     while (!no_more_results) {
       const storageHistory = await this.queryTZKT(
         'https://api.tzkt.io/v1/bigmaps/updates?bigmap=6241&limit=' + limit + '&offset=' + offset
       )
       if (storageHistory.length > 0) {
         const result = Object.values(storageHistory).filter(
           (history: any) => history.action != 'allocate'
         )
         storage = storage.concat(result)
         offset += storageHistory.length
       }
       no_more_results = storageHistory.length < limit
     }
 
     return storage
   }
 
   /**
    * This function retrieves a flex reward value if it was claimed with a stake value = 0
    * @param {any} indices: indices in the big maps updates object matching the timestamp when the flex reward was claimed
    * @param {any} storageHistory: full big map updates history
    * @param {any} rewardsTransfer: object with information about the claimRewardFlex call
    * @returns {Array<Number>} indices of the storage state prior to a given update
    */
   getFlexRewardsWithNoStakeValue(
     indices: Array<number>,
     storageHistory: any,
     rewardsTransfer: any
   ) {
     let k = 0
     let quit = false
     let reward = 0
 
     while (!quit || k < indices.length - 1) {
       const index = indices[k]
       if (storageHistory[index].content.value[rewardsTransfer.initiator.address]) {
         if (storageHistory[index].content.value[rewardsTransfer.initiator.address].value == '0') {
           reward = Number(rewardsTransfer.parameter.value.value)
         }
         quit = true
       }
       k += 1
     }
 
     return reward
   }
 
   /**
    * This function retrieves the indices (in the storage updates query) of the storage state prior to a given update
    * @param {any} filteredStorageHistory : object with big map updates history filtered with a given timestamp (there are often more than one update for a given timestamp)
    * @param {any} storageHistory: full big map updates history
    * @returns {Array<Number>} indices of the storage state prior to a given update
    */
   getPastStorageStateIndices(filteredStorageHistory: any, storageHistory: any) {
     let indices: Array<number> = []
     // For each big map update at the given timestamp
     filteredStorageHistory.forEach((obj: any) => {
       // check the previous update
       let index = storageHistory.indexOf(obj) - 1
       // If the previous update does not affect the same entry as the currently updated one
       // check the prior one
       while (storageHistory[index].content.key != obj.content.key) {
         index -= 1
       }
       // else push the index into the array
       indices.push(index)
     })
 
     // Sort the indices in a descendant order, in order to be sure to check the latest one first
     indices = indices.sort((a, b) => b - a)
     return indices
   }
 
   /**
    * This function computes the flex staking rewards redeemed without any stake left
    * @param {string} address : address of a user to filter the queries responses
    * @param {any} claimRewardsTransactionsHistory: tzkt query response of the calls history to the claimFlexRewards entrypoint
    * @param {any} flexPackStorageHistory: tzkt query response of the updates of the userStakeFlexPack bigmap.
    * @returns {Promise<Number>} redeemed flex rewards (total / or by a specified address) without any stake left
    */
   async getRedeemedFlexRewardsWithoutStake(
     claimRewardsTransactionsHistory: any,
     flexPackStorageHistory: any,
     address = ''
   ) {
     const additionnal_query = address == '' ? '' : 'parameter.to=' + address + '&' // If an address is provided in parameters, filter by this address the tzkt query
     let no_more_results = false
     const limit = 1000 // maximum responses that you can get in one request
     let lastId = '' // used for pagination
     let reward = 0
 
     while (!no_more_results) {
       //Querying all transfers made by the smart-contract
       const claimRewardEntryPoint = await this.queryTZKT(
         'https://api.tzkt.io/v1/accounts/KT1AEhxRxLkzLiTXhayjq2bZM6jw7mtfdUg2/operations?' +
           additionnal_query +
           'entrypoint.in=transfer&limit=' +
           limit +
           '&lastId=' +
           lastId
       )
       if (claimRewardEntryPoint.length > 0) {
         lastId = claimRewardEntryPoint[claimRewardEntryPoint.length - 1].id // Getting the lastId of the last response for pagination
         // Filtering in order to have only applied transactions and removing the default "origination" transaction
         const result: any = Object.values(claimRewardEntryPoint).filter(
           (result: any) => result.type != 'origination' && result.status == 'applied'
         )
         result.forEach((value: any) => {
           // Checking if a claimRewardFlex transaction exists with the same transaction hash (meaning that it is a flex reward transfer)
           const claimRewardValue = claimRewardsTransactionsHistory.find(
             (transac: any) => transac.hash == value.hash
           )
 
           if (claimRewardValue) {
             // Checking if there is a userStakeFlexPack bigmap update at the same timestamp than the transfer+claimRewardFlex transaction
             const storageValue = flexPackStorageHistory.filter(
               (data: any) => data.timestamp == value.timestamp
             )
 
             if (storageValue) {
               if (dayjs(value.timestamp).isBefore('2021-08-19T20:09:09.293Z', 'seconds')) {
                 // Getting the indices of the previous update of the big map entry that is updated after the client called claimRewardFlex entrypoint
                 // This enables us to see if the user had a stake value = 0 or not when he called the claimRewardFlex entrypoint
                 // It is an array because several indices might be returned, since there might be more than one storage update for a given timestamp
                 const indices = this.getPastStorageStateIndices(
                   storageValue,
                   flexPackStorageHistory
                 )
 
                 // Getting the redeemed flex rewards that were made when there was no stake value (value=0), if there is any
                 reward += this.getFlexRewardsWithNoStakeValue(
                   indices,
                   flexPackStorageHistory,
                   value
                 )
               }
             }
           }
         })
       }
       no_more_results = claimRewardEntryPoint.length < limit
     }
     return reward
   }
 
   /**
    * This function fetches all the lottery data
    */
   async getLotteryData() {
     const mainData = await this.queryTZKT(
       config.TZKTAPI + '/v1/contracts/' + config.LOTTERY_CONTRACT_ADDRESS + '/storage'
     )
 
     lotteryData.FA12TokenContract = mainData.FA12TokenContract
     lotteryData.ticketsPerRound = Number.parseInt(mainData.limit)
     lotteryData.winningPrize = Number.parseInt(mainData.winning_price) / 1000
     lotteryData.ticketPrice = Number.parseInt(mainData.price) / 1000
     lotteryData.roundNumber = Number.parseInt(mainData.round_num)
     lotteryData.tickets = mainData.tickets
 
     const winnersBigMap = await this.queryTZKT(
       config.TZKTAPI + '/v1/bigmaps/' + mainData.previous_winners + '/keys?limit=10000'
     )
 
     const winningHistory = winnersBigMap.map((entry: any) => {
       return {
         ...entry.value,
         roundNumber: Number.parseInt(entry.key),
         // To test the graph, if no 'user' field in the map :
         //, users:200+Math.floor(Math.random()*300)
       }
     })
 
     lotteryData.winningHistory = winningHistory
     // To test the scrolling lists, if not enough data :
     // [...winningHistory,...winningHistory,...winningHistory,...winningHistory,...winningHistory,...winningHistory,...winningHistory,...winningHistory,...winningHistory,...winningHistory,...winningHistory,...winningHistory,...winningHistory,...winningHistory,...winningHistory];
   }
 }