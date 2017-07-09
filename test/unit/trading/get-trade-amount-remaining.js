"use strict";

var assert = require("chai").assert;
var proxyquire = require("proxyquire");
var noop = require("../../../src/utils/noop");

describe("trading/get-trade-amount-remaining", function () {
  var test = function (t) {
    it(t.description, function (done) {
      var getTradeAmountRemaining = proxyquire("../../../src/trading/get-trade-amount-remaining", {
        "../rpc-interface": t.mock.rpcInterface
      });
      getTradeAmountRemaining(t.params, function (err, tradeAmountRemaining) {
        t.assertions(err, tradeAmountRemaining);
        done();
      });
    });
  };
  test({
    description: "get trade amount remaining using transaction hash",
    params: {
      transactionHash: "TRANSACTION_HASH",
      tradeAmountRemainingEventSignature: "TRADE_AMOUNT_REMAINING_SIGNATURE"
    },
    mock: {
      rpcInterface: {
        getTransactionReceipt: function (transactionHash, callback) {
          callback({
            logs: [{
              topics: ["MAKE_ORDER_SIGNATURE"]
            }, {
              topics: ["TRADE_AMOUNT_REMAINING_SIGNATURE"],
              data: "0x00000000000000000000000000000000000000000000000246ddf97976680000"
            }]
          });
        }
      }
    },
    assertions: function (err, tradeAmountRemaining) {
      assert.isNull(err);
      assert.strictEqual(tradeAmountRemaining, "0x00000000000000000000000000000000000000000000000246ddf97976680000");
    }
  });
  test({
    description: "logs not present in receipt",
    params: {
      transactionHash: "TRANSACTION_HASH",
      tradeAmountRemainingEventSignature: "TRADE_AMOUNT_REMAINING_SIGNATURE"
    },
    mock: {
      rpcInterface: {
        getTransactionReceipt: function (transactionHash, callback) {
          callback({});
        }
      }
    },
    assertions: function (err, tradeAmountRemaining) {
      assert.strictEqual(err, "logs not found");
      assert.isUndefined(tradeAmountRemaining);
    }
  });
  test({
    description: "trade amount remaining log not present",
    params: {
      transactionHash: "TRANSACTION_HASH",
      tradeAmountRemainingEventSignature: "TRADE_AMOUNT_REMAINING_SIGNATURE"
    },
    mock: {
      rpcInterface: {
        getTransactionReceipt: function (transactionHash, callback) {
          callback({
            logs: [{
              topics: ["MAKE_ORDER_SIGNATURE"]
            }]
          });
        }
      }
    },
    assertions: function (err, tradeAmountRemaining) {
      assert.strictEqual(err, "trade amount remaining log not found");
      assert.isUndefined(tradeAmountRemaining);
    }
  });
});
