import { augur } from "services/augurjs";
import { updateLoginAccountAction } from "modules/common/types/login-account";
import logError from "utils/log-error";

export const updateTopBarPL = (
  options: any = {},
  callback: Function = logError
) => (dispatch: Function, getState: Function) => {
  const { universe, loginAccount } = getState();
  if (loginAccount.address == null || universe.id == null)
    return callback(null);
  augur.augurNode.submitRequest(
    "getProfitLoss",
    {
      universe: universe.id,
      account: loginAccount.address,
      startTime: null,
      endTime: null,
      periodInterval: null,
      marketId: null
    },
    (err: any, data: any) => {
      if (err) return callback(err);
      dispatch(
        updateLoginAccountAction({
          realizedPL: data[data.length - 1].realized,
          realizedPLPercent: data[data.length - 1].realizedPercent
        })
      );
    }
  );
};
