// const request = require("request");
const limit = require("simple-rate-limiter");
const request = limit(require("request")).to(110).per(60000);

function Bitcorns(buildLargeCacheObject = false) {
    this.hasData = false;
    let bitcorns_url = 'https://bitcorns.com/api';
    //let rateMax = 60000 / 110; //actually 120 per minute but lets try an max out at 110.
    this.err = {
        notFound: 'No moisture found.',
        somethingWrong: 'Something is wonky.',
        Listing: 'TheScarecrow may have sent his flocks to this barron wasteland.',
        SingularGroupSuffix: ' - I can only find coops using their plentiful slugs',
        SingularTokenSuffix: '- I can only find tokes with help from their asset names',
        SingularCardSuffix: " - I can only find cards with help from their asset names",
    };

    this.genericApiCall = (verb = "farms", arg = "") => {

        let context = this;
        return new Promise((resolve, reject) => {

            request(bitcorns_url + '/' + verb + '/' + arg, (err, resp, bdy) => {

                if (/^</.test(bdy)) {
                    return reject(context.err.notFound);
                }

                bdy = JSON.parse(bdy);

                if (resp.statusCode !== 200 || resp.headers['content-type'] !== 'application/json') {
                    return reject(context.err.notFound);
                }

                if (bdy instanceof Object) {
                   return resolve(bdy);
                } else {
                    return reject(context.err.Listing);
                }

            }); // end request

        });

    };

    /* not really making use of the bind here, might cut that. */

    this.boundGeneric = this.genericApiCall.bind();

    /* This section just expands the API of this modules */
    this.farms = () => {
        let context = this;
        return new Promise((resolve, reject) => {
            this.boundGeneric('farms').then(function(data) {
                return resolve(data);
            }).catch(error => {
                return reject(context.err.Listing+context.err.SingularGroupSuffix);
            });
        });
    };

    this.farm = (arg) => {
        let context = this;
        return new Promise((resolve, reject) => {
            this.boundGeneric('farms', arg).then(function(data) {
                return resolve(data);
            }).catch(error => {
                return reject(context.err.Listing+error);
            });
        });
    };

    this.coops = () => {
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

    this.tokens = () => {
        let context = this;
        return new Promise((resolve, reject) => {
            this.boundGeneric('tokens').then(function(data) {
                return resolve(data);
            }).catch(error => {
                return reject(context.err.Listing);
            });
        });
    };

    this.token = (arg) => {
        let context = this;
        return new Promise((resolve, reject) => {
            this.boundGeneric('token', arg + '.json').then(function(data) {
                return resolve(data);
            }).catch(error => {
                return reject(context.err.notFound+context.err.SingularTokenSuffix);
            });
        });
    };

    this.cards = () => {
        let context = this;
        return new Promise((resolve, reject) => {
            this.boundGeneric('cards').then(function(data) {
                return resolve(data);
            }).catch(error => {
                return reject(context.err.Listing);
            });
        });
    };

    this.card = (arg) => {
        let context = this;
        return new Promise((resolve, reject) => {
            this.boundGeneric('cards', arg).then(function(data) {
                if(!data.error){
                    return resolve(data);
                } else {
                    return reject(context.err.notFound+context.err.SingularCardSuffix);
                }
                
            }).catch(error => {
                console.log('sadFace');
                return reject(context.err.notFound+context.err.SingularCardSuffix);
            });
        });
    };

    /* generate a cache to use instead, then we can build 
     * some interesting mapped data for cool new bot commands etc, as 
     * the current index calls are DAAB with longtail data.
     */

    this.data = {};

    this.getData = () => {

        let context = this;
        return new Promise((resolve, reject) => {

            const farmsPromise = this.farms();
            const coopsPromise = this.coops();
            const cardsPromise = this.cards();
            const tokensPromise = this.tokens();

            Promise.all([coopsPromise, farmsPromise, cardsPromise, tokensPromise]).then(function(values) {
            
                if (values) {
                    resolve(values);
                } else {
				    reject(context.somethingWrong);
                }
            
            }).catch((err) => {
            
                reject(err);
            
            });

        });

    };

    this.getLongTailFarmData = () => {

        let context = this;
        let farmPromises = [];

        for (let i = 0; i < this.data.farms.length; i++) {

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
        let outerContext = this;
        this.getData().then((data) => {

            let context = this;
            context.data.coops = data[0];
            context.data.farms = data[1];
            context.data.cards = data[2];
            context.data.tokens = data[3];

            if(buildLargeCacheObject){
            
                return context.getLongTailFarmData().then(function(data) {

                    context.data.farmsById = {};
                    context.data.farmsByName = {};

                    for (let i = 0; i < data.length; i++) {
                        
                        context.data.farmsById[data[i].address] = data[i];
                        context.data.farmsByName[data[i].name] = data[i];
                        return {farmsById:context.data.farmsById,farmsByName:context.data.farmsByName};
                    }

                    outercontext.hasData = true;
                    
                }).catch((err) => {
                    
                    console.log(err)
                    
                });

            } else {
                return;
            }

        }).catch((err) => {

            console.log(err)
        
        });

        /* end cache generation WIP. */
    
    };

    this.fetchCache();

}

module.exports = new Bitcorns();
