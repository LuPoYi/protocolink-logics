import { BigNumberish, constants } from 'ethers';
import { InterestRateMode } from './types';
import { Pool__factory } from './contracts';
import { Service } from './service';
import * as common from '@furucombo/composable-router-common';
import * as core from '@furucombo/composable-router-core';
import { getContractAddress } from './config';

export type FlashLoanLogicFields = core.FlashLoanFields<{ referralCode?: number }>;

@core.LogicDefinitionDecorator()
export class FlashLoanLogic extends core.Logic implements core.LogicTokenListInterface {
  static readonly supportedChainIds = [
    common.ChainId.mainnet,
    common.ChainId.polygon,
    common.ChainId.arbitrum,
    common.ChainId.optimism,
    common.ChainId.avalanche,
  ];

  async getTokenList() {
    const service = new Service(this.chainId, this.provider);
    const tokens = await service.getAssets();

    return tokens;
  }

  async build(fields: FlashLoanLogicFields) {
    const { outputs, params, referralCode = 0 } = fields;

    const service = new Service(this.chainId, this.provider);
    const to = await service.getPoolAddress();

    const assets: string[] = [];
    const amounts: BigNumberish[] = [];
    const modes: number[] = [];
    outputs.forEach((output) => {
      assets.push(output.token.address);
      amounts.push(output.amountWei);
      modes.push(InterestRateMode.none);
    });
    const data = Pool__factory.createInterface().encodeFunctionData('flashLoan', [
      getContractAddress(this.chainId, 'FlashLoanCallbackAaveV3'),
      assets,
      amounts,
      modes,
      constants.AddressZero,
      params,
      referralCode,
    ]);

    const callback = getContractAddress(this.chainId, 'FlashLoanCallbackAaveV3');

    return core.newLogic({ to, data, callback });
  }
}
