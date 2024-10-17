import { CErc20Immutable__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { WithdrawLogic, WithdrawLogicFields } from './logic.withdraw';
import * as common from '@protocolink/common';
import { constants, utils } from 'ethers';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import { optimismTokens } from './tokens';
import { toCToken } from './configs';

describe.skip('Sonne WithdrawLogic', function () {
  context('Test getTokenList', async function () {
    WithdrawLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.toNetworkId(chainId)}`, async function () {
        const logic = new WithdrawLogic(chainId);
        const tokenList = await logic.getTokenList();
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test build', function () {
    const chainId = common.ChainId.optimism;
    const logic = new WithdrawLogic(chainId);
    const iface = CErc20Immutable__factory.createInterface();

    const testCases: LogicTestCase<WithdrawLogicFields>[] = [
      {
        fields: {
          input: new common.TokenAmount(toCToken(chainId, optimismTokens.WETH), '1'),
          output: new common.TokenAmount(optimismTokens.ETH, '0'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(toCToken(chainId, optimismTokens.USDC), '1'),
          output: new common.TokenAmount(optimismTokens.USDC, '0'),
        },
      },
      {
        fields: {
          input: new common.TokenAmount(toCToken(chainId, optimismTokens.WETH), '1'),
          output: new common.TokenAmount(optimismTokens.ETH, '0'),
          balanceBps: 5000,
        },
      },
      {
        fields: {
          input: new common.TokenAmount(toCToken(chainId, optimismTokens.USDC), '1'),
          output: new common.TokenAmount(optimismTokens.USDC, '0'),
          balanceBps: 5000,
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`${fields.output.token.symbol} to ${fields.output.token.symbol}${
        fields.balanceBps ? ' with balanceBps' : ''
      }`, async function () {
        const routerLogic = await logic.build(fields);
        const sig = routerLogic.data.substring(0, 10);
        const { input, balanceBps } = fields;

        expect(routerLogic.to).to.eq(input.token.address);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(iface.getSighash('redeem'));
        if (balanceBps) {
          expect(routerLogic.inputs[0].balanceBps).to.eq(balanceBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(0);
        } else {
          expect(routerLogic.inputs[0].balanceBps).to.eq(core.BPS_NOT_USED);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.amountWei);
        }
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});
