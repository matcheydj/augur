let sdk = null;
export let augurSdk = {
  get: () => sdk?.get(),
  subscribe: (dispatch) => sdk?.subscribe(dispatch)
}

export async function loadAugur() {
  const { SDK } = (await import(/* webpackChunkName: 'augur-sdk' */ './sdk'));
  sdk = new SDK();
  return sdk;
}

