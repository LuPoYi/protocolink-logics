/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type { BaseContract, BigNumber, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from 'ethers';
import type { FunctionFragment, Result } from '@ethersproject/abi';
import type { Listener, Provider } from '@ethersproject/providers';
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from './common';

export interface PoolInterface extends utils.Interface {
  functions: {
    'slot0()': FunctionFragment;
    'liquidity()': FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: 'slot0' | 'liquidity'): FunctionFragment;

  encodeFunctionData(functionFragment: 'slot0', values?: undefined): string;
  encodeFunctionData(functionFragment: 'liquidity', values?: undefined): string;

  decodeFunctionResult(functionFragment: 'slot0', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'liquidity', data: BytesLike): Result;

  events: {};
}

export interface Pool extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: PoolInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    slot0(overrides?: CallOverrides): Promise<
      [BigNumber, number, number, number, number, number, boolean] & {
        sqrtPriceX96: BigNumber;
        tick: number;
        observationIndex: number;
        observationCardinality: number;
        observationCardinalityNext: number;
        feeProtocol: number;
        unlocked: boolean;
      }
    >;

    liquidity(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  slot0(overrides?: CallOverrides): Promise<
    [BigNumber, number, number, number, number, number, boolean] & {
      sqrtPriceX96: BigNumber;
      tick: number;
      observationIndex: number;
      observationCardinality: number;
      observationCardinalityNext: number;
      feeProtocol: number;
      unlocked: boolean;
    }
  >;

  liquidity(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    slot0(overrides?: CallOverrides): Promise<
      [BigNumber, number, number, number, number, number, boolean] & {
        sqrtPriceX96: BigNumber;
        tick: number;
        observationIndex: number;
        observationCardinality: number;
        observationCardinalityNext: number;
        feeProtocol: number;
        unlocked: boolean;
      }
    >;

    liquidity(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    slot0(overrides?: CallOverrides): Promise<BigNumber>;

    liquidity(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    slot0(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    liquidity(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
