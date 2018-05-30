var limit = require("simple-rate-limiter");
var request = limit(require("request")).to(110).per(60000);

function Bitcorns() {
    this.hasData = false;
    let bitcorns_url = 'https://bitcorns.com/api';
    let rateMax = 60000 / 110; //actually 120 per minute but lets try an max out at 110.
    this.err = {
        notFound: '404: No moisture found. DAAB warning.',
        somethingWrong: '500: something is wonky.',
        Listing: '500: TheScarecrow may have sent his flocks to this barron wasteland.',
        SingularGroupSuffix: ' - I can only find coops using their plentiful slugs',
        SingularTokenSuffix: '- I can only find tokes with help from their asset names',
        SingularCardSuffix: " - I can only find cards with help from their asset names",
    }


    this.genericApiCall = (verb = "farms", arg = "") => {
        let context = this;
        return new Promise((resolve, reject) => {

            request(bitcorns_url + '/' + verb + '/' + arg, (err, resp, bdy) => {
            
                if (/^\</.test(bdy)) {
                    return reject();
                }

                bdy = JSON.parse(bdy);
               
                if (resp.statusCode !== 200 || resp.headers['content-type'] !== 'application/json') return reject(context.notFound);
                   
                    if (bdy instanceof Object) return resolve(bdy)
                    else return reject(context.err.Listing);
               
            }); // end request
        });
    }

    this.boundGeneric = this.genericApiCall.bind();

    this.farms = function() {
        let context = this;
        return new Promise((resolve, reject) => {
            this.boundGeneric('farms').then(function(data) {
                return resolve(data);
            }).catch(error => {
                return reject(context.err.Listing);
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
                return reject(context.err.Listing);
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
                return reject(context.err.SingularTokenSuffix);
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
                return reject(context.err.SingularCardSuffix);
            });
        });
    };
    
    // create a data object to refernce for quick lookups.
    this.data = {}

    this.getData = () => {
        let context = this;
        return new Promise((resolve, reject) => {

            let farmsPromise = this.farms()
            let coopsPromise = this.coops()
            let cardsPromise = this.cards()
            let tokensPromise = this.tokens();
            //console.log(farmsPromise)

            Promise.all([coopsPromise, farmsPromise, cardsPromise, tokensPromise]).then(function(values) {
                console.log('all RESULT');
                //console.log(values);
                if (values) resolve(values);
                else reject(context.somethingWrong);
            }).catch((err) => {
                console.log(err)
            });
        });
    }
}

module.exports = new Bitcorns();
