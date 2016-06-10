#!/usr/bin/env node
/**
 * Timing the on-contract market info collector.
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var fs = require("fs");
var join = require("path").join;
var async = require("async");
var chalk = require("chalk");
var madlibs = require("madlibs");
var utils = require("../src/utilities");
var augurpath = "../src/index";
var tools = require("../test/tools");
var augur = tools.setup(require(augurpath));

var DATAFILE = join(__dirname, "..", "data", "timing-getMarketsInfo.csv");
var MAX_NUM_MARKETS = 100;
try {
    MAX_NUM_MARKETS = parseInt(process.argv[2]);
} catch (ex) {
    MAX_NUM_MARKETS = 100;
}

function createMarkets(numMarketsToCreate, callback) {
    var minValue = 1;
    var maxValue = 2;
    var numOutcomes = 2;
    console.log(chalk.blue.bold("Creating " + numMarketsToCreate + " markets..."));
    async.forEachOfSeries(new Array(numMarketsToCreate), function (_, index, next) {
        var suffix = Math.random().toString(36).substring(4);
        var description = madlibs.adjective() + "-" + madlibs.noun() + "-" + suffix;
        augur.createSingleEventMarket({
            branchId: augur.branches.dev,
            description: description,
            expDate: new Date().getTime() / 500,
            minValue: minValue,
            maxValue: maxValue,
            numOutcomes: numOutcomes,
            resolution: "lmgtfy.com",
            tradingFee: "0.02",
            makerFees: "0.5",
            extraInfo: null,
            tags: ["spam", "augur.js", "canned meat"],
            onSent: function (r) {},
            onSuccess: function (r) {
                console.log(chalk.green(r.marketID), chalk.cyan.dim(description));
                augur.generateOrderBook({
                    market: r.marketID,
                    liquidity: 50,
                    initialFairPrices: ["0.4", "0.5"],
                    startingQuantity: 10,
                    bestStartingQuantity: 15,
                    priceWidth: "0.4"
                }, {
                    onBuyCompleteSets: function (res) {},
                    onSetupOutcome: function (res) {},
                    onSetupOrder: function (res) {},
                    onSuccess: function (res) {
                        if (index % 10) return next();
                        augur.cashFaucet(function (r) {}, function (r) { next(); }, next);
                    },
                    onFailed: next
                });
            },
            onFailed: next
        });
    }, callback);
}

function time_getMarketsInfo(numMarkets) {
    fs.writeFileSync(DATAFILE, "\"# markets\",\"time elapsed (seconds)\"\n");
    async.forEachOfSeries(new Array(numMarkets), function (_, index, next) {
        augur = tools.setup(tools.reset(augurpath));
        var startTime = new Date().getTime();
        augur.getMarketsInfo({
            branch: augur.branches.dev,
            offset: 0,
            numMarketsToLoad: index + 1,
            callback: function (info) {
                if (!info || info.error) return next(info);
                var dt = ((new Date().getTime() - startTime) / 1000.0).toString();
                var numMarkets = Object.keys(info).length.toString();
                console.log(numMarkets + "\t" + dt);
                fs.appendFileSync(DATAFILE, numMarkets + "," + dt + "\n");
                next();
            }
        });
    }, process.exit);
}

function timing(maxNumMarkets) {
    var numMarkets = parseInt(augur.getNumMarketsBranch(augur.branches.dev));
    console.log("Found", numMarkets, "markets");
    if (numMarkets >= maxNumMarkets) {
        return time_getMarketsInfo(numMarkets);
    }
    createMarkets(maxNumMarkets - numMarkets, function (err) {
        if (err) return console.error(err);
        time_getMarketsInfo(maxNumMarkets);
    });
}

timing(MAX_NUM_MARKETS);
