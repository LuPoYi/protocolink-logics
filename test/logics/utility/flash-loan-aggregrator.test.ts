import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as aavev3 from 'src/logics/aave-v3';
import { claimToken, getChainId, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as utility from 'src/logics/utility';
import * as utils from 'test/utils';

describe('mainnet: Test Utility FlashLoanAggregator Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, aavev3.mainnetTokens['1INCH'], '2');
    await claimToken(chainId, user.address, mainnetTokens.WETH, '2');
    await claimToken(chainId, user.address, mainnetTokens.USDC, '2');
    await claimToken(chainId, user.address, mainnetTokens.USDT, '2');
    await claimToken(chainId, user.address, mainnetTokens.DAI, '2', '0x8A610c1C93da88c59F51A6264A4c70927814B320');
  });

  snapshotAndRevertEach();

  const testCases = [
    // balancer-v2
    { loans: new common.TokenAmounts([mainnetTokens.WETH, '1'], [mainnetTokens.USDC, '1']) },
    { repays: new common.TokenAmounts([mainnetTokens.WETH, '1'], [mainnetTokens.USDC, '1']) },
    { loans: new common.TokenAmounts([mainnetTokens.USDT, '1'], [mainnetTokens.DAI, '1']) },
    { repays: new common.TokenAmounts([mainnetTokens.USDT, '1'], [mainnetTokens.DAI, '1']) },
    // aave-v3
    { loans: new common.TokenAmounts([aavev3.mainnetTokens['1INCH'], '1'], [aavev3.mainnetTokens.USDC, '1']) },
    { repays: new common.TokenAmounts([aavev3.mainnetTokens['1INCH'], '1'], [aavev3.mainnetTokens.USDC, '1']) },
    { protocolId: 'aave-v3', loans: new common.TokenAmounts([mainnetTokens.WETH, '1'], [mainnetTokens.USDC, '1']) },
    { protocolId: 'aave-v3', repays: new common.TokenAmounts([mainnetTokens.WETH, '1'], [mainnetTokens.USDC, '1']) },
  ];

  testCases.forEach((params, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get flash loan quotation
      const utilityFlashLoanAggregatorLogic = new utility.FlashLoanAggregatorLogic(chainId);
      const { protocolId, loans, repays, callback } = await utilityFlashLoanAggregatorLogic.quote(params);
      if (params.protocolId) {
        expect(protocolId).to.be.eq(params.protocolId);
      }

      // 2. build funds and router logics for flash loan
      const funds = new common.TokenAmounts();
      const flashLoanRouterLogics: core.DataType.LogicStruct[] = [];
      const utilitySendTokenLogic = new utility.SendTokenLogic(chainId);
      for (let i = 0; i < repays.length; i++) {
        const loan = loans.at(i);
        const repay = repays.at(i);

        const fee = repay.clone().sub(loan);
        funds.add(fee);

        const callbackFee = await utilityFlashLoanAggregatorLogic.calcCallbackFee(protocolId, loan);
        funds.add(callbackFee);
        repay.add(callbackFee);

        flashLoanRouterLogics.push(
          await utilitySendTokenLogic.build({
            input: repay,
            recipient: callback,
          })
        );
      }

      // 3. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      const callbackParams = core.newCallbackParams(flashLoanRouterLogics);
      routerLogics.push(await utilityFlashLoanAggregatorLogic.build({ protocolId, loans, params: callbackParams }));

      // 4. get router permit2 datas
      const permit2Datas = await utils.getRouterPermit2Datas(chainId, user, funds.erc20);

      // 5. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({ permit2Datas, routerLogics });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
    });
  });
});
