import { Comet__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { MarketId, getMarket } from './configs';
import { RepayLogic, RepayLogicFields } from './logic.repay';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { mainnetTokens } from './tokens';

describe('CompoundV3 RepayLogic', function () {
  context('Test getTokenList', async function () {
    RepayLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const logic = new RepayLogic(chainId);
        const tokenList = await logic.getTokenList();
        const marketIds = Object.keys(tokenList);
        expect(marketIds).to.have.lengthOf.above(0);
        for (const marketId of marketIds) {
          expect(tokenList[marketId]).to.have.lengthOf.above(0);
        }
      });
    });
  });

  context('Test build', function () {
    const chainId = common.ChainId.mainnet;
    const logic = new RepayLogic(chainId);
    const iface = Comet__factory.createInterface();

    const testCases: LogicTestCase<RepayLogicFields>[] = [
      {
        fields: {
          marketId: MarketId.USDC,
          borrower: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
          input: new common.TokenAmount(mainnetTokens.USDC, '1'),
        },
      },
      {
        fields: {
          marketId: MarketId.ETH,
          borrower: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
          input: new common.TokenAmount(mainnetTokens.ETH, '1'),
        },
      },
      {
        fields: {
          marketId: MarketId.ETH,
          borrower: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
          input: new common.TokenAmount(mainnetTokens.WETH, '1'),
        },
      },
      {
        fields: {
          marketId: MarketId.USDC,
          borrower: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
          input: new common.TokenAmount(mainnetTokens.USDC, '1'),
          balanceBps: 10000,
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`repay ${fields.input.token.symbol} to ${fields.marketId} market `, async function () {
        const routerLogic = await logic.build(fields);
        const sig = routerLogic.data.substring(0, 10);
        const { marketId, input, balanceBps } = fields;
        const market = getMarket(chainId, marketId);

        expect(routerLogic.to).to.eq(market.comet.address);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(iface.getSighash('supplyTo'));
        expect(routerLogic.inputs[0].token).to.eq(input.token.wrapped.address);
        if (balanceBps && balanceBps !== common.BPS_BASE) {
          expect(routerLogic.inputs[0].balanceBps).to.eq(balanceBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(common.getParamOffset(2));
        } else {
          expect(routerLogic.inputs[0].balanceBps).to.eq(core.BPS_NOT_USED);
          expect(routerLogic.inputs[0].amountOrOffset).eq(input.amountWei);
        }
        expect(routerLogic.wrapMode).to.eq(input.token.isNative ? core.WrapMode.wrapBefore : core.WrapMode.none);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});
