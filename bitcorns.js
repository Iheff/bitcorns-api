// const request = require("request");
var limit = require("simple-rate-limiter");
var request = limit(require("request")).to(110).per(60000);

function Bitcorns() {
    this.hasData = false;
    let bitcorns_url = 'https://bitcorns.com/api';
    //let rateMax = 60000 / 110; //actually 120 per minute but lets try an max out at 110.
    this.err = {
        notFound: '404: No moisture found. DAAB warning.',
        somethingWrong: '500: something is wonky.',
        Listing: '500: TheScarecrow may have sent his flocks to this barron wasteland.',
        SingularGroupSuffix: ' - I can only find coops using their plentiful slugs',
        SingularTokenSuffix: '- I can only find tokes with help from their asset names',
        SingularCardSuffix: " - I can only find cards with help from their asset names",
    };

    this.genericApiCall = (verb = "farms", arg = "") => {

        let context = this;
        return new Promise((resolve, reject) => {

            request(bitcorns_url + '/' + verb + '/' + arg, (err, resp, bdy) => {

                console.log('request URL: ' + bitcorns_url + '/' + verb + '/' + arg);

                if (/^</.test(bdy)) {

                    return reject(context.err.notFound);

                }

                bdy = JSON.parse(bdy);

                if (resp.statusCode !== 200 || resp.headers['content-type'] !== 'application/json') return reject(context.err.notFound);

                if (arg !== "") {

                    if (bdy instanceof Object) return resolve(bdy);
                    else return reject(context.err.Listing);

                } else {

                    if (bdy instanceof Object) return resolve(bdy);
                    else return reject(context.err.Listing);

                }

            }); // end request

        });

    };

    /* not really making use of the bind here, might cut that. */

    this.boundGeneric = this.genericApiCall.bind();

    /* This section just expands the API of this modules */
    this.farms = function() {
        let context = this;
        return new Promise((resolve, reject) => {
            this.boundGeneric('farms').then(function(data) {
                return resolve(data);
            }).catch(error => {
                return reject(context.err.Listing+context.err.SingularGroupSuffix);
            });
        });
    };

    this.farm = function(arg) {
        let context = this;
        return new Promise((resolve, reject) => {
            this.boundGeneric('farm', arg).then(function(data) {
                return resolve(data);
            }).catch(error => {
                return reject(context.err.Listing);
            });
        });
    };

    this.coops = function() {
        let context = this;
        return new Promise((resolve, reject) => {
            this.boundGeneric('coops').then(function(data) {
                return resolve(data);
            }).catch(error => {
                return reject(context.err.Listing);
            });
        });
    };

    this.coop = function(arg) {
        let context = this;
        return new Promise((resolve, reject) => {
            this.boundGeneric('coops', arg).then(function(data) {
                return resolve(data);
            }).catch(error => {
                return reject(context.err.notFound+context.err.SingularGroupSuffix);
            });
        });
    };

    this.tokens = function() {
        let context = this;
        return new Promise((resolve, reject) => {
            this.boundGeneric('tokens').then(function(data) {
                return resolve(data);
            }).catch(error => {
                return reject(context.err.Listing);
            });
        });
    };

    this.token = function(arg) {
        let context = this;
        return new Promise((resolve, reject) => {
            this.boundGeneric('token', arg + '.json').then(function(data) {
                return resolve(data);
            }).catch(error => {
                return reject(context.err.notFound+context.err.SingularTokenSuffix);
            });
        });
    };

    this.cards = function() {
        let context = this;
        return new Promise((resolve, reject) => {
            this.boundGeneric('cards').then(function(data) {
                return resolve(data);
            }).catch(error => {
                return reject(context.err.Listing);
            });
        });
    };

    this.card = function(arg) {
        let context = this;
        return new Promise((resolve, reject) => {
            this.boundGeneric('cards', arg).then(function(data) {
                return resolve(data);
            }).catch(error => {
                return reject(context.err.notFound+context.err.SingularCardSuffix);
            });
        });
    };

    /* generate a cache to use instead, then we can build 
     * some interesting mapped data for cool new commands, as 
     * the current index calls are DAAB with longtail data.
     */

    this.data = {};

    this.getData = () => {

        let context = this;
        return new Promise((resolve, reject) => {

            let farmsPromise = this.farms();
            let coopsPromise = this.coops();
            let cardsPromise = this.cards();
            let tokensPromise = this.tokens();

            Promise.all([coopsPromise, farmsPromise, cardsPromise, tokensPromise]).then(function(values) {
                if (values) resolve(values);
                else reject(context.somethingWrong);
            }).catch((err) => {
                console.log(err);
            });

        });

    };

    this.getLongTailFarmData = () => {

        let context = this;
        var farmPromises = [];

        for (var i = 0; i < this.data.farms.length; i++) {

            let farmPromise = this.farm(this.data.farms[i].address);
            farmPromises.push(farmPromise);

        }

        return new Promise((resolve, reject) => {

            return Promise.all(farmPromises).then((values) => {

                if (values) resolve(values);
                else reject(context.somethingWrong);

            }).catch((err) => {

                reject(err);

            });

        });

    };

    this.fetchCache = () => {

        this.getData().then((data) => {

            let context = this;
            context.data.coops = data[0];
            context.data.farms = data[1];
            context.data.cards = data[2];
            context.data.tokens = data[3];

            /* good wauy to get IP blocked for excessive usage.*/
             return context.getLongTailFarmData().then(function(data) {

                context.data.farmsById = {};
                context.data.farmsByName = {};

                for (var i = 0; i < data.length; i++) {
                    
                    context.data.farmsById[data[i].address] = data[i];
                    context.data.farmsByName[data[i].name] = data[i];
                
                }

                this.hasData = true;
                console.log(data)
                
                
            }).catch((err) => {
                
                console.log(err)
                
            });

        }).catch((err) => {
            console.log(err)
            //reject(err);
        
        });
        /* end cache generation WIP. */
    };

    this.fetchCache();

}

module.exports = new Bitcorns();
