import { BigNumberish, constants } from 'ethers';
import { InterestRateMode } from './types';
import { LendingPool__factory } from './contracts';
import { Service } from './service';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getContractAddress, supportedChainIds } from './configs';
import invariant from 'tiny-invariant';

export type FlashLoanLogicTokenList = common.Token[];

export type FlashLoanLogicParams = core.TokensOutFields;

export type FlashLoanLogicQuotation = {
  loans: common.TokenAmounts;
  repays: common.TokenAmounts;
  fees: common.TokenAmounts;
  feeBps: number;
};

export type FlashLoanLogicFields = core.FlashLoanFields<{ referralCode?: number }>;

@core.LogicDefinitionDecorator()
export class FlashLoanLogic extends core.Logic implements core.LogicTokenListInterface, core.LogicBuilderInterface {
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const service = new Service(this.chainId, this.provider);
    const tokens: FlashLoanLogicTokenList = await service.getAssets();

    return tokens;
  }

  async quote(params: FlashLoanLogicParams) {
    const { outputs: loans } = params;

    const service = new Service(this.chainId, this.provider);
    const { feeBps, assetInfos } = await service.getFlashLoanConfiguration(loans.map((loan) => loan.token));

    const repays = new common.TokenAmounts();
    const fees = new common.TokenAmounts();
    for (let i = 0; i < loans.length; i++) {
      const loan = loans.at(i);
      const { isActive, avaliableToBorrow } = assetInfos[i];
      invariant(isActive, `asset is not active: ${loan.token.address}`);
      invariant(avaliableToBorrow.gte(loan), `insufficient borrowing capacity for the asset: ${loan.token.address}`);

      const feeAmountWei = common.calcFee(loan.amountWei, feeBps);
      const fee = new common.TokenAmount(loan.token).setWei(feeAmountWei);
      fees.add(fee);

      const repay = loan.clone().add(fee);
      repays.add(repay);
    }
    const quotation: FlashLoanLogicQuotation = { loans, repays, fees, feeBps };

    return quotation;
  }

  async build(fields: FlashLoanLogicFields) {
    const { outputs, params, referralCode = 0 } = fields;

    const service = new Service(this.chainId, this.provider);
    const to = await service.getLendingPoolAddress();

    const assets: string[] = [];
    const amounts: BigNumberish[] = [];
    const modes: number[] = [];
    outputs.forEach((output) => {
      assets.push(output.token.address);
      amounts.push(output.amountWei);
      modes.push(InterestRateMode.none);
    });
    const data = LendingPool__factory.createInterface().encodeFunctionData('flashLoan', [
      getContractAddress(this.chainId, 'AaveV2FlashLoanCallback'),
      assets,
      amounts,
      modes,
      constants.AddressZero,
      params,
      referralCode,
    ]);

    const callback = getContractAddress(this.chainId, 'AaveV2FlashLoanCallback');

    return core.newLogic({ to, data, callback });
  }
}
