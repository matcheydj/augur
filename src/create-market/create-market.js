"use strict";

var assign = require("lodash.assign");
var BigNumber = require("bignumber.js");
var immutableDelete = require("immutable-delete");
var speedomatic = require("speedomatic");
var getMarketCreationCost = require("./get-market-creation-cost");
var api = require("../api");
var encodeTag = require("../format/tag/encode-tag");
var convertDecimalToFixedPoint = require("../utils/convert-decimal-to-fixed-point");
var noop = require("../utils/noop");
var ZERO = require("../constants").ZERO;
var DEFAULT_NUM_TICKS = require("../constants").DEFAULT_NUM_TICKS;

/**
 * @param {Object} p Parameters object.
 * @param {string} p.universe Universe on which to create this market.
 * @param {number} p._endTime Market expiration timestamp, in seconds.
 * @param {number} p._numOutcomes Number of outcomes this market has, as an integer on [2, 8].
 * @param {string=} p._feePerEthInWei Amount of wei per ether settled that goes to the market creator, as a base-10 string.
 * @param {string} p._denominationToken Ethereum address of the token used as this market's currency.
 * @param {string} p._creator Ethereum address of the account that is creating this market.
 * @param {string} p._minDisplayPrice Minimum display (non-normalized) price for this market, as a base-10 string.
 * @param {string} p._maxDisplayPrice Maximum display (non-normalized) price for this market, as a base-10 string.
 * @param {string} p._designatedReporterAddress Ethereum address of this market's designated reporter.
 * @param {string} p._topic The topic (category) to which this market belongs, as a UTF8 string.
 * @param {string=} p._numTicks The number of ticks for this market (default: DEFAULT_NUM_TICKS).
 * @param {Object=} p._extraInfo Extra info which will be converted to JSON and logged to the chain in the CreateMarket event.
 * @param {{signer: buffer|function, accountType: string}=} p.meta Authentication metadata for raw transactions.
 * @param {function} p.onSent Called if/when the createMarket transaction is broadcast to the network.
 * @param {function} p.onSuccess Called if/when the createMarket transaction is sealed and confirmed.
 * @param {function} p.onFailed Called if/when the createMarket transaction fails.
 */
function createMarket(p) {
  api().Universe.getReportingWindowByMarketEndTime({ tx: { to: p.universe }, _endTime: p._endTime }, function (err, reportingWindow) {
    if (err) return p.onFailed(err);
    if (new BigNumber(reportingWindow, 16).eq(ZERO)) {
      return api().Universe.getOrCreateReportingWindowByMarketEndTime({
        tx: { to: p.universe },
        _endTime: p._endTime,
        meta: p.meta,
        onSent: noop,
        onSuccess: function () { createMarket(p); },
        onFailed: p.onFailed,
      });
    }
    getMarketCreationCost({ universe: p.universe, meta: p.meta }, function (err, marketCreationCost) {
      if (err) return p.onFailed(err);
      var numTicks = p._numTicks || DEFAULT_NUM_TICKS;
      api().ReportingWindow.createMarket(assign({}, immutableDelete(p, "universe"), {
        tx: { to: reportingWindow, value: speedomatic.fix(marketCreationCost.etherRequiredToCreateMarket, "hex") },
        _feePerEthInWei: p._feePerEthInWei,
        _numTicks: numTicks,
        _minDisplayPrice: convertDecimalToFixedPoint(p._minDisplayPrice, numTicks),
        _maxDisplayPrice: convertDecimalToFixedPoint(p._maxDisplayPrice, numTicks),
        _topic: encodeTag(p._topic),
        _extraInfo: p._extraInfo ? JSON.stringify(p._extraInfo) : "",
      }));
    });
  });
}

module.exports = createMarket;
