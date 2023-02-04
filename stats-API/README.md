# SMAK staking statistics API
This API retrieves information from the TZKT API (https://api.tzkt.io/) and computes some additional data. 
Currently, the API computes the following information for each SMAK staking pack:
- number of users using the pack (`users`)
- total amount staked in the pack in miliSMAK (`balance`)

SMAK staking smart-contract allows having several locked packs. They are identified by an id. Currently, there is only one locked pack which id is `1`. The API returns the data for the locked packs separatly, there is no global "locked packs" result. 

## Install and run
### Dependencies
This API uses a node version `>=12`
It also use a function called `packsData()` from the `index.js` file in the `statistics` directory. 

### Run the project locally
In order to run the project, follow these steps:
1. check that you are in the stats-API directory: `pwd` => `{PATH}/SMAK-Staking/stats-API`
2. install the dependencies: `npm install`
3. run the api: `node index.js`
4. go to `localhost:8080`

## GET requests
### `{API_URL}/stats/packs`
Returns information about all available SMAK staking packs (flexible and locked). 
Example of response:

``` json
{
    "flexible":
    {
        "users":342,
        "balance":22526040749
    },
    "locked":
    {
        "1":
        {
            "users":1169,
            "balance":178971217778
        }
    }
}
```

### `{API_URL}/stats/pack/{type}`
Type can be either `flexible` or `locked`.
Returns information about packs of a requested type. 

Example of response:
Flexible pack:

``` json
{
    "users":342,
    "balance":22526040749
}
```

Locked packs:

``` json
{
    "1":
    {
        "users":1169,
        "balance":178971217778
    }
}
```

### `{API_URL}/stats/pack/locked/{id}`
SMAK staking smart-contract allows having several locked packs. They are identified by an id. Currently, there is only one locked pack which id is `1`.
Returns information of the pack correspondig to the requested pack id. 

Example of response:

``` json
{
    "users":1169,
    "balance":178971217778
}
```
