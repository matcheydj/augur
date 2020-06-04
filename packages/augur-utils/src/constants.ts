import BigNumber from "bignumber.js";

let ONE = new BigNumber(1, 10);
let TWO = new BigNumber(2, 10);

export const FXP_ONE = new BigNumber(10, 10).exponentiatedBy(18);
export const BYTES_32 =  TWO.exponentiatedBy(252);
export const INT256_MIN_VALUE = TWO.exponentiatedBy(255).negated();
export const INT256_MAX_VALUE = TWO.exponentiatedBy(255).minus(ONE);
export const UINT256_MAX_VALUE = TWO.exponentiatedBy(256);

export enum NetworkId {
  Mainnet = '1',
  Ropsten = '3',
  Rinkeby = '4',
  Kovan = '42',
  Private1 = '101',
  Private2 = '102',
  Private3 = '103',
  Private4 = '104',
  PrivateGanache = '123456',
};

export function isDevNetworkId(id: NetworkId): boolean {
  return [
    NetworkId.Mainnet,
    NetworkId.Ropsten,
    NetworkId.Rinkeby,
    NetworkId.Kovan,
  ].indexOf(id) === -1;
}

