# bitcorns-api-connector
A Javascript Bitcorns API connector

## Install bitcorns-api-connector
Install using npm
```
$ npm install bitcorns-api
```


```js
const bitcorns = require('bitcorns-api'); 
```

## Use bitcorns api connector
```js

bitcorns.farms().then( data =>{
  // do something with data
}).catch(error => {
   // do something with error
});


bitcorns.farm('18mxQdLxcLstD6ttbHykvEoAYdu4eADtEf').then( data =>{
  // do something with data
}).catch(error => {
   // do something with error
});


bitcorns.coops().then( data =>{
  // do something with data
}).catch(error => {
   // do something with error
});


bitcorns.coop('corn-tang-clan').then( data =>{
  // do something with data
}).catch(error => {
   // do something with error
});



bitcorns.cards().then( data =>{
  // do something with data
}).catch(error => {
   // do something with error
});


bitcorns.card('THESCARECROW').then( data =>{
  // do something with data
}).catch(error => {
   // do something with error
});

bitcorns.tokens().then( data =>{
  // do something with data
}).catch(error => {
   // do something with error
});


bitcorns.token('BITCORN').then( data =>{
  // do something with data
}).catch(error => {
   // do something with error
});


```
