const express = require('express');
const app = express();
//const bodyParser = require('body-parser');
const Gdax = require('../node_modules/gdax');
const publicClient = new Gdax.PublicClient();
const orderBookFuncs = require('./orderBook');

//app.use(bodyParser.urlencoded({extended: true}));
//app.use(bodyParser.json());
app.use(express.static('public'));
//app.set('view engine', 'ejs');


//Start Server
app.listen(8080, function() {
  console.log('listening on IDE 8080'); //https://ide50-tony-rr.cs50.io:8080/
});


//Serves Root HTML file
app.get('/', function(req, res){
    res.sendFile('/home/ubuntu/workspace/gdax'+'/index1.html');
});


//Get's Historical Data
var hp;
publicClient.getProductHistoricRates(
  'ETH-USD',
  { granularity: 300 },
  (error, response, data) => {
  hp = data;
});

//Updates the Historical Prices every 5m
setInterval(function(){
  publicClient.getProductHistoricRates(
    'ETH-USD',
    { granularity: 300 },
    (error, response, data) => {
    hp = data;
  });
}, 300000);


//Route that Sends Historical Data to Browser
app.get('/chart', (req, res) => {
  if (hp) {
    res.send(hp);
  }
});

//Variables to store called API data on Server where we send to browser
let bidETH;
let askETH;
let midETH;
let midBTC;
let bidTotal;
let askTotal;
let orderBookArr;

//Makes call to GDAX API and stored latest Price and OrderBook Details to Server every 2s
setInterval(function(){
    publicClient.getProductOrderBook('ETH-USD',{ level: 3 },(error, response, book) => {
    bidETH = parseFloat(book['bids'][0][0]);
    askETH = parseFloat(book['asks'][0][0]);
    midETH = ((bidETH + askETH)/2).toFixed(2);
    bidTotal = orderBookFuncs.sum(book['bids'], -1.50);
    askTotal = orderBookFuncs.sum(book['asks'], 1.50);
    orderBookArr = [book['bids'], book['asks']];
    });
}, 2000);


//Route that Sends current mid (price) to browser
app.get('/price', (req, res) => {
    if (midETH) {
        res.send(midETH.toString());
    }
});

//ROute that Sends object of Total Bids & Asks at specified levels and also DataPoints to Chart Orderbook
app.get('/bidAsk', (req, res) => {
    if (bidTotal) {
        res.send({
          bidTotal: bidTotal.toFixed(2),
          askTotal: askTotal.toFixed(2),
          chartData: orderBookFuncs.orderChart(orderBookArr)
        });
    }
});