import { ClaimCOMPLogic, ClaimCOMPLogicFields } from './logic.claim-comp';
import { Comptroller__factory } from './contracts';
import { LogicTestCase } from 'test/types';
import * as common from '@composable-router/common';
import { constants, utils } from 'ethers';
import { expect } from 'chai';
import { getContractAddress } from './config';

describe('CompoundV2 ClaimCOMPLogic', function () {
  const chainId = common.ChainId.mainnet;
  const compoundV2ClaimCOMPLogic = new ClaimCOMPLogic(chainId);

  context('Test getLogic', function () {
    const comptroller = Comptroller__factory.createInterface();

    const testCases: LogicTestCase<ClaimCOMPLogicFields>[] = [
      { fields: { owner: '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa' } },
    ];

    testCases.forEach(({ fields }, i) => {
      it(`case ${i + 1}`, async function () {
        const routerLogic = await compoundV2ClaimCOMPLogic.getLogic(fields);
        const sig = routerLogic.data.substring(0, 10);

        expect(routerLogic.to).to.eq(getContractAddress('Comptroller'));
        expect(utils.isBytesLike(routerLogic.data)).to.be.true;
        expect(sig).to.eq(comptroller.getSighash('claimComp(address)'));
        expect(routerLogic.inputs).to.deep.eq([]);
        expect(routerLogic.outputs).to.deep.eq([]);
        expect(routerLogic.approveTo).to.eq(constants.AddressZero);
        expect(routerLogic.callback).to.eq(constants.AddressZero);
      });
    });
  });
});