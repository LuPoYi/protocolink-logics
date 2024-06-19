import { Comet__factory } from './contracts';
import { Service } from './service';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getMarket, getMarkets, supportedChainIds } from './configs';

export type WithdrawCollateralLogicTokenList = Record<string, common.Token[]>;

export type WithdrawCollateralLogicFields = core.TokenOutFields<{ marketId: string }>;

export type WithdrawCollateralLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class WithdrawCollateralLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicBuilderInterface
{
  static id = 'withdraw-collateral';
  static protocolId = 'compound-v3';
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const tokenList: WithdrawCollateralLogicTokenList = {};

    const service = new Service(this.chainId, this.provider);
    const markets = getMarkets(this.chainId);
    for (const market of markets) {
      const collaterals = await service.getCollaterals(market.id);
      tokenList[market.id] = collaterals;
    }

    return tokenList;
  }

  async build(fields: WithdrawCollateralLogicFields, options: WithdrawCollateralLogicOptions) {
    const { marketId, output } = fields;
    const { account } = options;

    const market = getMarket(this.chainId, marketId);
    const tokenOut = output.token.wrapped;
    const agent = await this.calcAgent(account);

    const to = market.comet.address;
    const data = Comet__factory.createInterface().encodeFunctionData('withdrawFrom', [
      account,
      agent,
      tokenOut.address,
      output.amountWei,
    ]);
    const wrapMode = output.token.isNative ? core.WrapMode.unwrapAfter : core.WrapMode.none;

    return core.newLogic({ to, data, wrapMode });
  }
}
