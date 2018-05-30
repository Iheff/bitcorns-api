# bitcorns-api-connector
A Javascript Bitcorns API connector

## Install
Place your bitcorns-api-connector lib into a relevant direcotry for your project, then call the module from your project files:

````
const bitcorns = require('./models/bitcorns');
```

You can then start using the bitcorns api:

## Use
```js 
bitcorns.farms().then( data => {
  // do something with data!
}).catch( error => {
  // do something with error!
});
```

```js 
bitcorns.farm('some-farm-address').then( data => {
  // do something with data!
}).catch( error => {
  // do something with error!
});
```
