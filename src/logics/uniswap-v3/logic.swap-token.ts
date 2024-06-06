import { TokenList } from '@uniswap/token-lists';
import { axios } from 'src/utils';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { getConfig, supportedChainIds } from './configs';
import { providers } from 'ethers';
import * as univ3 from 'src/modules/univ3';

export type SwapTokenLogicTokenList = common.Token[];

export type SwapTokenLogicParams = univ3.SwapTokenLogicParams;

export type SwapTokenLogicFields = univ3.SwapTokenLogicFields;

export type SwapTokenLogicOptions = univ3.SwapTokenLogicOptions;

export class SwapTokenLogic
  extends univ3.SwapTokenLogic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static id = 'swap-token';
  static protocolId = 'uniswap-v3';
  static readonly supportedChainIds = supportedChainIds;

  constructor(chainId: number, provider?: providers.Provider) {
    super({ chainId, provider, config: getConfig(chainId) });
  }

  async getTokenList() {
    const { data } = await axios.get<TokenList>('https://gateway.ipfs.io/ipns/tokens.uniswap.org');

    const tmp: Record<string, boolean> = { [this.nativeToken.address]: true };
    const tokenList: SwapTokenLogicTokenList = [this.nativeToken];
    for (const { chainId, address, decimals, symbol, name, logoURI } of data.tokens) {
      if (tmp[address] || chainId !== this.chainId) continue;
      tokenList.push(new common.Token(chainId, address, decimals, symbol, name, logoURI));
      tmp[address] = true;
    }

    return tokenList;
  }
}
