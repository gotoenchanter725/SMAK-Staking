<template>
  <DefaultLayout id="lottery-view">
    <div v-if="confirming" class="dialog-overlay">
      <div class="alert confirming">
        <moon-loader
          class="mr-3"
          color="white"
          :loading="true"
          :size="20"
          :sizeUnit="px"
        ></moon-loader>
        <div class="text">Confirming...</div>
      </div>
    </div>
    <div v-if="walletError" class="dialog-overlay">
      <div class="alert notsuccessful">
        ⚠️
        <div class="text ml-3">{{ errormsg }}</div>
      </div>
    </div>
    <div v-if="confirmed" class="dialog-overlay">
      <div class="alert confirmation">
        <v-icon dark right> mdi-check-circle-outline </v-icon>
        <div class="text ml-3">{{ action }} successful</div>
      </div>
    </div>

    <Confetti v-if="showWinDialog" />

    <StakingDialog
      :show="showWinDialog"
      :display="showWinDialog"
      title="Congrats! 🎉"
      :theme="theme"
      @showState="(value) => (showWinDialog = false)"
      @closeAll="() => (showWinDialog = false)"
    >
      <h3>
        YOU WON THE ROUND #{{ lotteryData.roundNumber - 1 }} <br />
        WITH <span class="text-primary">19,600 SMAK! </span>
      </h3>

      <div class="font-semibold py-3">
        Your ticket number was matched with the winning number!
      </div>

      <div class="subtle">
        👉 You can now increase your rewards by staking them or simply leave with the loot!
      </div>

      <div class="d-flex">
        <a href="/"
          ><div
            style="font-size:1em !important; margin-right:6px !important; padding: 1.5em; !important "
            class="btn large mt-10"
          >
            Stake Now
          </div></a
        >
        <div
          style="
            margin-left: -20px !important;
            font-size: 1em !important;
            margin-left: 6px !important;
            padding: 1.5em !important;
          "
          class="btn large alt mt-10 flex-grow-1"
          @click="showWinDialog = false"
        >
          I'm ok, thanks
        </div>
      </div>
    </StakingDialog>

    <StakingDialog
      :show="showHistoryDialog"
      :display="showHistoryDialog"
      title="My history"
      :theme="theme"
      @showState="(value) => (showHistoryDialog = value)"
      @closeAll="() => (showHistoryDialog = false)"
      :size="450"
    >
      <div style="font-size: 20px" class="font-semibold subtile mb-6 text-primary">
        Total rounds won: {{ roundsWon.length }}
      </div>

      <div style="margin-left: 20px !important" class="mx-7">
        <table>
          <tr style="text-align: left; font-size: 17px">
            <th width="37%">Round</th>
            <th width="26%">Status</th>
            <th width="33%" style="text-align: right">Prize</th>
          </tr>
        </table>
      </div>

      <div class="nested">
        <div class="scrollable pr-2" style="max-height: 100px; max-height: 138px !important">
          <table class="text-secondary" style="text-align: left">
            <tr v-for="(round, i) in lotteryData.winningHistory" :key="i">
              <td style="text-align: left" width="33%">
                #{{ round.roundNumber.toString().padStart(2, '0') }}
              </td>
              <td style="text-align: left" width="33%">
                {{ round.winner === userAddress ? 'Lucky' : 'Unlucky' }}
              </td>
              <td width="33%" style="text-align: right">
                {{ round.winner === userAddress ? lotteryData.winningPrize : 0 }}
              </td>
            </tr>
          </table>
        </div>
      </div>

      <div class="btn large mt-3" @click="showHistoryDialog = false">Close</div>
    </StakingDialog>

    <v-row :key="loading" v-if="!drawer" justify="space-around" no-gutters>
      <v-col class="staking-dashboard-cols no-gutters">
        <div class="h-layout flex-column-reverse flex-md-row">
          <div
            style="border-radius: 13px !important"
            class="pannel first-col py-2 px-4 d-flex align-center mr-sm-4"
          >
            <div class="label">Tickets left for this round:</div>
            <div class="text-secondary font-semibold">{{ ticketsLeftCount }} Tickets</div>
          </div>
          <div style="border-radius: 13px !important" class="pannel py-2 px-4 d-flex align-center">
            <div class="label">Number of participants:</div>
            <div class="text-primary font-semibold">
              {{ participantsCount }}
            </div>
          </div>
          <v-spacer />

          <div class="ml-md-auto d-flex">
            <div
              class="btn your-history-btn mr-3 mr-md-3 w-50 flex-grow-1"
              :class="!isWalletConnected ? 'disabled' : ''"
              @click="isWalletConnected ? (showHistoryDialog = true) : ''"
            >
              Your history
            </div>
            <v-dialog
              v-if="!isWalletConnected"
              :hide-overlay="!showConnectedWallet"
              transition="fade-transition"
            >
              <template v-slot:activator="{ on }">
                <button
                  v-on="on"
                  @click="connectWallet('beacon')"
                  class="btn alt mr-4 mr-md-0 w-50 flex-grow-1"
                >
                  Unlock wallet
                </button>
              </template>
            </v-dialog>
          </div>
        </div>

        <div class="h-layout big">
          <div class="v-layout first-col mr-md-4 d-flex flex-column">
            <div class="pannel pa-4">
              <div class="d-flex align-center">
                <div class="pannel-header">Buy tickets</div>
                <v-spacer />
                <div class="font-semibold" style="font-size: 1.1em">
                  <span class="text-primary">Current round:</span>
                  #{{ lotteryData.roundNumber.toLocaleString('en-US') }}
                </div>
              </div>
              <div
                style="font-size: 17px;
    border: solid;
    margin-top: 13px;
    margin-bottom: 21px;
    width: 10em;
    text-align: center;
    padding: 4px;
    border-radius: 11px;
    margin-left: -6px;
    color: white;
    border-width: 1px;
    background-color: rgb(117 123 148 / 50%);
    border-color: #ffffff17;
    flex-direction: row;
}"
                class="text-primary font-semibold"
              >
                1 ticket = {{ lotteryData.ticketPrice }} SMAK
              </div>
              <BuyTickets :userBalance="userBalance" @buy="buyTickets" />
            </div>
            <div style="padding: 15px !important; margin-top: -5px" class="pannel pa-4">
              A winner is picked once all 200 tickets have been purchased, after which a new lottery
              round will start.
            </div>
          </div>

          <div class="v-layout flex-grow-1 mt-5 mt-md-0">
            <div class="pannel pt-4 flex-grow-1">
              <div class="pannel-header section-header-on-mobile">My lottery details</div>
              <div class="staking-details-info mb-1">
                <div>
                  <div style="margin-top: 29px" class="staking-details-info-title">SMAK spent</div>
                  <div
                    style="margin-bottom: 20px; font-size: 23px"
                    class="staking-details-info-value"
                  >
                    {{ userSpentSmakOnLottery.toLocaleString('en-US') }}
                  </div>
                </div>
                <div style="margin-top: 35px" class="separator"></div>
                <div>
                  <div style="margin-top: 29px" class="staking-details-info-title">
                    Chance of winning
                  </div>
                  <div
                    style="margin-bottom: 20px; font-size: 23px"
                    class="staking-details-info-value"
                  >
                    {{ Number(chancesOfWinning * 100).toFixed(1) }}%
                  </div>
                </div>
                <div style="margin-top: 35px" class="separator"></div>
                <div>
                  <div style="margin-top: 29px" class="staking-details-info-title">
                    Tickets per round
                  </div>
                  <div
                    style="margin-bottom: 20px; font-size: 23px"
                    class="staking-details-info-value"
                  >
                    {{ lotteryData.ticketsPerRound }}
                  </div>
                </div>
                <div style="margin-top: 35px" class="separator"></div>
                <div>
                  <div style="margin-top: 29px" class="staking-details-info-title">My tickets</div>
                  <div
                    style="margin-bottom: 20px; font-size: 23px"
                    class="staking-details-info-value"
                  >
                    {{ userTickets.length }}
                  </div>
                </div>
              </div>
            </div>

            <div class="pannel pa-4 pb-3 pt-4 d-flex">
              <div class="flex-grow-1 d-flex align-center flex-column">
                <img width="27%" src="@/assets/Bell.png" />
                <div class="staking-details-info-title">Total lottery rounds</div>
                <div class="staking-details-info-value">
                  {{ totalLotteryRounds.toLocaleString('en-US') }}
                </div>
              </div>
              <div class="separator big"></div>
              <div class="flex-grow-1 d-flex align-center flex-column">
                <img width="27%" src="@/assets/Smak.png" />
                <div class="staking-details-info-title">Total lottery gains</div>
                <div class="staking-details-info-value">
                  {{ totalLotteryGains.toLocaleString('en-US') }}
                </div>
              </div>
              <div class="separator big"></div>
              <div class="flex-grow-1 d-flex align-center flex-column">
                <img width="27%" src="@/assets/Flame.png" />
                <div class="staking-details-info-title">Total SMAK Burned</div>
                <div class="staking-details-info-value">
                  {{ totalLotteryBurned.toLocaleString('en-US') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="my-9 my-md-0"></div>

        <div class="d-flex align-center pt-9 pt-md-0">
          <div style="padding-top: 30px; padding-bottom: 15px" class="section-head">
            Lottery overview
          </div>
          <v-spacer />
          <ContractAddress class="hide-on-mobile" />
        </div>

        <div class="h-layout">
          <div class="pannel pa-5 pt-8 hide-on-mobile mr-sm-4" style="max-width: 700px">
            <div class="pannel-header">Pool size</div>

            <div class="d-flex justify-space-between">
              <div
                class="d-flex font-semibold mb-3"
                style="font-size: 0.9em;margin-top: 25px;
    padding-bottom: 32px;
}"
              >
                <div class="d-flex align-center mr-4">
                  <div
                    class="rounded-box mr-2 mt-1"
                    style="background-color: #7b78ff; position: relative; top: -2px"
                  ></div>
                  No. of participants
                </div>

                <div class="d-flex align-center">
                  <div
                    class="rounded-box mr-2 mt-1"
                    style="background-color: #fd86ff; position: relative; top: -2px"
                  ></div>
                  Average spent per round
                </div>
              </div>

              <div class="d-flex flex-column">
                <p class="text-secondary-300 font-semibold mb-1">Show Last</p>
                <SelectSettings
                  class="ml-auto"
                  :value="numShownLottery"
                  :options="shownLotteryOptions"
                  @input="onShownInput"
                />
              </div>
            </div>

            <LotteryChart :showLast="numShownLottery" />
          </div>

          <div class="d-flex flex-column flex-grow-1">
            <div class="pannel flex-grow-0 mb-4">
              <div class="d-flex align-center">
                <div class="pannel-header" style="margin-top: 13px">
                  Round #{{ lotteryData.roundNumber - 1 }}
                </div>
                <v-spacer />
                <div class="subtle">
                  {{
                    new Date().toLocaleString('en-US', {
                      dateStyle: 'medium',
                    })
                  }}
                </div>
              </div>

              <div
                style="padding-bottom: 50px; padding-left: 10px; line-height: 40px"
                class="d-flex"
              >
                <div class="centered-col align-start flex-grow-1 font-semibold">
                  <div>Total prize 🏆</div>
                  <div class="pannel-header">
                    {{ lotteryData.winningPrize.toLocaleString('en-US') }}
                    SMAK
                  </div>
                </div>

                <div
                  style="position: relative; top: 33px; right: 49px"
                  class="separator mr-3"
                ></div>

                <div class="centered-col align-start flex-grow-1 font-semibold">
                  <div>Winning number 🎉</div>
                  <div style="font-size: 1.3rem">
                    {{ previousRound ? previousRound.ticket : '' }}
                  </div>
                </div>
              </div>
            </div>

            <div class="pannel">
              <div
                style="padding-left: 5px; padding-top: 10px; position: relative; top: 3px"
                class="pannel-header"
              >
                Winning number history
              </div>
              <div class="pr-3 scrollable" style="width: 100%; max-height: 300px; margin-top: 20px">
                <table style="width: 100%">
                  <tr class="text-primary" style="text-align: left">
                    <th style="padding-bottom: 10px">Winner</th>
                    <th style="padding-bottom: 10px"># Number</th>
                    <th style="text-align: right; padding-bottom: 10px">Round</th>
                  </tr>

                  <tr v-for="(round, i) in lotteryData.winningHistory.slice().reverse()" :key="i" class="subtle">
                    <td class="ellipse">
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <span v-on="on" v-bind="attrs">{{ round.winner }}</span>
                        </template>
                        {{ round.winner }}
                      </v-tooltip>
                    </td>
                    <td style="text-align: right; width: 80px">
                      {{ round.ticket }}
                    </td>
                    <td style="text-align: right">
                      {{ round.roundNumber }}
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
    <AppFooter />
  </DefaultLayout>
</template>

<script lang="ts" src="./Lottery.ts"></script>
<style lang="scss" src="./lottery.scss"></style>
