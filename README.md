[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Discord][discord-shield]][discord-url]
[![Telegram][telegram-shield]][telegram-url]
[![LinkedIn][linkedin-shield]][linkedin-url]
[![Twitter][twitter-shield]][twitter-url]
[![Reddit][reddit-shield]][reddit-url]
<img width="700" alt="portfolio_view" src="https://gateway.pinata.cloud/ipfs/QmWdSJfpEGEzdFmQ3jSDcZYfDFfc5FhRtP7Xi3cv2EuTWL/Logos/Dark%20logo/Logo%20HD.png">

# Smartlink <a name="Smartlink"></a>
Smartlink addresses one of the biggest challenges in the global marketplace: ‘Need to Trust,’ by introducing decentralized escrow services and payments processing based on Tezos' institutional-grade smart contracts that suppress the need for buyers and sellers to trust each other.

Smartlink aims to provide a user-centered escrow solution to secure online and face-to-face transactions while broadening payments acceptance options through integrated cryptocurrencies.

Smartlink proposes a new method to initiate commercial transactions by offering Trust-As-A-Service to incentivize commitment and eliminate the trust deficit in the global marketplace.

# SMAK staking



- [Smartlink <a name="Smartlink"></a>](#smartlink-)
- [SMAK staking](#smak-staking)
  - [Variables <a name="Variables"></a>](#variables-)
    - [UserStakeLockPack <a name="UserStakeLockPack"></a>](#userstakelockpack-)
  - [Functions <a name="functions"></a>](#functions-)
    - [Setters](#setters)
      - [updateMetaData: <a name ="updateMetadata"> </a>](#updatemetadata--)
      - [updateReserve: <a name="updateReserve"></a>](#updatereserve-)
      - [updateAdmin: <a name="updateAdmin"></a>](#updateadmin-)
      - [updateContract: <a name="updateContract"></a>](#updatecontract-)
      - [updateVotingContract: <a name="updateVotingContract"></a>](#updatevotingcontract-)
      - [is_voting_contract: <a name="is_voting_contract"></a>](#is_voting_contract-)
      - [createStakingOption: <a name="createStakingOption"></a>](#createstakingoption-)
      - [updateStakingOptionRate: <a name="updateStakingOptionRate"></a>](#updatestakingoptionrate-)
      - [updateStakingOptionDuration: <a name="updateStakingOptionDuration"></a>](#updatestakingoptionduration-)
      - [updateStakingOptionMax: <a name="updateStakingOptionMax"></a>](#updatestakingoptionmax-)
      - [updateStakingOptionMin: <a name="updateStakingOptionMin"></a>](#updatestakingoptionmin-)
      - [updateMaxValuesNb: <a name="updateMaxValuesNb"></a>](#updatemaxvaluesnb-)
    - [Core functions <a name="CoreFunc"></a>](#core-functions-)
      - [addStaker: <a name="addStaker"></a>](#addstaker-)
      - [delStaker: <a name="delStaker"></a>](#delstaker-)
      - [stakeLock: <a name=""></a>](#stakelock-)
      - [stakeFlex: <a name="stakeFlex"></a>](#stakeflex-)
      - [updateStakingFlex: <a name="updateStakingFlex"></a>](#updatestakingflex-)
      - [unstakeLock: <a name="unstakeLock"></a>](#unstakelock-)
      - [unlockWithReward: <a name="unlockWithReward"></a>](#unlockwithreward-)
      - [unlockWithoutReward: <a name="unlockWithoutReward"></a>](#unlockwithoutreward-)
      - [unstakeFlex: <a name="unstakeFlex"></a>](#unstakeflex-)
      - [claimRewardFlex: <a name="claimRewardFlex"></a>](#claimrewardflex-)
      - [getReward: <a name="getReward"></a>](#getreward-)
      - [updateRedeemedRewards: <a name="updateRedeemedRewards"></a>](#updateredeemedrewards-)
      - [updateStakingFlexRate: <a name="updateStakingFlexRate"></a>](#updatestakingflexrate-)
- [SMAK Lottery](#smak-lottery)
  - [Variables <a name="VariablesLottery"></a>](#variables--1)
  - [Functions <a name="functionsLottery"></a>](#functions--1)
    - [buyTicket: <a name="buyTicket"></a>](#buyticket-)
    - [selectWinner: <a name="selectWinner"></a>](#selectwinner-)
    - [resetLottery: <a name="resetLottery"></a>](#resetlottery-)
    - [pause: <a name="pause"></a>](#pause-)

## Variables <a name="Variables"></a>
|               Name                |                Type                      |                                   Description                              |
|----------------------------------:|:----------------------------------------:|:---------------------------------------------------------------------------|
| admin                             |         TAddress                         |Address of the admin                                                        |
| reserve                           |          TAddress                        |Address of the token reserve to pay the stakings                            |
|userStakeLockPack                  |[UserStakeLockPack](#UserStakeLockPack)   |See the schema below                                                        |
| StakeLock                         |        TRecord                           |Structure of a locked staking                                               |
| StakeLock.timestamp               |        TTimestamp                        |Timestamp of the begining of the staking                                    |
| StakeLock.rate                    |        TNat                              |Rate of the staking                                                         |
| StakeLock.value                   |        TNat                              |Amount of tokens staked                                                     |
| userStakeFlexPack                 |TBig_map(TNat, TMap(TAddress, StakeFlex)) |Storage of all the flex stakings                                            |
| StakeFlex                         |        TRecord                           |Structure of a flex staking                                                 |
| StakeFlex.timestamp               |        TTimestamp                        |Timestamp of the begining of the staking                                    |
| StakeLock.reward                  |        TNat                              |Rewards for the past period of the staking                                  |
| StakeLock.value                   |        TNat                              |Amount of tokens staked                                                     |
| stakingOptions                    |           TMap(TNat, stakingOption)      |Storage of all the staking packs                                            |
| stakingOption                     |        TRecord                           |Structure of a staking option                                               |
| stakingOption.minStake            |        TNat                              |Minimum amount of tokens that can be sent in one transaction                |
| stakingOption.maxStake            |        TNat                              |Maximum amount of tokens that can be sent in one transaction                |
| stakingOption.stakingPeriod       |        TInt                              |Duration of a staking                                                       |
| stakingOption.stakingPercentage   |        TNat                              |Rate of the staking                                                         |
| votingContract                    |         TAddress                         |Address of the voting contract that will be implemented in the future       |
| stakingHistory                    |TMap(TTimestamp, TInt)                    |Mapping of the number of SMAK staked at a timestamp                         |
| addressId                         |TBig_map(TAddress, TNat)                  |Mapping of addresses to which part of the userStakeFlexPack big map it's in |
| maxValuesNb                       |TNat                                      |Number of address each case of the userStakeFlexPack big map can contain (to prevent from gas exhaustion when updating the staking flex rate)|

### UserStakeLockPack <a name="UserStakeLockPack"></a>
This is the structure of the nested maps ```userStakeLockPack```
<img src="https://ipfs.io/ipfs/QmYsv8WVrQd1pX2KRQCjLT1N27abQtstxuy6Ct1qxbmfto" alt="UserStakeLockPack's structure">

## Functions <a name="functions"></a>

### Setters
#### updateMetaData: <a name ="updateMetadata"> </a>
```python
@sp.entry_point
def updateMetadata(self,params):
        sp.set_type(params, sp.TRecord(url = sp.TBytes))
```
Updates the contract's metadata. Only the admin can use this function.

#### updateReserve: <a name="updateReserve"></a>
```python
@sp.entry_point
def updateReserve(self, params):
    sp.set_type(params, sp.TRecord(reserve=sp.TAddress))
```
Sets the reserve address.

#### updateAdmin: <a name="updateAdmin"></a>
```python
@sp.entry_point
def updateAdmin(self, params):
    sp.set_type(params, sp.TRecord(admin=sp.TAddress))
```
Sets the admin address of the contract.

#### updateContract: <a name="updateContract"></a>
```python
@sp.entry_point
def updateContract(self, params):
    sp.set_type(params, sp.TRecord(contract = sp.TAddress))
```
Sets the address of the token contract.

#### updateVotingContract: <a name="updateVotingContract"></a>
```python
@sp.entry_point
def updateVotingContract(self, params):
    sp.set_type(params, sp.TRecord(contract = sp.TAddress))
```
Sets the adress of the voting contract.

#### is_voting_contract: <a name="is_voting_contract"></a>
```python
@sp.sub_entry_point
    def is_voting_contract(self, contract):
```
Verifies if the address in param is the voting contract address.

#### createStakingOption: <a name="createStakingOption"></a>
```python
@sp.entry_point
def createStakingOption(self, params):
    sp.set_type(params, sp.TRecord(_id = sp.TNat, rate = sp.TNat, _max = sp.TNat, _min = sp.TNat, duration = sp.TInt).layout(("_id as id", ("rate", ("_max as max", ("_min as min", "duration"))))))
```
Function used to create a stacking pack (Period / APY). Only Admin or voting contract can use this function.

#### updateStakingOptionRate: <a name="updateStakingOptionRate"></a>
```python
@sp.entry_point
def updateStakingOptionRate(self, params):
    sp.set_type(params, sp.TRecord(_id = sp.TNat, rate = sp.TNat).layout(("_id as id", "rate")))
```
Sets the new rate of the staking pack.

#### updateStakingOptionDuration: <a name="updateStakingOptionDuration"></a>
```python
@sp.entry_point
def updateStakingOptionDuration(self, params):
    sp.set_type(params, sp.TRecord(_id = sp.TNat, duration = sp.TInt).layout(("_id as id", "duration")))
```
Sets the new duration of the staking pack.
#### updateStakingOptionMax: <a name="updateStakingOptionMax"></a>
```python
@sp.entry_point
def updateStakingOptionMax(self, params):
    sp.set_type(params, sp.TRecord(_id = sp.TNat, _max = sp.TNat).layout(("_id as id", "_max as max")))
```
Sets the new max amount per transaction.

#### updateStakingOptionMin: <a name="updateStakingOptionMin"></a>
```python
@sp.entry_point
def updateStakingOptionMin(self, params):
    sp.set_type(params, sp.TRecord(_id = sp.TNat, _min = sp.TNat).layout(("_id as id", "_min as min")))
```
Sets the new min per transaction 

#### updateMaxValuesNb: <a name="updateMaxValuesNb"></a>
```python
@sp.entry_point
def updateMaxValuesNb(self, params):
    sp.set_type(params, sp.TRecord(value = sp.TNat))
```
Sets the new maximum value of staking flex per big map case.

### Core functions <a name="CoreFunc"></a>
#### addStaker: <a name="addStaker"></a>
```python
def addStaker(self, addr):
    sp.if (~self.data.userStakeLockPack.contains(addr) & ~self.data.addressId.contains(addr)):
        self.data.numberOfStakers += 1
```
Internal function that will add a staker to the staker map (for the dashboard graph)

#### delStaker: <a name="delStaker"></a>
```python
def delStaker(self, addr):
        sp.if (~self.data.userStakeLockPack.contains(addr) & ~self.data.addressId.contains(addr)):
            self.data.numberOfStakers -= 1
```
Internal function that will remove a staker to the staker map (for the dashboard graph)

#### stakeLock: <a name=""></a>
```python
@sp.entry_point
def stakeLock(self, params):
    sp.set_type(params, sp.TRecord(pack = sp.TNat, amount = sp.TNat))
```
Stakes the amount of tokens using the parameters of the pack specified. Will initialize the map for the user if it's his first staking.

#### stakeFlex: <a name="stakeFlex"></a>
```python
@sp.entry_point
def stakeFlex(self, params):
    sp.set_type(params, sp.TRecord(amount = sp.TNat))
```
Stakes the amount of tokens using the flex pack parameters. Will initialize the staking for the user if it's his first staking. Else it will only update the staking.

#### updateStakingFlex: <a name="updateStakingFlex"></a>
```python
def updateStakingFlex(self, id_, addr, amount):
```
Internal function that updates a staking flex for a user if it already exists (adds the amount to the stake and computes the rewards for the last period).

#### unstakeLock: <a name="unstakeLock"></a>
```python
@sp.entry_point
def unstakeLock(self, params):
    sp.set_type(params, sp.TRecord(pack=sp.TNat, index=sp.TNat))
```
Unstakes the specified stake. If the stake period isn't finished the user won't receive his rewards.

#### unlockWithReward: <a name="unlockWithReward"></a>
```python
@sp.sub_entry_point
def unlockWithReward(self, params):
    sp.set_type(params, sp.TRecord(pack = sp.TNat, index = sp.TNat))
```
Internal function called by ```unstakeLock``` if the staking period has finished. Will send the user his tokens back + the rewards.

#### unlockWithoutReward: <a name="unlockWithoutReward"></a>
```python
 @sp.sub_entry_point
def unlockWithoutReward(self, params):
    sp.set_type(params, sp.TRecord(index = sp.TNat, pack = sp.TNat))
```
Internal function called by ```unstakeLock``` if the staking period has not finished. Will only send the user his tokens back.

#### unstakeFlex: <a name="unstakeFlex"></a>
```python
@sp.entry_point
def unstakeFlex(self, params):
    sp.set_type(params, sp.TRecord(amount = sp.TNat))
```
Computes the reward for the last staking period, sets the timestamp to the actual timestamp, updates the value of the stake and sends the user his tokens back.

#### claimRewardFlex: <a name="claimRewardFlex"></a>
```python
@sp.entry_point
def claimRewardFlex(self):
```
Sends the rewards available to the user.

#### getReward: <a name="getReward"></a>
```python
 def getReward(self, params):
        sp.set_type(params, sp.TRecord(start=sp.TTimestamp, end = sp.TTimestamp, value= sp.TNat, rate=sp.TNat))
```
Internal function that will compute the rewards for a period.

#### updateRedeemedRewards: <a name="updateRedeemedRewards"></a>
```python
def updateRedeemedRewards(self, addr, value):
```
Internal function that will update the redeemed rewards for a user.

#### updateStakingFlexRate: <a name="updateStakingFlexRate"></a>
```python
@sp.entry_point
def updateStakingFlexRate(self, params):
    sp.set_type(params, sp.TRecord(id_=sp.TNat))
```
Function that will compute the rewards for all the staking flex in the big map case and will update the old cached flex rate to the new one. Only the admin can call this function.


# SMAK Lottery

## Variables <a name="VariablesLottery"></a>
|        Name            |                            Type                           |                                   Description                              |
|-----------------------:|:---------------------------------------------------------:|:---------------------------------------------------------------------------|
| admin                  |                           TAddress                        |Address of the admin                                                        |
| reserve                |                           TAddress                        |Address of the token reserve to pay the lottery winners                     |
|FA12TokenContract       |                           TAddress                        |Address of the token contract                                               |
| limit                  |                             TNat                          |Maximum number of tickets sold before picking a winner                      |
|tickets                 |                  TBig_map(TNat, TAddress)                 |Mapping of the ticket number to the address of its owner                    |
| id                     |                             TNat                          |Number of the current ticket to be sold                                     |
| previous_winners       | TBig_map(TNat, TRecord(winner : TAddress, ticket : TNat)) |Mapping of the round to the winner and his ticket number                    |
| price                  |                             TNat                          |Price of a ticket                                                           |
| winning_price          |                             TNat                          |Amount of SMAK to be won                                                    |
| round_num              |                             TNat                          |Current round number                                                        |
|paused                  |                            TBool                          |Bool to pause the contract                                                  |


## Functions <a name="functionsLottery"></a>

### buyTicket: <a name="buyTicket"></a>
```python
@sp.entry_point
def buyTicket(self, params):
    sp.set_type(params, sp.TNat)
```
Function that will sell the number of tickets entered as a parameter to a user.

### selectWinner: <a name="selectWinner"></a>
```python
@sp.entry_point
def selectWinner(self, params):
    sp.verify(sp.sender == self.data.admin, Error.AccessDenied)
    sp.set_type(params, sp.TNat)
```
Function that will select a winner with the number given by the admin. Only the admin can call this function.

### resetLottery: <a name="resetLottery"></a>
```python
def resetLottery(self):
    self.data.id = sp.nat(0)
    sp.for i in sp.range(0, self.data.limit):
        del self.data.tickets[i]
```
Function that will delete all the tickets.

### pause: <a name="pause"></a>
```python
@sp.entry_point
def pause(self, params):
    sp.set_type(params, sp.TUnit)
    sp.verify(sp.sender == self.data.admin, Error.AccessDenied)
    self.data.paused = sp.bool(True) 
```
Function that will pause the contract. Only the admin can call this function.



[contributors-shield]: https://img.shields.io/github/contributors/Smartlinkhub/SMAK-Staking.svg?style=for-the-badge
[contributors-url]: https://github.com/Smartlinkhub/SMAK-Staking/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Smartlinkhub/SMAK-Staking.svg?style=for-the-badge
[forks-url]: https://github.com/Smartlinkhub/SMAK-Staking/network/members
[telegram-url]: https://t.me/smartlinkofficial
[telegram-shield]: https://img.shields.io/badge/-Telegram-black.svg?style=for-the-badge&logo=Telegram&colorB=555
[linkedin-url]: https://www.linkedin.com/company/smartlinkso
[linkedin-shield]: https://img.shields.io/badge/-Linkedin-black.svg?style=for-the-badge&logo=Linkedin&colorB=555
[discord-shield]: https://img.shields.io/badge/-Discord-black.svg?style=for-the-badge&logo=discord&colorB=555
[discord-url]:https://discord.gg/Rut5xxqGWQ
[twitter-shield]: https://img.shields.io/badge/-Twitter-black.svg?style=for-the-badge&logo=twitter&colorB=555
[twitter-url]:https://twitter.com/smartlinkHQ
[reddit-shield]: https://img.shields.io/badge/-reddit-black.svg?style=for-the-badge&logo=reddit&colorB=555
[reddit-url]:https://www.reddit.com/user/Teamsmartlink/

