import { COMP, getContractAddress, getMarket, supportedChainIds } from './configs';
import { CometRewards__factory } from './contracts';
import { Service } from './service';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';

export type ClaimLogicTokenList = [common.Token];

export type ClaimLogicParams = core.ClaimParams<{ marketId: string }>;

export type ClaimLogicFields = core.ClaimFields<{ marketId: string }>;

export type ClaimLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class ClaimLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static id = 'claim';
  static protocolId = 'compound-v3';
  static readonly supportedChainIds = supportedChainIds;

  async getTokenList() {
    const tokenList: ClaimLogicTokenList = [COMP(this.chainId)];
    return tokenList;
  }

  async quote(params: ClaimLogicParams) {
    const { marketId, owner } = params;

    const service = new Service(this.chainId, this.provider);
    const output = await service.getRewardOwed(marketId, owner);

    return { marketId, owner, output };
  }

  async build(fields: ClaimLogicFields, options: ClaimLogicOptions) {
    const { marketId, owner } = fields;
    const { account } = options;

    const market = getMarket(this.chainId, marketId);

    const to = getContractAddress(this.chainId, 'CometRewards');
    let data: string;
    if (owner === account) {
      const agent = await this.calcAgent(account);
      data = CometRewards__factory.createInterface().encodeFunctionData('claimTo', [
        market.comet.address,
        owner,
        agent,
        true,
      ]);
    } else {
      data = CometRewards__factory.createInterface().encodeFunctionData('claim', [market.comet.address, owner, true]);
    }

    return core.newLogic({ to, data });
  }
}
