const fetch = require("node-fetch");

/**
 * This function sends GET queries to the TZKT API
 * @param {string} url : URL to query
 * @returns {any} Result of the query
 */
async function queryTZKT(url) {
    let result;

    const response = await fetch(url, {
        "method": "GET"
    })

    if (response.ok) {
        result = await response.json()
    }
    else throw new Error('The data cannot be retrieved from TZKT.')
    return result;
}

/**
 * This function builds the flexible staking pack data
 * @returns {any} Object with the total users and total SMAK staked amount in the flexible pack
 */
async function flexUsersData() {
    let no_more_results = false;
    const limit = 10000;
    let offset = 0;
    let nbUsers = 0;
    let balance = 0;

    while (!no_more_results) {
        const flexResult = await queryTZKT("https://api.tzkt.io/v1/bigmaps/11325/keys?limit=" + limit + "&offset.pg=" + offset)

        for (let i = 0; i < flexResult.length; i++) {
            nbUsers += Object.entries(flexResult[i].value).length
            Object.values(flexResult[i].value).forEach((obj) => {
                balance += Number(obj.value)
            });
        }
        offset += 1

        no_more_results = flexResult.length < limit
    }

    return { 'users': nbUsers, 'balance': balance };
}

/**
 * This function builds a requested locked staking pack data
 * @param {string} pack: requested pack id
 * @returns {any} Object with the total users and total SMAK staked amount in the requested locked pack
 */
async function lockPacksData(pack) {
    let no_more_results = false;
    const limit = 10000;
    let offset = 0;
    let nbUsers = 0;
    let balance = 0;

    while (!no_more_results) {
        const lockResult = await queryTZKT("https://api.tzkt.io/v1/bigmaps/11326/keys?limit=" + limit + "&offset.pg=" + offset)

        for (let i = 0; i < lockResult.length; i++) {
            if (lockResult[i].active) {
                if (Object.keys(lockResult[i].value).includes(String(pack))) {
                    nbUsers += 1
                    Object.values(lockResult[i].value[String(pack)]).forEach((obj) => {
                        balance += Number(obj.value)
                    })
                }
            }
        }
        offset += 1

        no_more_results = lockResult.length < limit
    }
    return { 'users': nbUsers, 'balance': balance };
}

/**
 * This function retrieves the existing packs ids in the smart contract
 * @returns {Array<String>} Array with the pack id
 */
async function getStakingOptionsList() {
    const optionsResult = await queryTZKT("https://api.tzkt.io/v1/contracts/KT1TR4qabnDU6aAUym6nauSGaRwJpoKU3efP/storage")
    if (optionsResult) {
        return optionsResult.stakingOptions
    }
    else return []
}

async function main() {
    const stakingOptionsList = await getStakingOptionsList()
    const flexStakingUserstot = await flexUsersData()
    console.log("Stats at the date " + new Date())
    console.log("Flex pack total users: " + flexStakingUserstot.users + " & total balance: " + flexStakingUserstot.balance / 1000)
    for (id of Object.keys(stakingOptionsList)) {
        if (id != String(0)) {
            const lockStakingUsersTot = await lockPacksData(String(id))
            console.log("Lock pack #" + id + " total users: " + lockStakingUsersTot.users + " & total balance: " + lockStakingUsersTot.balance / 1000)
        }
    }

}

/**
 * This function computes information about all existing packs.
 * @returns {any} Object with the total users and total SMAK staked amount for each pack
 */
async function packsData() {
    let packs = new Map()
    let lockedMap = new Map()
    try {
        const stakingOptionsList = await getStakingOptionsList()
        const flexData = await flexUsersData()
        flexData.rate = stakingOptionsList['0'].stakingPercentage
        packs.set('flexible', flexData)

        for (id of Object.keys(stakingOptionsList)) {
            if (id != String(0)) {
                const lockData = await lockPacksData(String(id))
                lockData.rate = stakingOptionsList[id].stakingPercentage
                lockData.duration = stakingOptionsList[id].stakingPeriod
                lockedMap.set(id, lockData)
            }
        }
        packs.set('locked', Object.fromEntries(lockedMap))
    }
    catch (e) {
        console.log(e)
        throw e.message
    }

    return Object.fromEntries(packs)
}

module.exports.flexUsersData = flexUsersData;
module.exports.lockPacksData = lockPacksData;
module.exports.packsData = packsData;
module.exports.main = main;
