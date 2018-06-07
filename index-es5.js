"use strict";

// const request = require("request");
var limit = require("simple-rate-limiter");
var request = limit(require("request")).to(110).per(60000);

function Bitcorns() {
    var _this = this;

    var buildLargeCacheObject = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    this.hasData = false;
    var bitcorns_url = 'https://bitcorns.com/api';
    //let rateMax = 60000 / 110; //actually 120 per minute but lets try an max out at 110.
    this.err = {
        notFound: 'No moisture found.',
        somethingWrong: 'Something is wonky.',
        Listing: 'TheScarecrow may have sent his flocks to this barron wasteland.',
        SingularGroupSuffix: ' - I can only find coops using their plentiful slugs',
        SingularTokenSuffix: '- I can only find tokes with help from their asset names',
        SingularCardSuffix: " - I can only find cards with help from their asset names"
    };

    this.genericApiCall = function () {
        var verb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "farms";
        var arg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";


        var context = _this;
        return new Promise(function (resolve, reject) {

            request(bitcorns_url + '/' + verb + '/' + arg, function (err, resp, bdy) {

                if (/^</.test(bdy)) {

                    return reject(context.err.notFound);
                }

                bdy = JSON.parse(bdy);

                if (resp.statusCode !== 200 || resp.headers['content-type'] !== 'application/json') return reject(context.err.notFound);

                if (bdy instanceof Object) return resolve(bdy);else return reject(context.err.Listing);
            }); // end request
        });
    };

    /* not really making use of the bind here, might cut that. */

    this.boundGeneric = this.genericApiCall.bind();

    /* This section just expands the API of this modules */
    this.farms = function () {
        var context = _this;
        return new Promise(function (resolve, reject) {
            _this.boundGeneric('farms').then(function (data) {
                return resolve(data);
            }).catch(function (error) {
                return reject(context.err.Listing + context.err.SingularGroupSuffix);
            });
        });
    };

    this.farm = function (arg) {
        var context = _this;
        return new Promise(function (resolve, reject) {
            _this.boundGeneric('farms', arg).then(function (data) {
                return resolve(data);
            }).catch(function (error) {
                return reject(context.err.Listing + error);
            });
        });
    };

    this.coops = function () {
        var context = _this;
        return new Promise(function (resolve, reject) {
            _this.boundGeneric('coops').then(function (data) {
                return resolve(data);
            }).catch(function (error) {
                return reject(context.err.Listing);
            });
        });
    };

    this.coop = function (arg) {
        var _this2 = this;

        var context = this;
        return new Promise(function (resolve, reject) {
            _this2.boundGeneric('coops', arg).then(function (data) {
                return resolve(data);
            }).catch(function (error) {
                return reject(context.err.notFound + context.err.SingularGroupSuffix);
            });
        });
    };

    this.tokens = function () {
        var context = _this;
        return new Promise(function (resolve, reject) {
            _this.boundGeneric('tokens').then(function (data) {
                return resolve(data);
            }).catch(function (error) {
                return reject(context.err.Listing);
            });
        });
    };

    this.token = function (arg) {
        var context = _this;
        return new Promise(function (resolve, reject) {
            _this.boundGeneric('token', arg + '.json').then(function (data) {
                return resolve(data);
            }).catch(function (error) {
                return reject(context.err.notFound + context.err.SingularTokenSuffix);
            });
        });
    };

    this.cards = function () {
        var context = _this;
        return new Promise(function (resolve, reject) {
            _this.boundGeneric('cards').then(function (data) {
                return resolve(data);
            }).catch(function (error) {
                return reject(context.err.Listing);
            });
        });
    };

    this.card = function (arg) {
        var context = _this;
        return new Promise(function (resolve, reject) {
            _this.boundGeneric('cards', arg).then(function (data) {
                if (!data.error) {
                    return resolve(data);
                } else {
                    return reject(context.err.notFound + context.err.SingularCardSuffix);
                }
            }).catch(function (error) {
                console.log('sadFace');
                return reject(context.err.notFound + context.err.SingularCardSuffix);
            });
        });
    };

    /* generate a cache to use instead, then we can build 
     * some interesting mapped data for cool new bot commands etc, as 
     * the current index calls are DAAB with longtail data.
     */

    this.data = {};

    this.getData = function () {

        var context = _this;
        return new Promise(function (resolve, reject) {

            var farmsPromise = _this.farms();
            var coopsPromise = _this.coops();
            var cardsPromise = _this.cards();
            var tokensPromise = _this.tokens();

            Promise.all([coopsPromise, farmsPromise, cardsPromise, tokensPromise]).then(function (values) {
                if (values) resolve(values);else reject(context.somethingWrong);
            }).catch(function (err) {
                reject(err);
            });
        });
    };

    this.getLongTailFarmData = function () {

        var context = _this;
        var farmPromises = [];

        for (var i = 0; i < _this.data.farms.length; i++) {

            var farmPromise = _this.farm(_this.data.farms[i].address);
            farmPromises.push(farmPromise);
        }

        return new Promise(function (resolve, reject) {

            return Promise.all(farmPromises).then(function (values) {

                if (values) resolve(values);else reject(context.somethingWrong);
            }).catch(function (err) {

                reject(err);
            });
        });
    };

    this.fetchCache = function () {

        _this.getData().then(function (data) {

            var context = _this;
            context.data.coops = data[0];
            context.data.farms = data[1];
            context.data.cards = data[2];
            context.data.tokens = data[3];

            if (buildLargeCacheObject) {
                return context.getLongTailFarmData().then(function (data) {

                    context.data.farmsById = {};
                    context.data.farmsByName = {};

                    for (var i = 0; i < data.length; i++) {

                        context.data.farmsById[data[i].address] = data[i];
                        context.data.farmsByName[data[i].name] = data[i];
                    }

                    this.hasData = true;
                    //console.log(data)

                }).catch(function (err) {

                    console.log(err);
                });
            } else {
                return;
            }
        }).catch(function (err) {
            console.log(err);
            //reject(err);
        });
        /* end cache generation WIP. */
    };

    this.fetchCache();
}

module.exports = new Bitcorns();
