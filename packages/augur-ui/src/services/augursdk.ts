let sdk = null;
export let augurSdk = {
  get: () => sdk?.get()
}

export async function loadAugur() {
  const { SDK } = (await import(/* webpackChunkName: 'augur-sdk' */ './sdk'));
  sdk = new SDK();
  return sdk;
}

