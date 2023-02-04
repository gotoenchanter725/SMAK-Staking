import Vue from 'vue'

class TicketsMap {
  [key: string]: string
}

const lotteryData = new Vue({
  data: {
    FA12TokenContract: '',
    ticketPrice: 100,
    ticketsPerRound: 200,
    winningPrize: 19600,
    burnedPerRound: 200,
    roundNumber: 0,
    tickets: new TicketsMap(),
    winningHistory: [{ ticket: -1, winner: '', users: 0, roundNumber: -1 }],
  },
})

export default lotteryData
// "KT1SqBG3L7C9wVMLoJbnPvkwTYpDQ1P3eZDc";
