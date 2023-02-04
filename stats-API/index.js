const express = require('express')
const app = express()

// Function retrieving full data about packs
const {packsData} = require('../statistics/index.js')

app.use(express.json())

// Please uncomment these lines if you want to set CORS
// app.use((req, res, next) => {
//     res.append('Access-Control-Allow-Origin', ['*']);
//     res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     res.append('Access-Control-Allow-Headers', 'Content-Type');
//     next();
// });

app.get('/stats/packs', (req,res) => {
    packsData().then((result) => {
        res.status(200).json(result)
    })
    .catch((error)=>{
        res.status(400).json(error.toString())
    })
})

app.get('/stats/pack/:type', (req,res) => {
    const type = req.params.type
    packsData().then((result) => {
        if(result[type])
        {
            res.status(200).json(result[type])
        }
        else
        {
            res.status(400).json('There is no pack of the '+type+' type')
        }
        
    })
    .catch((error)=>{
        res.status(400).json(error)
    })
})

app.get('/stats/pack/locked/:id', (req,res) => {
    const id = parseInt(req.params.id)
    packsData().then((result) => {
        if (result.locked[id]){
            res.status(200).json(result.locked[id])
        }
        else
        {
            res.status(400).json('There is no locked pack with this id.')
        }        
    })
    .catch((error)=>{
        res.status(400).json(error)
    })
})

app.listen(8080, () => {
    console.log("Serveur à l'écoute")
})