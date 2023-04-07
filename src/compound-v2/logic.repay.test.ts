import { CErc20__factory, CEther__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import { RepayLogic, RepayLogicFields } from './logic.repay';
import * as common from '@furucombo/composable-router-common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { toCToken, underlyingTokens } from './tokens';

describe('CompoundV2 RepayLogic', function () {
  context('Test getTokenList', async function () {
    RepayLogic.supportedChainIds.forEach((chainId) => {
      it(`network: ${common.getNetworkId(chainId)}`, async function () {
        const logic = new RepayLogic(chainId);
        const tokenList = await logic.getTokenList();
        expect(tokenList).to.have.lengthOf.above(0);
      });
    });
  });

  context('Test build', function () {
    const chainId = common.ChainId.mainnet;
    const logic = new RepayLogic(chainId);
    const ifaceCEther = CEther__factory.createInterface();
    const ifaceCErc20 = CErc20__factory.createInterface();

    const testCases: LogicTestCase<RepayLogicFields>[] = [
      {
        fields: {
          borrower: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
          input: new common.TokenAmount(underlyingTokens.ETH, '1'),
        },
      },
      {
        fields: {
          borrower: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
          input: new common.TokenAmount(underlyingTokens.USDC, '1'),
        },
      },
      {
        fields: {
          borrower: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
          input: new common.TokenAmount(underlyingTokens.ETH, '1'),
          amountBps: 5000,
        },
      },
      {
        fields: {
          borrower: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
          input: new common.TokenAmount(underlyingTokens.USDC, '1'),
          amountBps: 5000,
        },
      },
    ];

    testCases.forEach(({ fields }) => {
      it(`repay ${fields.input.token.symbol}${fields.amountBps ? ' with amountBps' : ''}`, async function () {
        const routerLogic = await logic.build(fields);
        const sig = routerLogic.data.substring(0, 10);
        const { input, amountBps } = fields;

        expect(routerLogic.to).to.eq(toCToken(input.token).address);
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        if (input.token.isNative) {
          expect(sig).to.eq(ifaceCEther.getSighash('repayBorrowBehalf'));
          expect(routerLogic.inputs[0].token).to.eq(common.ELASTIC_ADDRESS);
        } else {
          expect(sig).to.eq(ifaceCErc20.getSighash('repayBorrowBehalf'));
        }
        if (amountBps) {
          expect(routerLogic.inputs[0].amountBps).to.eq(amountBps);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.token.isNative ? constants.MaxUint256 : 32);
        } else {
          expect(routerLogic.inputs[0].amountBps).to.eq(constants.MaxUint256);
          expect(routerLogic.inputs[0].amountOrOffset).to.eq(input.amountWei);
        }
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});
