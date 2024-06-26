import { CErc20Immutable__factory } from './contracts';
import * as common from '@protocolink/common';
import { constants } from 'ethers';
import * as core from '@protocolink/core';
import { supportedChainIds, toCToken, underlyingTokens } from './configs';

export type RepayLogicTokenList = common.Token[];

export type RepayLogicParams = core.RepayParams;

export type RepayLogicFields = core.RepayFields;

export class RepayLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static id = 'repay';
  static protocolId = 'sonne';
  static readonly supportedChainIds = supportedChainIds;

  getTokenList() {
    const tokens = underlyingTokens[this.chainId];

    const tokenList: RepayLogicTokenList = [];
    for (const token of tokens) {
      if (token.isWrapped) {
        tokenList.push(token.unwrapped);
      }
      tokenList.push(token);
    }
    return tokenList;
  }

  async quote(params: RepayLogicParams) {
    const { borrower, tokenIn } = params;

    const cToken = toCToken(this.chainId, tokenIn.wrapped);
    const borrowBalanceWei = await CErc20Immutable__factory.connect(
      cToken.address,
      this.provider
    ).callStatic.borrowBalanceCurrent(borrower);
    const amountWei = common.calcSlippage(borrowBalanceWei, -1); // slightly higher than the current borrowed amount
    const input = new common.TokenAmount(tokenIn).setWei(amountWei);
    return { borrower, input };
  }

  async build(fields: RepayLogicFields) {
    const { borrower, input, balanceBps } = fields;

    const tokenIn = input.token.wrapped;
    const cToken = toCToken(this.chainId, tokenIn);
    const borrowBalanceWei = await CErc20Immutable__factory.connect(
      cToken.address,
      this.provider
    ).callStatic.borrowBalanceCurrent(borrower);
    const repayAll = input.amountWei.gte(borrowBalanceWei);

    const to = cToken.address;
    const data = CErc20Immutable__factory.createInterface().encodeFunctionData('repayBorrowBehalf', [
      borrower,
      repayAll ? constants.MaxUint256 : input.amountWei,
    ]);

    const options: core.NewLogicInputOptions = { input: new common.TokenAmount(tokenIn, input.amount) };
    if (balanceBps && !repayAll) {
      options.balanceBps = balanceBps;
      options.amountOffset = common.getParamOffset(1);
    }

    const inputs = [core.newLogicInput(options)];
    const wrapMode = input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none;

    return core.newLogic({ to, data, inputs, wrapMode });
  }
}
