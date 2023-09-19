import { Service } from '../service';
import * as common from '@protocolink/common';
import fs from 'fs-extra';
import { resolve } from 'path';

export default async () => {
  const chainIds = [common.ChainId.arbitrum];

  for (const chainId of chainIds) {
    const service = new Service(chainId);
    const reserveTokens = await service.getReserveTokens();

    const tokenMap = reserveTokens.reduce((accumulator, reserveToken) => {
      if (reserveToken.asset.isWrapped) {
        const unwrapped = reserveToken.asset.unwrapped;
        accumulator[unwrapped.symbol] = unwrapped;
      }
      accumulator[reserveToken.asset.symbol] = reserveToken.asset;
      accumulator[reserveToken.rToken.symbol] = reserveToken.rToken;
      return accumulator;
    }, {} as Record<string, common.Token>);

    const tokenDataPath = resolve(__dirname, '..', 'tokens', 'data', `${common.toNetworkId(chainId)}.json`);
    fs.outputJSONSync(tokenDataPath, tokenMap, { spaces: 2 });
  }
};
