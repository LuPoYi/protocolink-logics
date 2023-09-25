import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { claimToken, getChainId, mainnetTokens, snapshotAndRevertEach } from '@protocolink/test-helpers';
import * as common from '@protocolink/common';
import * as core from '@protocolink/core';
import { expect } from 'chai';
import hre from 'hardhat';
import * as utility from 'src/logics/utility';
import * as utils from 'test/utils';

describe('mainnet: Test Utility MultiSend Logic', function () {
  let chainId: number;
  let user: SignerWithAddress;
  const recipients: SignerWithAddress[] = [];

  before(async function () {
    chainId = await getChainId();
    [, user, recipients[0], recipients[1], recipients[2]] = await hre.ethers.getSigners();
    await claimToken(chainId, user.address, mainnetTokens.WETH, '100');
    await claimToken(chainId, user.address, mainnetTokens.USDC, '100');
    await claimToken(chainId, user.address, mainnetTokens.DAI, '100', '0x8A610c1C93da88c59F51A6264A4c70927814B320');
  });

  snapshotAndRevertEach();

  const testCases: { fields: { input: common.TokenAmount; recipientIndex: number; balanceBps?: number }[] }[] = [
    {
      fields: [
        {
          input: new common.TokenAmount(mainnetTokens.WETH, '1'),
          recipientIndex: 0,
        },
        {
          input: new common.TokenAmount(mainnetTokens.USDC, '1'),
          recipientIndex: 1,
        },
        {
          input: new common.TokenAmount(mainnetTokens.DAI, '1'),
          recipientIndex: 2,
        },
      ],
    },
    {
      fields: [
        {
          input: new common.TokenAmount(mainnetTokens.WETH, '1'),
          recipientIndex: 0,
          balanceBps: 5000,
        },
        {
          input: new common.TokenAmount(mainnetTokens.USDC, '1'),
          recipientIndex: 1,
          balanceBps: 5000,
        },
        {
          input: new common.TokenAmount(mainnetTokens.DAI, '1'),
          recipientIndex: 2,
          balanceBps: 5000,
        },
      ],
    },
  ];

  testCases.forEach(({ fields }, i) => {
    it(`case ${i + 1}`, async function () {
      // 1. build multiSendFields, funds, tokensReturn
      const multiSendFields: utility.MultiSendLogicFields = [];
      const tokensReturn = [];
      const funds = new common.TokenAmounts();
      for (const { input, recipientIndex, balanceBps } of fields) {
        const recipient = recipients[recipientIndex];

        multiSendFields.push({ input, recipient: recipient.address, balanceBps });

        if (balanceBps) {
          funds.add(utils.calcRequiredAmountByBalanceBps(input, balanceBps));
          tokensReturn.push(input.token.elasticAddress);
        } else {
          funds.add(input);
        }
      }

      // 2. build router logics
      const routerLogics: core.DataType.LogicStruct[] = [];
      const utilityMultiSendLogic = new utility.MultiSendLogic(chainId);
      routerLogics.push(...(await utilityMultiSendLogic.build(multiSendFields)));

      // 3. get router permit2 datas
      const permit2Datas = await utils.getRouterPermit2Datas(chainId, user, funds.erc20);

      // 4. send router tx
      const routerKit = new core.RouterKit(chainId);
      const transactionRequest = routerKit.buildExecuteTransactionRequest({
        permit2Datas,
        routerLogics,
        tokensReturn,
        value: funds.native?.amountWei ?? 0,
      });
      await expect(user.sendTransaction(transactionRequest)).to.not.be.reverted;
      for (const { input, recipientIndex } of fields) {
        await expect(user.address).to.changeBalance(input.token, -input.amount);
        await expect(recipients[recipientIndex].address).to.changeBalance(input.token, input.amount);
      }
    });
  });
});
