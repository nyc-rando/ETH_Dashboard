//Returns Filtered Array from Order book API object
function filterBook(arr, level){
  var end = parseFloat(arr[0][0]) + level;
  var newArr = [];
  for (var i=0; i < arr.length; i++){
    newArr.push([parseFloat(arr[i][0]), parseFloat(arr[i][1])]);
  }
  if (level < 0) {
    return newArr.filter( el => el[0] >= end );
  } else {
    return newArr.filter( el => el[0] <= end );
  }
}


//Creates unique Key/Value Obj for Price-Level and total Orders so no dupes in the Object
function createObj(arr){
  var obj = {};
  arr.forEach( el => {
    comparer(obj, parseFloat(el[0]), parseFloat(el[1]));
  });
  return obj;
}

//This function consolidates keys.  Checks each Price-Level and Creates new Key or adds orders to existing Key
function comparer(book, priceLevel, orderAmt){
  if (book[priceLevel]){
    book[priceLevel] = book[priceLevel] + orderAmt;
  } else {
    book[priceLevel] = orderAmt;
  }
}

//Conbines the above functions to return the Order book DataPoints we want to chart on our browser
function orderChart(arr){
  var bidObj = createObj(filterBook(arr[0], -10));
  var askObj = createObj(filterBook(arr[1], 10));
  var allOrders =  ordersArr(bidObj).concat(ordersArr(askObj));
  var allPrices = Object.keys(bidObj).concat(Object.keys(askObj));
  return [allOrders, allPrices];
}

//Will sum all of the orders when passed in the Asks Array from GDAX up to a specified level
function sum(arr, level){
  var end = parseFloat(arr[0][0]) + level;
  var newArr = [];
  for (var i=0; i < arr.length; i++){
    newArr.push([parseFloat(arr[i][0]), parseFloat(arr[i][1])]);
  }
  if (level < 0) {
    return newArr.filter( el => el[0] >= end ).reduce((a,b) => {return a + b[1] }, 0.00);
  } else {
    return newArr.filter( el => el[0] <= end ).reduce((a,b) => {return a + b[1] }, 0.00);
  }
  //console.log('First item - ' + testing[0] + '  Last item - ' + testing[testing.length-1] + '  length - ' + testing.length);
}

//Will sum all of the orders in the Created object of Price Levels
function totalOrders(obj){
  var newArr = [];
  for (var key in obj){
    newArr.push(obj[key]);
  }
  return newArr.reduce((a,b) => a+b);
}

//Returns an Array of all of the values in an object
function ordersArr(obj){
  var newArr = [];
  for (var key in obj){
    newArr.push(obj[key]);
  }
  return newArr;
}

//Object of all functions to export to server
var funcObj = {
    totalOrders: totalOrders,
    createObj: createObj,
    comparer: comparer,
    sum: sum,
    orderChart: orderChart
};

//Exports above Object to our server
module.exports = funcObj;