import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import getValue from 'utils/get-value';
import { AppState } from 'appStore';
import * as constants from 'modules/common/constants';

import Row from 'modules/common/row';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { TXEventName } from '@augurproject/sdk/src/constants';
import { OPEN } from 'modules/common/constants';
import { selectCancelingOrdersState } from 'appStore/select-state';
import { removeCanceledOrder } from 'modules/pending-queue/actions/pending-queue-management';
import { removePendingOrder } from 'modules/orders/actions/pending-orders-management';
import { calcPercentageFromPrice } from 'utils/format-number';

const { COLUMN_TYPES } = constants;

const mapStateToProps = (state: AppState, ownProps) => {
  const { blockchain, marketInfos} = state;
  const { openOrder, marketId }  = ownProps;
  const market = marketInfos[marketId];
  const { outcomeId } = openOrder;
  const usePercent = !!market && outcomeId === constants.INVALID_OUTCOME_ID && market.marketType === constants.SCALAR;
  return {
    currentTimestamp: blockchain.currentAugurTimestamp,
    pendingOrderCancellations: selectCancelingOrdersState(state),
    usePercent,
    marketType: market.marketType,
    minPrice: market && market.minPrice,
    maxPrice: market && market.maxPrice,
  }
};

const mapDispatchToProps = (dispatch: ThunkDispatch<void, any, Action>) => ({
  removeCanceledOrder: id => dispatch(removeCanceledOrder(id)),
  removePendingOrder: (pendingId, marketId) => dispatch(removePendingOrder(pendingId, marketId)),
});

const mergeProps = (sP: any, dP: any, oP: any) => {
  const marketId = oP.marketId;
  const openOrder = oP.openOrder;
  const tokensEscrowed = openOrder.tokensEscrowed;
  const sharesEscrowed = openOrder.sharesEscrowed;
  let avgPrice = openOrder.avgPrice;
  const unmatchedShares = openOrder.unmatchedShares;
  const isCanceling =
    sP.pendingOrderCancellations[openOrder.id];

  const orderLabel =
    openOrder.description || openOrder.name || openOrder.outcomeName;

  if (sP.usePercent) {
    const avgPricePercent = calcPercentageFromPrice(
      avgPrice.value,
      sP.minPrice,
      sP.maxPrice
    );
    avgPrice = { ...avgPrice, percent: `${avgPricePercent}%` }
  }
  const columnProperties = [
    {
      key: 'orderName',
      columnType: COLUMN_TYPES.TEXT,
      text: orderLabel,
      keyId: openOrder.id,
    },
    {
      key: 'orderType',
      columnType: COLUMN_TYPES.POSITION_TYPE,
      type: openOrder.type,
      showCountdown: true,
      expiry: openOrder.expiry,
      currentTimestamp: sP.currentTimestamp,
    },
    {
      key: 'unmatchedShares',
      columnType: COLUMN_TYPES.VALUE,
      value: openOrder.unmatchedShares && unmatchedShares,
      keyId: 'openOrder-unmatchedShares-' + openOrder.id,
    },
    {
      key: 'avgPrice',
      columnType: COLUMN_TYPES.VALUE,
      value: avgPrice,
      usePercent: !!avgPrice.percent,
      useFull: sP.marketType === constants.SCALAR ? false : true,
      showFullPrecision: sP.marketType === constants.SCALAR ? true : false,
      showDenomination: sP.marketType === constants.SCALAR ? true : false,
      keyId: 'openOrder-price-' + openOrder.id,
    },
    {
      key: 'tokensEscrowed',
      columnType: COLUMN_TYPES.VALUE,
      value: tokensEscrowed,
      useFull: true,
      showEmptyDash: true,
      keyId: 'openOrder-tokensEscrowed-' + openOrder.id,
    },
    {
      key: 'sharesEscrowed',
      columnType: COLUMN_TYPES.VALUE,
      value: sharesEscrowed,
      showEmptyDash: true,
      keyId: 'openOrder-sharesEscrowed-' + openOrder.id,
    },
    {
      key: 'cancel',
      columnType: COLUMN_TYPES.CANCEL_TEXT_BUTTON,
      disabled: !!isCanceling,
      text: null,
      showCountdown: true,
      expiry: openOrder.expiry,
      currentTimestamp: sP.currentTimestamp,
      pending: !!isCanceling || (openOrder.status && openOrder.status !== OPEN),
      status: !!isCanceling ? isCanceling.status : openOrder.status,
      action: async (e: Event) => {
        e.stopPropagation();
        if (!!isCanceling) {
          dP.removeCanceledOrder(openOrder.id)
        }
        else if ((openOrder.status === TXEventName.Failure || openOrder.status === TXEventName.Success)) {
          dP.removePendingOrder(openOrder.id, marketId);
        } else {
          await openOrder.cancelOrder(openOrder);
        }
      },
    },
  ];
  return {
    ...oP,
    ...sP,
    ...dP,
    rowProperties: openOrder,
    columnProperties,
    styleOptions: {
      noToggle: oP.extendedViewNotOnMobile,
      openOrder: true,
    },
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )(Row)
);
