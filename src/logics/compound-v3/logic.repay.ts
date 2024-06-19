import { Comet__factory } from './contracts';
import { Service } from './service';
import * as common from '@protocolink/common';
import { constants } from 'ethers';
import * as core from '@protocolink/core';
import { getMarket, getMarkets, supportedChainIds } from './configs';

export type RepayLogicTokenList = Record<string, common.Token[]>;

export type RepayLogicParams = core.RepayParams<{ marketId: string }>;

export type RepayLogicFields = core.RepayFields<{ marketId: string }>;

export class RepayLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicBuilderInterface {
  static id = 'repay';
  static protocolId = 'compound-v3';
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const tokenList: RepayLogicTokenList = {};

    const markets = getMarkets(this.chainId);
    const service = new Service(this.chainId, this.provider);
    for (const market of markets) {
      const baseToken = await service.getBaseToken(market.id);
      tokenList[market.id] = [];
      if (baseToken.isWrapped) {
        tokenList[market.id].push(baseToken.unwrapped);
      }
      tokenList[market.id].push(baseToken);
    }

    return tokenList;
  }

  async quote(params: RepayLogicParams) {
    const { marketId, borrower, tokenIn } = params;

    const service = new Service(this.chainId, this.provider);
    const borrowBalance = await service.getBorrowBalance(marketId, borrower, tokenIn);
    borrowBalance.setWei(common.calcSlippage(borrowBalance.amountWei, -1)); // slightly higher than borrowed amount

    return { marketId, borrower, input: borrowBalance };
  }

  async build(fields: RepayLogicFields) {
    const { marketId, borrower, input, balanceBps } = fields;

    // check if the repay amount is greater than or equal to the borrow balance.
    // If it is, it means that the user wants to repay the entire debt.
    const market = getMarket(this.chainId, marketId);
    const tokenIn = input.token.wrapped;
    const service = new Service(this.chainId, this.provider);
    const borrowBalance = await service.getBorrowBalance(marketId, borrower, tokenIn);
    const repayAll = input.gte(borrowBalance);

    const to = market.comet.address;
    const data = Comet__factory.createInterface().encodeFunctionData('supplyTo', [
      borrower,
      tokenIn.address,
      repayAll ? constants.MaxUint256 : input.amountWei,
    ]);

    const options: core.NewLogicInputOptions = { input: new common.TokenAmount(tokenIn, input.amount) };
    if (balanceBps && !repayAll) {
      options.balanceBps = balanceBps;
      options.amountOffset = common.getParamOffset(2);
    }
    const inputs = [core.newLogicInput(options)];

    const wrapMode = input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none;

    return core.newLogic({ to, data, inputs, wrapMode });
  }
}
