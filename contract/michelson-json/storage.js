const config = require('../config/config.js');


module.exports = 
{
  "prim": "Pair",
  "args": [
    {
      "prim": "Pair",
      "args": [
        {
          "prim": "Pair",
          "args": [ { "string": config.CONTRACT_FA12TOKEN_CONTRACT_ADDRESS }, { "prim": "Pair", "args": [ [], { "string": config.ADDRESS } ] } ]
        },
        {
          "prim": "Pair",
          "args": [
            {
              "prim": "Pair",
              "args": [
                { "int": config.MAX_FLEX_MAP_VALUES },
                [
                  {
                    "prim": "Elt",
                    "args": [ { "string": "" }, { "bytes": "697066733a2f2f516d507457315861764b766948584a67594b38433163487348646b4e354e364e735650584a6a4a4c42357a514c58" } ]
                  }
                ]
              ]
            },
            { "prim": "Pair", "args": [ { "int": "0" }, [] ] }
          ]
        }
      ]
    },
    {
      "prim": "Pair",
      "args": [
        {
          "prim": "Pair",
          "args": [
            { "prim": "Pair", "args": [ { "string": config.CONTRACT_RESERVE_ADDRESS }, { "int": "0" } ] },
            {
              "prim": "Pair",
              "args": [
                [ { "prim": "Elt", "args": [ { "string": new Date().toISOString() }, { "int": "0" } ] } ],
                [
                  {
                    "prim": "Elt",
                    "args": [
                      { "int": "0" },
                      {
                        "prim": "Pair",
                        "args": [ { "prim": "Pair", "args": [ { "int": config.FLEX_MAX }, { "int": config.FLEX_MIN } ] }, { "prim": "Pair", "args": [ { "int": config.FLEX_PERCENTAGE }, { "int": "0" } ] } ]
                      }
                    ]
                  }
                ]
              ]
            }
          ]
        },
        { "prim": "Pair", "args": [ { "prim": "Pair", "args": [ { "int": "0" }, [] ] }, { "prim": "Pair", "args": [ [], { "prim": "None" } ] } ] }
      ]
    }
  ]
}