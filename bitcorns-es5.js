"use strict";

var limit = require("simple-rate-limiter");
var request = limit(require("request")).to(110).per(60000);

function Bitcorns() {
    var _this = this;

    this.hasData = false;
    var bitcorns_url = 'https://bitcorns.com/api';
    var rateMax = 60000 / 110; //actually 120 per minute but lets try an max out at 110.
    this.err = {
        notFound: '404: No moisture found. DAAB warning.',
        somethingWrong: '500: something is wonky.',
        Listing: '500: TheScarecrow may have sent his flocks to this barron wasteland.',
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

                if (/^\</.test(bdy)) {
                    return reject();
                }

                bdy = JSON.parse(bdy);

                if (resp.statusCode !== 200 || resp.headers['content-type'] !== 'application/json') return reject(context.notFound);

                if (bdy instanceof Object) return resolve(bdy);else return reject(context.err.Listing);
            }); // end request
        });
    };

    this.boundGeneric = this.genericApiCall.bind();

    this.farms = function () {
        var _this2 = this;

        var context = this;
        return new Promise(function (resolve, reject) {
            _this2.boundGeneric('farms').then(function (data) {
                return resolve(data);
            }).catch(function (error) {
                return reject(context.err.Listing);
            });
        });
    };

    this.farm = function (arg) {
        var _this3 = this;

        var context = this;
        return new Promise(function (resolve, reject) {
            _this3.boundGeneric('farm', arg).then(function (data) {
                return resolve(data);
            }).catch(function (error) {
                return reject(context.err.Listing);
            });
        });
    };

    this.coops = function () {
        var _this4 = this;

        var context = this;
        return new Promise(function (resolve, reject) {
            _this4.boundGeneric('coops').then(function (data) {
                return resolve(data);
            }).catch(function (error) {
                return reject(context.err.Listing);
            });
        });
    };

    this.coop = function (arg) {
        var _this5 = this;

        var context = this;
        return new Promise(function (resolve, reject) {
            _this5.boundGeneric('coops', arg).then(function (data) {
                return resolve(data);
            }).catch(function (error) {
                return reject(context.err.Listing);
            });
        });
    };

    this.tokens = function () {
        var _this6 = this;

        var context = this;
        return new Promise(function (resolve, reject) {
            _this6.boundGeneric('tokens').then(function (data) {
                return resolve(data);
            }).catch(function (error) {
                return reject(context.err.Listing);
            });
        });
    };

    this.token = function (arg) {
        var _this7 = this;

        var context = this;
        return new Promise(function (resolve, reject) {
            _this7.boundGeneric('token', arg + '.json').then(function (data) {
                return resolve(data);
            }).catch(function (error) {
                return reject(context.err.SingularTokenSuffix);
            });
        });
    };

    this.cards = function () {
        var _this8 = this;

        var context = this;
        return new Promise(function (resolve, reject) {
            _this8.boundGeneric('cards').then(function (data) {
                return resolve(data);
            }).catch(function (error) {
                return reject(context.err.Listing);
            });
        });
    };

    this.card = function (arg) {
        var _this9 = this;

        var context = this;
        return new Promise(function (resolve, reject) {
            _this9.boundGeneric('cards', arg).then(function (data) {
                return resolve(data);
            }).catch(function (error) {
                return reject(context.err.SingularCardSuffix);
            });
        });
    };

    // create a data object to refernce for quick lookups.
    this.data = {};

    this.getData = function () {
        var context = _this;
        return new Promise(function (resolve, reject) {

            var farmsPromise = _this.farms();
            var coopsPromise = _this.coops();
            var cardsPromise = _this.cards();
            var tokensPromise = _this.tokens();
            //console.log(farmsPromise)

            Promise.all([coopsPromise, farmsPromise, cardsPromise, tokensPromise]).then(function (values) {
                console.log('all RESULT');
                //console.log(values);
                if (values) resolve(values);else reject(context.somethingWrong);
            }).catch(function (err) {
                console.log(err);
            });
        });
    };
}

module.exports = new Bitcorns();
