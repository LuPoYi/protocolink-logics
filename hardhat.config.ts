import '@nomicfoundation/hardhat-chai-matchers';
import '@protocolink/test-helpers';
import 'test/init';

import { HardhatUserConfig } from 'hardhat/config';
import { setup } from 'test/hooks';

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      chainId: process.env.CHAIN_ID ? parseInt(process.env.CHAIN_ID) : 1,
      gasPrice: 0,
      initialBaseFeePerGas: 0,
      accounts: {
        mnemonic: 'test test test test test test test test test test test logic',
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
      },
      forking: {
        url: process.env.HTTP_RPC_URL ?? 'https://eth.llamarpc.com',
      },
    },
  },
  mocha: {
    timeout: 1200000,
    retries: 3,
    rootHooks: { beforeAll: [setup] },
  },
};

export default config;
