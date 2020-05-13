export const MARKETS_ACTIONS = {
  UPDATE_ORDER_BOOK: 'UPDATE_ORDER_BOOK',
  CLEAR_ORDER_BOOK: 'CLEAR_ORDER_BOOK',
  UPDATE_MARKETS_DATA: 'UPDATE_MARKETS_DATA',
  REMOVE_MARKET: 'REMOVE_MARKET'
};

export const DEFAULT_MARKETS_STATE = {
  orderBooks: {},
  marketInfos: {},
};

export const STUBBED_MARKETS_ACTIONS = {
  updateOrderBook: (marketId, orderBook) => {},
  clearOrderBook: () => {},
  updateMarketsData: (marketInfos) => {},
  removeMarket: (marketId) => {},
}

export const MOCK_MARKETS_STATE = {
  orderBooks: {},
  marketInfos: {},
};