import { updateSdk } from 'modules/auth/actions/update-sdk';
import { toChecksumAddress } from 'ethereumjs-util';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { PersonalSigningWeb3Provider } from 'utils/personal-signing-web3-provider';
import { ACCOUNT_TYPES, FORTMATIC_API_KEY, FORTMATIC_API_TEST_KEY, NETWORK_IDS } from 'modules/common/constants';
import { windowRef } from 'utils/window-ref';
import { AppState } from 'appStore';
import { getNetwork } from 'utils/get-network-name';
import { AppStatus } from 'modules/app/store/app-status';

export const loginWithFortmatic = () => async (
  dispatch: ThunkDispatch<void, any, Action>,
  getState: () => AppState,
) => {
  const networkId: string = AppStatus.get().env.networkId;
  const supportedNetwork = getNetwork(networkId);

  if (supportedNetwork) {
    try {
      // Split point +_ dynamic load for fortmatic
      const {default: Fortmatic} = await import(/* webpackChunkName: "fortmatic" */ 'fortmatic');
      const fm = new Fortmatic(networkId === NETWORK_IDS.Kovan ? FORTMATIC_API_TEST_KEY : FORTMATIC_API_KEY, supportedNetwork);
      const provider = new PersonalSigningWeb3Provider(fm.getProvider());

      windowRef.fm = fm;

      const accounts = await fm.user.login();

      const account = toChecksumAddress(accounts[0]);

      const accountObject = {
        address: account,
        mixedCaseAddress: account,
        meta: {
          address: account,
          signer: provider.getSigner(),
          openWallet: () => fm.user.settings(),
          accountType: ACCOUNT_TYPES.FORTMATIC,
          email: null,
          profileImage: null,
          isWeb3: true,
        },
      };

      dispatch(updateSdk(accountObject, undefined));
    }
    catch (error) {
      throw error;
    }
  } else {
    throw Error(`Network ${networkId} not supported.`)
  }
};
