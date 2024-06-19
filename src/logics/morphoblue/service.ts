import { BigNumber } from 'ethers';
import { Morpho, Morpho__factory } from './contracts';
import { MorphoInterface } from './contracts/Morpho';
import * as common from '@protocolink/common';
import { getContractAddress, getMarket } from './configs';

export class Service extends common.Web3Toolkit {
  VIRTUAL_SHARES = 1e6;
  VIRTUAL_ASSETS = 1;

  private _morpho?: Morpho;
  get morpho() {
    if (!this._morpho) {
      this._morpho = Morpho__factory.connect(getContractAddress(this.chainId, 'Morpho'), this.provider);
    }
    return this._morpho;
  }

  private _morphoIface?: MorphoInterface;
  get morphoIface() {
    if (!this._morphoIface) {
      this._morphoIface = Morpho__factory.createInterface();
    }
    return this._morphoIface;
  }

  async getLoanToken(marketId: string) {
    const market = getMarket(this.chainId, marketId);
    const loanToken = await this.getToken(market.loanToken.address);
    return loanToken;
  }

  async getCollateralToken(marketId: string) {
    const market = getMarket(this.chainId, marketId);
    const collateralToken = await this.getToken(market.collateralToken.address);
    return collateralToken;
  }

  async getSupplyBalance(marketId: string, account: string) {
    const loanToken = await this.getLoanToken(marketId);
    const { supplyShares } = await this.morpho.position(marketId, account);
    const { totalSupplyAssets, totalSupplyShares } = await this.morpho.market(marketId);

    const supplyBalance = this.toAssetsUp(supplyShares, totalSupplyAssets, totalSupplyShares);

    return new common.TokenAmount(loanToken).setWei(supplyBalance);
  }

  async getCollateralBalance(marketId: string, account: string) {
    const collateralToken = await this.getCollateralToken(marketId);
    const { collateral } = await this.morpho.position(marketId, account);

    return new common.TokenAmount(collateralToken).setWei(collateral);
  }

  async getBorrowBalance(marketId: string, account: string, loanToken?: common.Token) {
    if (!loanToken) {
      loanToken = await this.getLoanToken(marketId);
    }

    const borrowShares = await this.getBorrowShares(marketId, account);
    const { totalBorrowAssets, totalBorrowShares } = await this.morpho.market(marketId);

    const borrowBalance = this.toAssetsDown(borrowShares, totalBorrowAssets, totalBorrowShares);

    return new common.TokenAmount(loanToken).setWei(borrowBalance);
  }

  async getBorrowShares(marketId: string, account: string) {
    const { borrowShares } = await this.morpho.position(marketId, account);
    return borrowShares;
  }

  async isAuthorized(owner: string, manager: string) {
    return await this.morpho.isAuthorized(owner, manager);
  }

  buildAuthorizeTransactionRequest(manager: string, newIsAuthorized: boolean): common.TransactionRequest {
    const to = this.morpho.address;
    const data = this.morphoIface.encodeFunctionData('setAuthorization', [manager, newIsAuthorized]);

    return { to, data };
  }

  // SharesMathlib
  // https://github.com/morpho-org/morpho-blue/blob/084721252cca3c40b8c289837b9ed3a33e54b36c/src/libraries/SharesMathLib.sol
  /// @dev Calculates the value of `assets` quoted in shares, rounding down.
  toSharedDown(assets: BigNumber, totalAssets: BigNumber, totalShares: BigNumber) {
    return this.mulDivDown(assets, totalShares.add(this.VIRTUAL_SHARES), totalAssets.add(this.VIRTUAL_ASSETS));
  }

  /// @dev Calculates the value of `shares` quoted in assets, rounding down.
  toAssetsDown(shares: BigNumber, totalAssets: BigNumber, totalShares: BigNumber) {
    return this.mulDivDown(shares, totalAssets.add(this.VIRTUAL_ASSETS), totalShares.add(this.VIRTUAL_SHARES));
  }

  /// @dev Calculates the value of `shares` quoted in assets, rounding up.
  toAssetsUp(shares: BigNumber, totalAssets: BigNumber, totalShares: BigNumber) {
    return this.mulDivUp(shares, totalAssets.add(this.VIRTUAL_ASSETS), totalShares.add(this.VIRTUAL_SHARES));
  }

  // Mathlib
  // https://github.com/morpho-org/morpho-blue/blob/084721252cca3c40b8c289837b9ed3a33e54b36c/src/libraries/MathLib.sol
  mulDivDown(x: BigNumber, y: BigNumber, d: BigNumber) {
    return x.mul(y).div(d);
  }

  mulDivUp(x: BigNumber, y: BigNumber, d: BigNumber) {
    return x.mul(y).add(d.sub(1)).div(d);
  }
}
