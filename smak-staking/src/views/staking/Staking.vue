<template>
  <DefaultLayout>
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

    <div v-if="confirmed" class="dialog-overlay">
      <div class="alert confirmation">
        <v-icon dark right> mdi-check-circle-outline </v-icon>
        <div class="text ml-3">{{ action }} successful</div>
      </div>
    </div>

    <v-row
      :key="loading"
      v-if="!drawer"
      justify="space-around"
      no-gutters
      class="staking-page"
      style="background: var(--background)"
    >
      <v-col class="staking-dashboard-cols no-gutters">
        <div>
          <div class="h-layout big">
            <div class="pannel px-5 stake mr-sm-5">
              <div class="stake-options scrollbar-none">
                <div
                  v-for="stakeOption in stakingOptionsMap.getStakeOptionsMap()"
                  :key="Number(stakeOption[0])"
                >
                  <div
                    @click="loadpack(stakeOption[0])"
                    class="stake-options-item"
                    :class="{ selected: packId == stakeOption[0] }"
                  >
                    {{ stakeOption[1].stakingPerecentage }}%
                    {{ !mobileXsAndMoreThan3Packs ? 'APR' : '' }}
                  </div>
                </div>
              </div>
              <div class="d-flex stake-smak-with-tag">
                <img
                  style="margin-left: 6px"
                  alt=""
                  class="mr-2"
                  width="25"
                  :src="require('../../assets/ticker.svg')"
                />
                <div class="stake-smak">Stake SMAK</div>

                <v-spacer />

                <div class="flexible-tag">
                  {{
                    packId == 0
                      ? 'Flexible'
                      : Math.floor(selectedPackDuration / (3600 * 24)) + ' Day Lockup'
                  }}
                </div>
              </div>
              <v-row justify="space-between">
                <v-col cols="8">
                  <div class="balance-smak">
                    Balance: {{ Number(userBalance).toLocaleString('en-US') }} SMAK
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="stake-max" style="text-align: right" @click="useMax()">
                    <u style="cursor: pointer">Use Max</u>
                  </div>
                </v-col>
              </v-row>
              <div class="smak-input-wrapper">
                <input
                  type="text"
                  id="name"
                  name="name"
                  autocomplete="off"
                  placeholder="0"
                  v-model="amountToStake"
                  onkeypress="return (event.charCode >= 48 && event.charCode <= 57) || event.charCode == 46"
                  v-bind="amounToStake"
                />
                SMAK
              </div>

              <div v-if="isStakeValid" class="minimum-value" style="height: 24px">
                Min. {{ minPrice }} SMAK ~ {{ Number(minPrice * smakPrice).toFixed(4) }} USD
              </div>

              <v-row v-if="!isStakeValid">
                <v-col>
                  <div style="font-size: 12px; margin-left: 7px" class="error-msg">
                    {{ errorMsgStake }}
                  </div>
                </v-col>
                <v-col>
                  <div class="minimum-value">
                    Min. {{ minPrice }} SMAK ~ {{ Number(minPrice * smakPrice).toFixed(4) }} USD
                  </div>
                </v-col>
              </v-row>

              <div
                v-if="!isWalletConnected && mobile"
                class="connect-wallet-btn"
                @click="connectWallet('beacon')"
              >
                Connect wallet
              </div>
              <v-dialog
                v-if="!isWalletConnected && !mobile"
                :hide-overlay="!show"
                transition="fade-transition"
              >
                <template v-slot:activator="{ on }">
                  <div v-on="on" @click="connectWallet('beacon')" class="connect-wallet-btn">
                    Connect wallet
                  </div>
                </template>
              </v-dialog>

              <staking-dialog
                :show="stakeDialog"
                @showState="stakeDialog = $event"
                v-if="isWalletConnected & isStakeValid & (amountToStake != '')"
                classname="connect-wallet-btn connected"
                buttonname="Stake now"
                title="Stake SMAK"
                :theme="theme"
                size="500"
              >
                <div class="staking header">
                  {{ packId == 0 ? 'Flexible' : 'Locked' }} staking
                  {{
                    packId == 0
                      ? ''
                      : '- ' + Math.floor(selectedPackDuration / (3600 * 24)) + ' days'
                  }}
                </div>
                <div class="staking-info">
                  <v-row justify="space-between" class="item">
                    <v-col class="labels">
                      <div class="total-locked-amount">Total Locked Amount</div>
                    </v-col>
                    <v-col class="results">
                      <div class="total-locked-amount">
                        {{ amountToStake.toLocaleString('en-US') }} SMAK
                      </div>
                    </v-col>
                  </v-row>
                  <v-row justify="space-between" class="item">
                    <v-col class="labels"> Stake Date </v-col>
                    <v-col class="results">
                      {{ datenow }}
                    </v-col>
                  </v-row>

                  <v-row justify="space-between" class="item">
                    <v-col class="labels">
                      <div class="interest-period">Reward Period</div>
                    </v-col>
                    <v-col class="results">
                      {{ packId == 0 ? '7' : Math.floor(selectedPackDuration / (3600 * 24)) }}
                      days<br />
                    </v-col>
                  </v-row>
                  <v-row v-if="packId != 0" justify="space-between" class="item">
                    <v-col class="labels"> Redemption Date </v-col>
                    <v-col class="results">
                      {{ selectedPackRedemptionDate }}
                    </v-col>
                  </v-row>
                  <v-row justify="space-between" class="item">
                    <v-col class="labels">
                      APR ({{
                        packId == 0
                          ? flexRewardPeriod
                          : Math.floor(selectedPackDuration / (3600 * 24))
                      }}
                      days)
                    </v-col>
                    <v-col class="results">
                      {{
                        packId == 0
                          ? (selectedPackAPY * (flexRewardPeriod / 365)).toFixed(2)
                          : selectedPackAPY
                      }}%
                    </v-col>
                  </v-row>
                  <v-row justify="space-between" class="item">
                    <v-col class="labels"> Estimated rewards </v-col>
                    <v-col class="results">
                      {{
                        packId == 0
                          ? (
                              (flexRewardPeriod / 365) *
                              amountToStake *
                              (selectedPackAPY / 100)
                            ).toFixed(3)
                          : Number(
                              (
                                (selectedPackDuration / 31536000) *
                                amountToStake *
                                (selectedPackAPY / 100)
                              ).toFixed(3)
                            )
                      }}<br />
                    </v-col>
                  </v-row>
                </div>

                <div class="btn large mt-10 confirm-stake" @click="stake()">Confirm</div>
              </staking-dialog>
              <div
                v-if="isWalletConnected & (!isStakeValid | (amountToStake == ''))"
                class="connect-wallet-btn connected disabled"
              >
                Stake now
              </div>
            </div>

            <div class="pannel staking-details-pannel transparent-on-mobile">
              <div class="my-staking-details section-header-on-mobile">My staking details</div>
              <div class="staking-details-info">
                <div>
                  <div class="staking-details-info-title">My SMAK Balance</div>
                  <div class="staking-details-info-value">
                    {{ userBalance.toLocaleString('en-US') }} SMAK
                  </div>
                </div>
                <div class="separator"></div>
                <div>
                  <div class="staking-details-info-title">Total SMAK Staked</div>
                  <div class="staking-details-info-value">
                    {{ Number(userTotalStakedSMAK / 1000).toLocaleString('en-US') }} SMAK
                  </div>
                </div>
                <div class="separator"></div>
                <div>
                  <div class="staking-details-info-title">Total SMAK Earned</div>
                  <div class="staking-details-info-value">
                    {{ Number(userRedeemedRewards / 1000).toLocaleString('en-US') }} SMAK
                  </div>
                </div>
              </div>

              <div class="stacking-details-actions">
                <div class="stacking-details-action-wrapper">
                  <img
                    draggable="false"
                    class="staking-details-img"
                    :src="require('../../assets/Spark.png')"
                  />
                  <div v-if="!isWalletConnected" class="staking-details-btn disabled">
                    <div class="staking-details">Staking details</div>
                  </div>
                  <staking-dialog-large
                    :show="dialog1[0]"
                    @showState="dialog1 = [$event, false, false]"
                    @newPackInfo="infoPack = $event"
                    title="My staking details"
                    classname="staking-details"
                    :theme="theme"
                    :display="dialog1[0] & !dialog2[0] & !dialog3[0]"
                    :opacity="0.74"
                    persistent
                    :retain-focus="false"
                    buttonname="Staking details"
                    :packInfo="-1"
                    v-if="isWalletConnected"
                  >
                    <div class="text staking-options-recap">
                      <div class="stake-options tiny">
                        <div
                          class="stake-options-item"
                          v-for="menuOption in dialogMenuOptions"
                          :key="menuOption[0]"
                          :class="{ selected: infoPack === menuOption[0] }"
                          @click="changeInfoPack(menuOption[0])"
                        >
                          {{ menuOption[1] }}
                        </div>
                      </div>

                      <table>
                        <thead>
                          <tr>
                            <th class="whitespace-nowrap">{{ mobile ? 'Amount' : 'Total amount' }}</th>
                            <th>Duration</th>
                            <th v-if="!mobileS">Rewards</th>
                            <th>APR</th>
                            <th class="button-column unstake-title">Unstake</th>
                            <th class="button-column redeem-title">Redeem</th>
                          </tr>
                        </thead>

                        <tbody>
                          <!-- TODO : v-for sur le tr -->
                          <tr
                            v-for="flexDetails in userStakeFlexDetails.getStakingDetailsMap()"
                            :key="flexDetails[0]"
                          >
                            <td v-if="(infoPack == -1) | (infoPack == 0)">
                              {{ Number(flexDetails[1].amount / 1000).toLocaleString('en-US') }}
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 0)">
                              {{ flexDetails[1].duration }} days
                            </td>
                            <td v-if="((infoPack == -1) | (infoPack == 0)) & !mobileS">
                              {{
                                Number(Math.floor(flexDetails[1].interest) / 1000).toLocaleString(
                                  'en-US'
                                )
                              }}
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 0)">
                              {{ flexDetails[1].percentage }}%
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 0)" class="button-column">
                              <staking-dialog
                                @showState="dialog2 = [$event, false, false]"
                                @closeAll="closeAllDialogs = $event"
                                title="Unstake my SMAK"
                                classname="btn tiny btn-warning"
                                buttonname="Unstake"
                                :opacity="0.74"
                                :theme="theme"
                              >
                                <div class="header">Details</div>
                                <div class="details">
                                  <div>APR: {{ flexDetails[1].percentage }}% Est.</div>
                                  <div>
                                    Rewards:
                                    {{
                                      Number(
                                        Math.floor(flexDetails[1].interest) / 1000
                                      ).toLocaleString('en-US')
                                    }}
                                    SMAK
                                  </div>
                                  <div>
                                    Duration: {{ flexDetails[1].beginDate }} -
                                    {{ flexDetails[1].endDate }}
                                  </div>
                                </div>

                                <div class="d-flex">
                                  <div>Redemption amount</div>
                                  <v-spacer />
                                  <div class="gray">
                                    Available:
                                    {{
                                      Number(flexDetails[1].amount / 1000).toLocaleString('en-US')
                                    }}
                                    SMAK
                                  </div>
                                </div>

                                <div class="input-wrapper">
                                  <input
                                    type="text"
                                    placeholder="0"
                                    width="auto"
                                    class="input-txts"
                                    v-bind="amountToUnstake"
                                    v-model="amountToUnstake"
                                    onkeypress="return (event.charCode >= 48 && event.charCode <= 57) || event.charCode == 46"
                                  />
                                  <div class="btn my-0" @click="unstakeMax(flexDetails[1].amount)">
                                    MAX
                                  </div>
                                </div>

                                <div class="d-flex mt-3">
                                  <div>Redemption date</div>
                                  <v-spacer />
                                  <div>{{ datenow }}</div>
                                </div>
                                <div class="error-msg mt-4">
                                  {{ errorMsgUnstakeRedeem }}
                                </div>
                                <div
                                  :class="
                                    isUnstakeValid &
                                    (amountToUnstake != '') &
                                    (amountToUnstake != 0)
                                      ? 'btn large mt-5'
                                      : 'btn large disabled mt-5'
                                  "
                                  @click="unstakeFlex(amountToUnstake)"
                                >
                                  Unstake
                                </div>
                              </staking-dialog>
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 0)" class="button-column">
                              <staking-dialog
                                @showState="dialog2 = [$event, false, false]"
                                @closeAll="closeAllDialogs = $event"
                                title="Redeem"
                                classname="btn tiny btn-success"
                                buttonname="Redeem"
                                :opacity="0.74"
                                :theme="theme"
                              >
                                <div class="redeem header">Details</div>
                                <div class="redeem details">
                                  <div>APR: {{ flexDetails[1].percentage }}%</div>
                                  <div>
                                    Est. Rewards:
                                    {{
                                      Number(
                                        Math.floor(flexDetails[1].interest) / 1000
                                      ).toLocaleString('en-US')
                                    }}
                                    SMAK
                                  </div>
                                  <div>Start date: {{ flexDetails[1].beginDate }}</div>
                                </div>
                                <div class="redemption-amount">
                                  <div class="label">Redemption amount</div>
                                  <div class="amount mb-7">
                                    {{
                                      Number(
                                        Math.floor(flexDetails[1].interest) / 1000
                                      ).toLocaleString('en-US')
                                    }}
                                    SMAK
                                  </div>
                                </div>
                                <div class="d-flex mt-3 ml-4">
                                  <div class="mr-4">Redemption date</div>
                                  <div>{{ datenow }}</div>
                                </div>
                                <div class="error-msg mt-4">
                                  {{ errorMsgUnstakeRedeem }}
                                </div>
                                <div class="btn large mt-5" @click="redeemFlexReward">Redeem</div>
                              </staking-dialog>
                            </td>
                          </tr>
                          <tr
                            v-for="lockDetails in userStakeLockDetails.getStakingDetailsMap()"
                            :key="lockDetails[0]"
                          >
                            <td v-if="(infoPack == -1) | (infoPack == 1)">
                              {{ Number(lockDetails[1].amount / 1000).toLocaleString('en-US') }}
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 1)">
                              {{ lockDetails[1].duration }} /
                              {{ lockDetails[1].totalDuration }} days
                            </td>
                            <td v-if="((infoPack == -1) | (infoPack == 1)) & !mobileS">
                              {{
                                Number(Math.floor(lockDetails[1].interest) / 1000).toLocaleString(
                                  'en-US'
                                )
                              }}
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 1)">
                              {{ lockDetails[1].percentage }}%
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 1)" class="button-column">
                              <staking-dialog
                                v-if="!lockDetails[1].unlock"
                                @showState="dialog2 = [$event, false, false]"
                                @closeAll="closeAllDialogs = $event"
                                :display="dialog2[0] & !dialog3[0]"
                                title="Unstake my SMAK"
                                classname="btn tiny btn-warning"
                                buttonname="Unstake"
                                :opacity="0.74"
                                :theme="theme"
                              >
                                <div class="redeem header">Details</div>
                                <div class="redeem details">
                                  <div>APR: {{ lockDetails[1].percentage }}%</div>
                                  <div>
                                    Est. Rewards:
                                    {{
                                      lockDetails[1].unlock
                                        ? Number(
                                            Math.floor(lockDetails[1].interest) / 1000
                                          ).toLocaleString('en-US')
                                        : 0
                                    }}
                                    SMAK
                                  </div>
                                  <div>
                                    Duration: {{ lockDetails[1].beginDate }} -
                                    {{ lockDetails[1].endDate }}
                                  </div>
                                </div>
                                <div class="redemption-amount">
                                  <div class="label">Redemption amount</div>
                                  <div class="amount mb-7">
                                    {{
                                      lockDetails[1].unlock
                                        ? (
                                            Number(Math.floor(lockDetails[1].interest) / 1000) +
                                            Number(lockDetails[1].amount / 1000)
                                          ).toLocaleString('en-US')
                                        : Number(lockDetails[1].amount / 1000)
                                    }}
                                    SMAK
                                  </div>
                                </div>
                                <div class="d-flex mt-3 ml-4">
                                  <div class="mr-4">Redemption date</div>
                                  <div>{{ datenow }}</div>
                                </div>

                                <staking-dialog
                                  @showState="dialog3 = [$event, false, false]"
                                  @closeAll="closeAllDialogs = $event"
                                  classname="btn large mt-5"
                                  buttonname="Unstake"
                                  title="Unstake my SMAK"
                                  :theme="theme"
                                  size="500"
                                  :opacity="0.74"
                                >
                                  <div class="error-box">
                                    <div class="header">
                                      The duration of this staking program is
                                      {{ lockDetails[1].totalDuration }} days
                                    </div>
                                    <div class="my-3">
                                      ⚠️ If you redeem your SMAK in advance you will lose your
                                      rewards.
                                    </div>
                                    <div class="details text-error">
                                      <div>Redemption date: {{ datenow }}</div>
                                      <div>
                                        Est. Rewards:
                                        {{
                                          Number(
                                            Math.floor(lockDetails[1].interest) / 1000
                                          ).toLocaleString('en-US')
                                        }}
                                        SMAK
                                      </div>
                                      <div>
                                        Received Rewards:
                                        {{
                                          Number(
                                            lockDetails[1].unlock
                                              ? Math.floor(lockDetails[1].interest) / 1000
                                              : 0
                                          ).toLocaleString('en-US')
                                        }}
                                        SMAK
                                      </div>
                                    </div>
                                  </div>
                                  <div class="error-msg mt-4">
                                    {{ errorMsgUnstakeRedeem }}
                                  </div>
                                  <div
                                    class="btn large mt-5 btn-error"
                                    @click="unstakeLock(lockDetails[0][0], lockDetails[0][1])"
                                  >
                                    Unstake
                                  </div>
                                </staking-dialog>
                              </staking-dialog>
                              <staking-dialog
                                v-if="lockDetails[1].unlock"
                                @showState="dialog2 = [$event, false, false]"
                                @closeAll="closeAllDialogs = $event"
                                :display="dialog2[0] & !dialog3[0]"
                                title="Unstake my SMAK"
                                classname="btn tiny btn-success"
                                buttonname="Unstake"
                                :opacity="0.74"
                                :theme="theme"
                              >
                                <div class="redeem header">Details</div>
                                <div class="redeem details">
                                  <div>APR: {{ lockDetails[1].percentage }}%</div>
                                  <div>
                                    Est. Rewards:
                                    {{
                                      lockDetails[1].unlock
                                        ? Number(
                                            Math.floor(lockDetails[1].interest) / 1000
                                          ).toLocaleString('en-US')
                                        : 0
                                    }}
                                    SMAK
                                  </div>
                                  <div>
                                    Duration: {{ lockDetails[1].beginDate }} -
                                    {{ lockDetails[1].endDate }}
                                  </div>
                                </div>
                                <div class="redemption-amount">
                                  <div class="label">Redemption amount</div>
                                  <div class="amount mb-7">
                                    {{
                                      lockDetails[1].unlock
                                        ? (
                                            Number(Math.floor(lockDetails[1].interest) / 1000) +
                                            Number(lockDetails[1].amount / 1000)
                                          ).toLocaleString('en-US')
                                        : Number(lockDetails[1].amount / 1000)
                                    }}
                                    SMAK
                                  </div>
                                </div>
                                <div class="d-flex mt-3 ml-4">
                                  <div class="mr-4">Redemption date</div>
                                  <div>{{ datenow }}</div>
                                </div>
                                <div
                                  class="btn large mt-5"
                                  @click="unstakeLock(lockDetails[0][0], lockDetails[0][1])"
                                >
                                  Unstake
                                </div>
                              </staking-dialog>
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 1)" class="button-column">
                              <div class="btn tiny btn-disabled">Redeem</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </staking-dialog-large>
                </div>
                <div class="stacking-details-action-wrapper">
                  <img
                    draggable="false"
                    class="staking-details-img"
                    :src="require('../../assets/Star.png')"
                  />
                  <!-- <div class="staking-details-btn">
                    <div class="flexible-staking">Flexible staking</div>
                  </div> -->
                  <div v-if="!isWalletConnected" class="staking-details-btn disabled">
                    <div class="flexible-staking">Flexible staking</div>
                  </div>
                  <staking-dialog-large
                    :show="dialog1[1]"
                    @showState="dialog1 = [false, $event, false]"
                    @newPackInfo="infoPack = $event"
                    title="My staking details"
                    classname="flexible-staking"
                    :theme="theme"
                    :display="dialog1[1] & !dialog2[1] & !dialog3[1]"
                    :opacity="0.74"
                    persistent
                    :retain-focus="false"
                    buttonname="Flexible staking"
                    :packInfo="0"
                    v-if="isWalletConnected"
                  >
                    <div class="text staking-options-recap">
                      <div class="stake-options tiny">
                        <div
                          class="stake-options-item"
                          v-for="menuOption in dialogMenuOptions"
                          :key="menuOption[0]"
                          :class="{ selected: infoPack === menuOption[0] }"
                          @click="changeInfoPack(menuOption[0])"
                        >
                          {{ menuOption[1] }}
                        </div>
                      </div>

                      <table>
                        <thead>
                          <tr>
                            <th class="whitespace-nowrap">{{ mobile ? 'Amount' : 'Total amount' }}</th>
                            <th>Duration</th>
                            <th v-if="!mobileS">Rewards</th>
                            <th>APR</th>
                            <th class="button-column unstake-title">Unstake</th>
                            <th class="button-column redeem-title">Redeem</th>
                          </tr>
                        </thead>

                        <tbody>
                          <!-- TODO : v-for sur le tr -->
                          <tr
                            v-for="flexDetails in userStakeFlexDetails.getStakingDetailsMap()"
                            :key="flexDetails[0]"
                          >
                            <td v-if="(infoPack == -1) | (infoPack == 0)">
                              {{ Number(flexDetails[1].amount / 1000).toLocaleString('en-US') }}
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 0)">
                              {{ flexDetails[1].duration }} days
                            </td>
                            <td v-if="((infoPack == -1) | (infoPack == 0)) & !mobileS">
                              {{
                                Number(Math.floor(flexDetails[1].interest) / 1000).toLocaleString(
                                  'en-US'
                                )
                              }}
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 0)">
                              {{ flexDetails[1].percentage }}%
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 0)" class="button-column">
                              <staking-dialog
                                @showState="dialog2 = [false, $event, false]"
                                @closeAll="closeAllDialogs = $event"
                                title="Unstake my SMAK"
                                classname="btn tiny btn-warning"
                                buttonname="Unstake"
                                :opacity="0.74"
                                :theme="theme"
                              >
                                <div class="header">Details</div>
                                <div class="details">
                                  <div>APR: {{ flexDetails[1].percentage }}% Est.</div>
                                  <div>
                                    Rewards:
                                    {{
                                      Number(
                                        Math.floor(flexDetails[1].interest) / 1000
                                      ).toLocaleString('en-US')
                                    }}
                                    SMAK
                                  </div>
                                  <div>
                                    Duration: {{ flexDetails[1].beginDate }} -
                                    {{ flexDetails[1].endDate }}
                                  </div>
                                </div>

                                <div class="d-flex">
                                  <div>Redemption amount</div>
                                  <v-spacer />
                                  <div class="gray">
                                    Available:
                                    {{
                                      Number(flexDetails[1].amount / 1000).toLocaleString('en-US')
                                    }}
                                    SMAK
                                  </div>
                                </div>

                                <div class="input-wrapper">
                                  <input
                                    type="text"
                                    placeholder="0"
                                    width="auto"
                                    class="input-txts"
                                    v-bind="amountToUnstake"
                                    v-model="amountToUnstake"
                                    onkeypress="return (event.charCode >= 48 && event.charCode <= 57) || event.charCode == 46"
                                  />
                                  <div class="btn my-0" @click="unstakeMax(flexDetails[1].amount)">
                                    MAX
                                  </div>
                                </div>

                                <div class="d-flex mt-3">
                                  <div>Redemption date</div>
                                  <v-spacer />
                                  <div>{{ datenow }}</div>
                                </div>
                                <div class="error-msg mt-4">
                                  {{ errorMsgUnstakeRedeem }}
                                </div>
                                <div
                                  :class="
                                    isUnstakeValid &
                                    (amountToUnstake != '') &
                                    (amountToUnstake != 0)
                                      ? 'btn large mt-5'
                                      : 'btn large disabled mt-5'
                                  "
                                  @click="unstakeFlex(amountToUnstake)"
                                >
                                  Unstake
                                </div>
                              </staking-dialog>
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 0)" class="button-column">
                              <staking-dialog
                                @showState="dialog2 = [false, $event, false]"
                                @closeAll="closeAllDialogs = $event"
                                title="Redeem"
                                classname="btn tiny btn-success"
                                buttonname="Redeem"
                                :opacity="0.74"
                                :theme="theme"
                              >
                                <div class="redeem header">Details</div>
                                <div class="redeem details">
                                  <div>APR: {{ flexDetails[1].percentage }}%</div>
                                  <div>
                                    Est. Rewards:
                                    {{
                                      Number(
                                        Math.floor(flexDetails[1].interest) / 1000
                                      ).toLocaleString('en-US')
                                    }}
                                    SMAK
                                  </div>
                                  <div>Start date: {{ flexDetails[1].beginDate }}</div>
                                </div>
                                <div class="redemption-amount">
                                  <div class="label">Redemption amount</div>
                                  <div class="amount mb-7">
                                    {{
                                      Number(
                                        Math.floor(flexDetails[1].interest) / 1000
                                      ).toLocaleString('en-US')
                                    }}
                                    SMAK
                                  </div>
                                </div>
                                <div class="d-flex mt-3 ml-4">
                                  <div class="mr-4">Redemption date</div>
                                  <div>{{ datenow }}</div>
                                </div>
                                <div class="error-msg mt-4">
                                  {{ errorMsgUnstakeRedeem }}
                                </div>
                                <div class="btn large mt-5" @click="redeemFlexReward">Redeem</div>
                              </staking-dialog>
                            </td>
                          </tr>
                          <tr
                            v-for="lockDetails in userStakeLockDetails.getStakingDetailsMap()"
                            :key="lockDetails[0]"
                          >
                            <td v-if="(infoPack == -1) | (infoPack == 1)">
                              {{ Number(lockDetails[1].amount / 1000).toLocaleString('en-US') }}
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 1)">
                              {{ lockDetails[1].duration }} /
                              {{ lockDetails[1].totalDuration }} days
                            </td>
                            <td v-if="((infoPack == -1) | (infoPack == 1)) & !mobileS">
                              {{
                                Number(Math.floor(lockDetails[1].interest) / 1000).toLocaleString(
                                  'en-US'
                                )
                              }}
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 1)">
                              {{ lockDetails[1].percentage }}%
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 1)" class="button-column">
                              <staking-dialog
                                v-if="!lockDetails[1].unlock"
                                @showState="dialog2 = [false, $event, false]"
                                @closeAll="closeAllDialogs = $event"
                                :display="dialog2[1] & !dialog3[1]"
                                title="Unstake my SMAK"
                                classname="btn tiny btn-warning"
                                buttonname="Unstake"
                                :opacity="0.74"
                                :theme="theme"
                              >
                                <div class="redeem header">Details</div>
                                <div class="redeem details">
                                  <div>APR: {{ lockDetails[1].percentage }}%</div>
                                  <div>
                                    Est. Rewards:
                                    {{
                                      lockDetails[1].unlock
                                        ? Number(
                                            Math.floor(lockDetails[1].interest) / 1000
                                          ).toLocaleString('en-US')
                                        : 0
                                    }}
                                    SMAK
                                  </div>
                                  <div>
                                    Duration: {{ lockDetails[1].beginDate }} -
                                    {{ lockDetails[1].endDate }}
                                  </div>
                                </div>
                                <div class="redemption-amount">
                                  <div class="label">Redemption amount</div>
                                  <div class="amount mb-7">
                                    {{
                                      lockDetails[1].unlock
                                        ? (
                                            Number(Math.floor(lockDetails[1].interest) / 1000) +
                                            Number(lockDetails[1].amount / 1000)
                                          ).toLocaleString('en-US')
                                        : Number(lockDetails[1].amount / 1000)
                                    }}
                                    SMAK
                                  </div>
                                </div>
                                <div class="d-flex mt-3 ml-4">
                                  <div class="mr-4">Redemption date</div>
                                  <div>{{ datenow }}</div>
                                </div>

                                <staking-dialog
                                  @showState="dialog3 = [false, $event, false]"
                                  @closeAll="closeAllDialogs = $event"
                                  classname="btn large mt-5"
                                  buttonname="Unstake"
                                  title="Unstake my SMAK"
                                  :theme="theme"
                                  size="500"
                                  :opacity="0.74"
                                >
                                  <div class="error-box">
                                    <div class="header">
                                      The duration of this staking program is
                                      {{ lockDetails[1].totalDuration }} days
                                    </div>
                                    <div class="my-3">
                                      ⚠️ If you redeem your SMAK in advance you will lose your
                                      rewards.
                                    </div>
                                    <div class="details text-error">
                                      <div>Redemption date: {{ datenow }}</div>
                                      <div>
                                        Est. Rewards:
                                        {{
                                          Number(
                                            Math.floor(lockDetails[1].interest) / 1000
                                          ).toLocaleString('en-US')
                                        }}
                                        SMAK
                                      </div>
                                      <div>
                                        Received Rewards:
                                        {{
                                          Number(
                                            lockDetails[1].unlock
                                              ? Math.floor(lockDetails[1].interest) / 1000
                                              : 0
                                          ).toLocaleString('en-US')
                                        }}
                                        SMAK
                                      </div>
                                    </div>
                                  </div>
                                  <div class="error-msg mt-4">
                                    {{ errorMsgUnstakeRedeem }}
                                  </div>
                                  <div
                                    class="btn large mt-5 btn-error"
                                    @click="unstakeLock(lockDetails[0][0], lockDetails[0][1])"
                                  >
                                    Unstake
                                  </div>
                                </staking-dialog>
                              </staking-dialog>
                              <staking-dialog
                                v-if="lockDetails[1].unlock"
                                @showState="dialog2 = [false, $event, false]"
                                @closeAll="closeAllDialogs = $event"
                                :display="dialog2[1] & !dialog3[1]"
                                title="Unstake my SMAK"
                                classname="btn tiny btn-success"
                                buttonname="Unstake"
                                :opacity="0.74"
                                :theme="theme"
                              >
                                <div class="redeem header">Details</div>
                                <div class="redeem details">
                                  <div>APR: {{ lockDetails[1].percentage }}%</div>
                                  <div>
                                    Est. Rewards:
                                    {{
                                      lockDetails[1].unlock
                                        ? Number(
                                            Math.floor(lockDetails[1].interest) / 1000
                                          ).toLocaleString('en-US')
                                        : 0
                                    }}
                                    SMAK
                                  </div>
                                  <div>
                                    Duration: {{ lockDetails[1].beginDate }} -
                                    {{ lockDetails[1].endDate }}
                                  </div>
                                </div>
                                <div class="redemption-amount">
                                  <div class="label">Redemption amount</div>
                                  <div class="amount mb-7">
                                    {{
                                      lockDetails[1].unlock
                                        ? (
                                            Number(Math.floor(lockDetails[1].interest) / 1000) +
                                            Number(lockDetails[1].amount / 1000)
                                          ).toLocaleString('en-US')
                                        : Number(lockDetails[1].amount / 1000)
                                    }}
                                    SMAK
                                  </div>
                                </div>
                                <div class="d-flex mt-3 ml-4">
                                  <div class="mr-4">Redemption date</div>
                                  <div>{{ datenow }}</div>
                                </div>
                                <div
                                  class="btn large mt-5"
                                  @click="unstakeLock(lockDetails[0][0], lockDetails[0][1])"
                                >
                                  Unstake
                                </div>
                              </staking-dialog>
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 1)" class="button-column">
                              <div class="btn tiny btn-disabled">Redeem</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </staking-dialog-large>
                </div>
                <div class="stacking-details-action-wrapper">
                  <img
                    draggable="false"
                    class="staking-details-img"
                    :src="require('../../assets/Clock.png')"
                  />
                  <div v-if="!isWalletConnected" class="staking-details-btn disabled">
                    <div class="staking-details">Locked details</div>
                  </div>
                  <staking-dialog-large
                    :show="dialog1[2]"
                    @showState="dialog1 = [false, false, $event]"
                    @newPackInfo="infoPack = $event"
                    title="My staking details"
                    classname="staking-details"
                    :theme="theme"
                    :display="dialog1[2] & !dialog2[2] & !dialog3[2]"
                    :opacity="0.74"
                    persistent
                    :retain-focus="false"
                    buttonname="Locked staking"
                    :packInfo="1"
                    v-if="isWalletConnected"
                  >
                    <div class="text staking-options-recap">
                      <div class="stake-options tiny">
                        <div
                          class="stake-options-item"
                          v-for="menuOption in dialogMenuOptions"
                          :key="menuOption[0]"
                          :class="{ selected: infoPack === menuOption[0] }"
                          @click="changeInfoPack(menuOption[0])"
                        >
                          {{ menuOption[1] }}
                        </div>
                      </div>

                      <table>
                        <thead>
                          <tr>
                            <th class="whitespace-nowrap">{{ mobile ? 'Amount' : 'Total amount' }}</th>
                            <th>Duration</th>
                            <th v-if="!mobileS">Rewards</th>
                            <th>APR</th>
                            <th class="button-column unstake-title">Unstake</th>
                            <th class="button-column redeem-title">Redeem</th>
                          </tr>
                        </thead>

                        <tbody>
                          <!-- TODO : v-for sur le tr -->
                          <tr
                            v-for="flexDetails in userStakeFlexDetails.getStakingDetailsMap()"
                            :key="flexDetails[0]"
                          >
                            <td v-if="(infoPack == -1) | (infoPack == 0)">
                              {{ Number(flexDetails[1].amount / 1000).toLocaleString('en-US') }}
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 0)">
                              {{ flexDetails[1].duration }} days
                            </td>
                            <td v-if="((infoPack == -1) | (infoPack == 0)) & !mobileS">
                              {{
                                Number(Math.floor(flexDetails[1].interest) / 1000).toLocaleString(
                                  'en-US'
                                )
                              }}
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 0)">
                              {{ flexDetails[1].percentage }}%
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 0)" class="button-column">
                              <staking-dialog
                                @showState="dialog2 = [false, false, $event]"
                                @closeAll="closeAllDialogs = $event"
                                title="Unstake my SMAK"
                                classname="btn tiny btn-warning"
                                buttonname="Unstake"
                                :opacity="0.74"
                                :theme="theme"
                              >
                                <div class="header">Details</div>
                                <div class="details">
                                  <div>APR: {{ flexDetails[1].percentage }}% Est.</div>
                                  <div>
                                    Rewards:
                                    {{
                                      Number(
                                        Math.floor(flexDetails[1].interest) / 1000
                                      ).toLocaleString('en-US')
                                    }}
                                    SMAK
                                  </div>
                                  <div>
                                    Duration: {{ flexDetails[1].beginDate }} -
                                    {{ flexDetails[1].endDate }}
                                  </div>
                                </div>

                                <div class="d-flex">
                                  <div>Redemption amount</div>
                                  <v-spacer />
                                  <div class="gray">
                                    Available:
                                    {{
                                      Number(flexDetails[1].amount / 1000).toLocaleString('en-US')
                                    }}
                                    SMAK
                                  </div>
                                </div>

                                <div class="input-wrapper">
                                  <input
                                    type="text"
                                    placeholder="0"
                                    width="auto"
                                    class="input-txts"
                                    v-bind="amountToUnstake"
                                    v-model="amountToUnstake"
                                    onkeypress="return (event.charCode >= 48 && event.charCode <= 57) || event.charCode == 46"
                                  />
                                  <div class="btn my-0" @click="unstakeMax(flexDetails[1].amount)">
                                    MAX
                                  </div>
                                </div>

                                <div class="d-flex mt-3">
                                  <div>Redemption date</div>
                                  <v-spacer />
                                  <div>{{ datenow }}</div>
                                </div>
                                <div class="error-msg mt-4">
                                  {{ errorMsgUnstakeRedeem }}
                                </div>
                                <div
                                  :class="
                                    isUnstakeValid &
                                    (amountToUnstake != '') &
                                    (amountToUnstake != 0)
                                      ? 'btn large mt-5'
                                      : 'btn large disabled mt-5'
                                  "
                                  @click="unstakeFlex(amountToUnstake)"
                                >
                                  Unstake
                                </div>
                              </staking-dialog>
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 0)" class="button-column">
                              <staking-dialog
                                @showState="dialog2 = [false, false, $event]"
                                @closeAll="closeAllDialogs = $event"
                                title="Redeem"
                                classname="btn tiny btn-success"
                                buttonname="Redeem"
                                :opacity="0.74"
                                :theme="theme"
                              >
                                <div class="redeem header">Details</div>
                                <div class="redeem details">
                                  <div>APR: {{ flexDetails[1].percentage }}%</div>
                                  <div>
                                    Est. Rewards:
                                    {{
                                      Number(
                                        Math.floor(flexDetails[1].interest) / 1000
                                      ).toLocaleString('en-US')
                                    }}
                                    SMAK
                                  </div>
                                  <div>Start date: {{ flexDetails[1].beginDate }}</div>
                                </div>
                                <div class="redemption-amount">
                                  <div class="label">Redemption amount</div>
                                  <div class="amount mb-7">
                                    {{
                                      Number(
                                        Math.floor(flexDetails[1].interest) / 1000
                                      ).toLocaleString('en-US')
                                    }}
                                    SMAK
                                  </div>
                                </div>
                                <div class="d-flex mt-3 ml-4">
                                  <div class="mr-4">Redemption date</div>
                                  <div>{{ datenow }}</div>
                                </div>
                                <div class="error-msg mt-4">
                                  {{ errorMsgUnstakeRedeem }}
                                </div>
                                <div class="btn large mt-5" @click="redeemFlexReward">Redeem</div>
                              </staking-dialog>
                            </td>
                          </tr>
                          <tr
                            v-for="lockDetails in userStakeLockDetails.getStakingDetailsMap()"
                            :key="lockDetails[0]"
                          >
                            <td v-if="(infoPack == -1) | (infoPack == 1)">
                              {{ Number(lockDetails[1].amount / 1000).toLocaleString('en-US') }}
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 1)">
                              {{ lockDetails[1].duration }} /
                              {{ lockDetails[1].totalDuration }} days
                            </td>
                            <td v-if="((infoPack == -1) | (infoPack == 1)) & !mobileS">
                              {{
                                Number(Math.floor(lockDetails[1].interest) / 1000).toLocaleString(
                                  'en-US'
                                )
                              }}
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 1)">
                              {{ lockDetails[1].percentage }}%
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 1)" class="button-column">
                              <staking-dialog
                                v-if="!lockDetails[1].unlock"
                                @showState="dialog2 = [false, false, $event]"
                                @closeAll="closeAllDialogs = $event"
                                :display="dialog2[2] & !dialog3[2]"
                                title="Unstake my SMAK"
                                classname="btn tiny btn-warning"
                                buttonname="Unstake"
                                :opacity="0.74"
                                :theme="theme"
                              >
                                <div class="redeem header">Details</div>
                                <div class="redeem details">
                                  <div>APR: {{ lockDetails[1].percentage }}%</div>
                                  <div>
                                    Est. Rewards:
                                    {{
                                      lockDetails[1].unlock
                                        ? Number(
                                            Math.floor(lockDetails[1].interest) / 1000
                                          ).toLocaleString('en-US')
                                        : 0
                                    }}
                                    SMAK
                                  </div>
                                  <div>
                                    Duration: {{ lockDetails[1].beginDate }} -
                                    {{ lockDetails[1].endDate }}
                                  </div>
                                </div>
                                <div class="redemption-amount">
                                  <div class="label">Redemption amount</div>
                                  <div class="amount mb-7">
                                    {{
                                      lockDetails[1].unlock
                                        ? (
                                            Number(Math.floor(lockDetails[1].interest) / 1000) +
                                            Number(lockDetails[1].amount / 1000)
                                          ).toLocaleString('en-US')
                                        : Number(lockDetails[1].amount / 1000)
                                    }}
                                    SMAK
                                  </div>
                                </div>
                                <div class="d-flex mt-3 ml-4">
                                  <div class="mr-4">Redemption date</div>
                                  <div>{{ datenow }}</div>
                                </div>

                                <staking-dialog
                                  @showState="dialog3 = [false, false, $event]"
                                  @closeAll="closeAllDialogs = $event"
                                  classname="btn large mt-5"
                                  buttonname="Unstake"
                                  title="Unstake my SMAK"
                                  :theme="theme"
                                  size="500"
                                  :opacity="0.74"
                                >
                                  <div class="error-box">
                                    <div class="header">
                                      The duration of this staking program is
                                      {{ lockDetails[1].totalDuration }} days
                                    </div>
                                    <div class="my-3">
                                      ⚠️ If you redeem your SMAK in advance you will lose your
                                      rewards.
                                    </div>
                                    <div class="details text-error">
                                      <div>Redemption date: {{ datenow }}</div>
                                      <div>
                                        Est. Rewards:
                                        {{
                                          Number(
                                            Math.floor(lockDetails[1].interest) / 1000
                                          ).toLocaleString('en-US')
                                        }}
                                        SMAK
                                      </div>
                                      <div>
                                        Received Rewards:
                                        {{
                                          Number(
                                            lockDetails[1].unlock
                                              ? Math.floor(lockDetails[1].interest) / 1000
                                              : 0
                                          ).toLocaleString('en-US')
                                        }}
                                        SMAK
                                      </div>
                                    </div>
                                  </div>
                                  <div class="error-msg mt-4">
                                    {{ errorMsgUnstakeRedeem }}
                                  </div>
                                  <div
                                    class="btn large mt-5 btn-error"
                                    @click="unstakeLock(lockDetails[0][0], lockDetails[0][1])"
                                  >
                                    Unstake
                                  </div>
                                </staking-dialog>
                              </staking-dialog>
                              <staking-dialog
                                v-if="lockDetails[1].unlock"
                                @showState="dialog2 = [false, false, $event]"
                                @closeAll="closeAllDialogs = $event"
                                :display="dialog2[2] & !dialog3[2]"
                                title="Unstake my SMAK"
                                classname="btn tiny btn-success"
                                buttonname="Unstake"
                                :opacity="0.74"
                                :theme="theme"
                              >
                                <div class="redeem header">Details</div>
                                <div class="redeem details">
                                  <div>APR: {{ lockDetails[1].percentage }}%</div>
                                  <div>
                                    Est. Rewards:
                                    {{
                                      lockDetails[1].unlock
                                        ? Number(
                                            Math.floor(lockDetails[1].interest) / 1000
                                          ).toLocaleString('en-US')
                                        : 0
                                    }}
                                    SMAK
                                  </div>
                                  <div>
                                    Duration: {{ lockDetails[1].beginDate }} -
                                    {{ lockDetails[1].endDate }}
                                  </div>
                                </div>
                                <div class="redemption-amount">
                                  <div class="label">Redemption amount</div>
                                  <div class="amount mb-7">
                                    {{
                                      lockDetails[1].unlock
                                        ? (
                                            Number(Math.floor(lockDetails[1].interest) / 1000) +
                                            Number(lockDetails[1].amount / 1000)
                                          ).toLocaleString('en-US')
                                        : Number(lockDetails[1].amount / 1000)
                                    }}
                                    SMAK
                                  </div>
                                </div>
                                <div class="d-flex mt-3 ml-4">
                                  <div class="mr-4">Redemption date</div>
                                  <div>{{ datenow }}</div>
                                </div>
                                <div
                                  class="btn large mt-5"
                                  @click="unstakeLock(lockDetails[0][0], lockDetails[0][1])"
                                >
                                  Unstake
                                </div>
                              </staking-dialog>
                            </td>
                            <td v-if="(infoPack == -1) | (infoPack == 1)" class="button-column">
                              <div class="btn tiny btn-disabled">Redeem</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </staking-dialog-large>
                </div>
              </div>
            </div>
          </div>
          <div class="flex-wrapper-twenty-six">
            <div class="dashboard mr-4">Dashboard</div>
            <div class="smak-staking-data whitespace-nowrap">SMAK Staking Data</div>
          </div>
          <div class="h-layout">
            <div class="pannel stats text-pannel row-on-mobile mr-sm-5">
              <div class="smak-number-title">$SMAK Price</div>
              <div class="smak-number-value">
                <span
                  :class="smakVarSign == '+' ? 'rectangle-532' : 'rectangle-532 negative'"
                  v-if="mobile"
                  >{{ smakVar }}%</span
                >${{ smakPrice }} USD
                <span
                  v-if="!mobile"
                  :class="smakVarSign == '+' ? 'rectangle-532' : 'rectangle-532 negative'"
                  >{{ smakVar }}%</span
                >
              </div>
              <!-- <div v-if="priceChange">

                <div class="num-2"></div>
              </div> -->
            </div>
            <div class="pannel stats text-pannel row-on-mobile mr-sm-5">
              <div class="smak-number-title">Total SMAK Staked</div>
              <div class="smak-number-value">
                {{ Number(totalStake).toLocaleString('en-US') }} SMAK
              </div>
            </div>
            <div class="pannel stats text-pannel row-on-mobile">
              <div class="smak-number-title">Total Staking Rewards</div>
              <div class="smak-number-value">
                {{ Number(redeemedRewards).toLocaleString('en-US') }} SMAK
              </div>
            </div>
          </div>
          <div class="h-layout">
            <div class="pannel graph-pannel hide-on-mobile mr-sm-5">
              <v-row class="mb-3">
                <v-col>
                  <div class="smak-staking-analysis">SMAK Staking Analysis</div>
                </v-col>
                <v-col>
                  <v-tooltip left>
                    <template v-slot:activator="{ on, attrs }">
                      <div v-bind="attrs" v-on="on" class="info-bubble">
                        <div class="ellipse-84"></div>
                        <div class="question-mark">?</div>
                      </div>
                    </template>
                    <div class="bubl">
                      <span> This chart shows the total amount of SMAK staked on the platform</span>
                    </div>
                  </v-tooltip>
                </v-col>
              </v-row>

              <v-chart
                v-if="loading"
                class="chart"
                style="height: 312px; width: 100%"
                :option="option"
                :key="theme"
                :autoresize="update"
                :manual-update="update"
              />
              <div class="flex-wrapper-twenty-one"></div>
            </div>

            <div class="pannel contract-details text-pannel d-flex flex-column">
              <div class="smak-staking-contract-details w-full">SMAK Staking Contract Details</div>
              <div class="contract-details-line">
                <div class="contract-details-line-title">Contract address</div>
                <div class="contract-details-line-value small">
                  <div class="contract-name">
                    <a
                      style="color: var(--text)"
                      href="https://tzkt.io/KT1TR4qabnDU6aAUym6nauSGaRwJpoKU3efP/operations/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ tokenContractAddress }}
                    </a>
                  </div>
                </div>
              </div>
              <div class="contract-details-line">
                <div class="contract-details-line-title">Number of stakers</div>
                <div class="contract-details-line-value">
                  {{ numberOfStakers.toLocaleString('en-US') }}
                </div>
              </div>
              <div class="contract-details-line">
                <div class="contract-details-line-title">Circulating</div>
                <div class="contract-details-line-value">
                  {{ circulatingSupply.toLocaleString('en-US') }} SMAK
                </div>
              </div>
              <div class="contract-details-line">
                <div class="contract-details-line-title">Market cap</div>
                <div class="contract-details-line-value">
                  {{ smakMarketcap.toLocaleString('en-US') }} USD
                </div>
              </div>
              <div class="contract-details-line">
                <div class="contract-details-line-title">Max supply cap</div>
                <div class="contract-details-line-value">
                  {{ smakFullyDilutedMarketCap.toLocaleString('en-US') }} USD
                </div>
              </div>
              <div class="contract-details-line">
                <div class="contract-details-line-title">SMAK burned</div>
                <div class="contract-details-line-value">
                  {{ latestSmakBurned.toLocaleString('en-US') }} SMAK
                </div>
              </div>
              <div class="contract-details-line">
                <div class="contract-details-line-title">Total supply</div>
                <div class="contract-details-line-value">
                  {{ totalSupply.toLocaleString('en-US') }} SMAK
                </div>
              </div>

              <v-spacer />
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
    <AppFooter />
  </DefaultLayout>
</template>

<script lang="ts" src="./Staking.ts"></script>

<style lang="scss" scoped>
.stake-options {
  overflow-x: hidden;
}
</style>