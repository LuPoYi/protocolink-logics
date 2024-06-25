import { BuildSwapTxInput, SwapSide, constructSimpleSDK } from '@paraswap/sdk';
import { TokenList } from '@uniswap/token-lists';
import { axios } from 'src/utils';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { ethers } from 'ethers';
import { getTokenListUrls, getTokenTransferProxyAddress, supportedChainIds } from './configs';
import invariant from 'tiny-invariant';

export type SwapTokenLogicTokenList = common.Token[];

export type SwapTokenLogicParams = core.TokenToTokenParams<{ slippage?: number; excludeDEXS?: string[] }>;

export type SwapTokenLogicFields = core.TokenToTokenExactInFields<
  Pick<BuildSwapTxInput, 'partner' | 'partnerAddress' | 'takeSurplus'> & { slippage?: number; excludeDEXS?: string[] }
>;

export type SwapTokenLogicOptions = Pick<core.GlobalOptions, 'account'>;

export class SwapTokenLogic
  extends core.Logic
  implements core.LogicTokenListInterface, core.LogicOracleInterface, core.LogicBuilderInterface
{
  static id = 'swap-token';
  static protocolId = 'paraswap-v5';
  static readonly supportedChainIds = supportedChainIds;

  get sdk() {
    return constructSimpleSDK({ chainId: this.chainId, axios });
  }

  async getTokenList(): Promise<SwapTokenLogicTokenList> {
    const tokenListUrls = getTokenListUrls(this.chainId);
    const tokenLists: TokenList[] = [];
    await Promise.all(
      tokenListUrls.map(async (tokenListUrl) => {
        try {
          const resp = await axios.get(tokenListUrl);
          let data = resp.data;
          if ((resp.headers['content-type'] as string).includes('text/plain')) {
            data = JSON.parse(data);
          }
          tokenLists.push(data);
        } catch {}
      })
    );

    const tmp: Record<string, boolean> = { [this.nativeToken.address]: true };
    const tokenList: SwapTokenLogicTokenList = [this.nativeToken];
    for (const { tokens } of tokenLists) {
      for (const { chainId, address, decimals, symbol, name, logoURI } of tokens) {
        const lowerCaseAddress = address.toLowerCase();

        if (
          tmp[lowerCaseAddress] ||
          chainId !== this.chainId ||
          !name ||
          !symbol ||
          !decimals ||
          !ethers.utils.isAddress(address)
        )
          continue;
        tokenList.push(new common.Token(chainId, address, decimals, symbol, name, logoURI));
        tmp[lowerCaseAddress] = true;
      }
    }

    return tokenList;
  }

  // If you wish to exclude quotes from specific DEXs, you can include the corresponding DEX Names
  // in the 'excludeDEXS' parameter. You can retrieve DEX Names from the following API:
  // https://api.paraswap.io/adapters/list?network={chainId}&namesOnly=true
  async quote(params: SwapTokenLogicParams) {
    try {
      const { excludeDEXS } = params;

      let input: common.TokenAmount;
      let output: common.TokenAmount;
      if (core.isTokenToTokenExactInParams(params)) {
        let tokenOut: common.Token;
        ({ input, tokenOut } = params);

        const { destAmount } = await this.sdk.swap.getRate({
          srcToken: input.token.elasticAddress,
          srcDecimals: input.token.decimals,
          amount: input.amountWei.toString(),
          destToken: tokenOut.elasticAddress,
          destDecimals: tokenOut.decimals,
          side: SwapSide.SELL,
          options: { excludeDEXS },
        });
        output = new common.TokenAmount(tokenOut).setWei(destAmount);
      } else {
        let tokenIn: common.Token;
        ({ tokenIn, output } = params);

        const { srcAmount } = await this.sdk.swap.getRate({
          srcToken: tokenIn.elasticAddress,
          srcDecimals: tokenIn.decimals,
          amount: output.amountWei.toString(),
          destToken: output.token.elasticAddress,
          destDecimals: output.token.decimals,
          side: SwapSide.BUY,
          options: { excludeDEXS },
        });
        input = new common.TokenAmount(tokenIn).setWei(srcAmount);
      }

      return { input, output, slippage: params.slippage, excludeDEXS };
    } catch {
      invariant(false, 'no route found or price impact too high');
    }
  }

  async build(fields: SwapTokenLogicFields, options: SwapTokenLogicOptions) {
    const { input, output, partner, partnerAddress, takeSurplus, slippage, excludeDEXS } = fields;
    const { account } = options;

    const priceRoute = await this.sdk.swap.getRate({
      srcToken: input.token.elasticAddress,
      srcDecimals: input.token.decimals,
      amount: input.amountWei.toString(),
      destToken: output.token.elasticAddress,
      destDecimals: output.token.decimals,
      options: { excludeDEXS },
    });
    const { srcToken, srcDecimals, srcAmount, destToken, destDecimals, destAmount } = priceRoute;
    output.setWei(destAmount);

    const { to, data } = await this.sdk.swap.buildTx(
      {
        srcToken,
        srcDecimals,
        destToken,
        destDecimals,
        srcAmount,
        userAddress: account,
        partner,
        partnerAddress,
        slippage: slippage ?? 0,
        deadline: (Math.floor(Date.now() / 1000) + 1200).toString(),
        priceRoute,
        takeSurplus,
      },
      { ignoreChecks: true, ignoreGasEstimate: true }
    );
    const inputs = [core.newLogicInput({ input })];
    const approveTo = getTokenTransferProxyAddress(this.chainId);

    return core.newLogic({ to, data, inputs, approveTo });
  }
}
