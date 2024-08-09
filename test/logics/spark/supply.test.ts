import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as spark from 'src/logics/spark';
import * as utils from 'test/utils';

describe('mainnet-pb: Test Spark Supply Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;

  before(async function () {
    chainId = await getChainId();
    [, user] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, common.mainnetTokens.USDC, '100');
    await claimToken(chainId, user.address, common.mainnetTokens.WETH, '100');
  });

  snapshotAndRevertEach();

  const testCases = [
    {
      input: new common.TokenAmount(spark.mainnetTokens.ETH, '1'),
      tokenOut: spark.mainnetTokens.spWETH,
    },
    {
      input: new common.TokenAmount(spark.mainnetTokens.WETH, '1'),
      tokenOut: spark.mainnetTokens.spWETH,
    },
    {
      input: new common.TokenAmount(spark.mainnetTokens.USDC, '1'),
      tokenOut: spark.mainnetTokens.spUSDC,
    },
    {
      input: new common.TokenAmount(spark.mainnetTokens.ETH, '1'),
      tokenOut: spark.mainnetTokens.spWETH,
      balanceBps: 5000,
    },
    {
      input: new common.TokenAmount(spark.mainnetTokens.WETH, '1'),
      tokenOut: spark.mainnetTokens.spWETH,
      balanceBps: 5000,
    },
    {
      input: new common.TokenAmount(spark.mainnetTokens.USDC, '1'),
      tokenOut: spark.mainnetTokens.spUSDC,
      balanceBps: 5000,
    },
  ];

  testCases.forEach(({ input, tokenOut, balanceBps }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. get output
      const aavev3SupplyLogic = new spark.SupplyLogic(chainId);
      const { output } = await aavev3SupplyLogic.quote({ input, tokenOut });

      // 2. build funds, tokensReturn
      const tokensReturn = [output.token.elasticAddress];
      const funds = new common.TokenAmounts();
      if (balanceBps) {
        funds.add(utils.calcRequiredAmountByBalanceBps(input, balanceBps));
        tokensReturn.push(input.token.elasticAddress);
      } else {
        funds.add(input);
      }

      // 3. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      routerLogics.push(await aavev3SupplyLogic.build({ input, output, balanceBps }, { account: user.address }));

      // 4. get router permit2 datas
      const permit2Datas = await utils.getRouterPermit2Datas(chainId, user, funds.erc20);

      // 5. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({
        permit2Datas,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      await expect(user.address).to.changeBalance(input.token, -input.amount);
      await expect(user.address).to.changeBalance(output.token, output.amount, 1);
    });
  });
});
