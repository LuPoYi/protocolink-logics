/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from 'ethers';
import type { Provider, TransactionRequest } from '@ethersproject/providers';
import type { PromiseOrValue } from '../common';
import type { FlashLoanCallbackAaveV2, FlashLoanCallbackAaveV2Interface } from '../FlashLoanCallbackAaveV2';

const _abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'router_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'aaveV2Provider_',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'asset',
        type: 'address',
      },
    ],
    name: 'InvalidBalance',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidCaller',
    type: 'error',
  },
  {
    inputs: [],
    name: 'aaveV2Provider',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'assets',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: 'premiums',
        type: 'uint256[]',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'params',
        type: 'bytes',
      },
    ],
    name: 'executeOperation',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'router',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const _bytecode =
  '0x60c060405234801561001057600080fd5b50604051610cf0380380610cf083398101604081905261002f91610062565b6001600160a01b039182166080521660a052610095565b80516001600160a01b038116811461005d57600080fd5b919050565b6000806040838503121561007557600080fd5b61007e83610046565b915061008c60208401610046565b90509250929050565b60805160a051610c246100cc60003960008181604b015260d901526000818160b20152818161020701526103450152610c246000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80637181a5c914610046578063920f5c841461008a578063f887ea40146100ad575b600080fd5b61006d7f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b0390911681526020015b60405180910390f35b61009d610098366004610986565b6100d4565b6040519015158152602001610081565b61006d7f000000000000000000000000000000000000000000000000000000000000000081565b6000807f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316630261bf8b6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610135573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101599190610a8b565b9050336001600160a01b03821614610184576040516348f5c3ed60e01b815260040160405180910390fd5b8960008167ffffffffffffffff8111156101a0576101a0610aaf565b6040519080825280602002602001820160405280156101c9578160200160208202803683370190505b50905060005b828110156102e65760008e8e838181106101eb576101eb610ac5565b90506020020160208101906102009190610adb565b90506102587f00000000000000000000000000000000000000000000000000000000000000008e8e8581811061023857610238610ac5565b90506020020135836001600160a01b03166104c69092919063ffffffff16565b6040516370a0823160e01b81523060048201526001600160a01b038216906370a0823190602401602060405180830381865afa15801561029c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102c09190610af8565b8383815181106102d2576102d2610ac5565b6020908102919091010152506001016101cf565b5061036c86868080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525050604080516060810190915260218082529092509050610bce60208301396001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016919061051d565b5060005b828110156104b25760008e8e8381811061038c5761038c610ac5565b90506020020160208101906103a19190610adb565b905060008b8b848181106103b7576103b7610ac5565b905060200201358e8e858181106103d0576103d0610ac5565b905060200201356103e19190610b11565b9050808484815181106103f6576103f6610ac5565b60200260200101516104089190610b11565b6040516370a0823160e01b81523060048201526001600160a01b038416906370a0823190602401602060405180830381865afa15801561044c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104709190610af8565b1461049d5760405162045c2160e21b81526001600160a01b03831660048201526024015b60405180910390fd5b6104a8828783610534565b5050600101610370565b5060019d9c50505050505050505050505050565b604080516001600160a01b038416602482015260448082018490528251808303909101815260649091019091526020810180516001600160e01b031663a9059cbb60e01b1790526105189084906106d7565b505050565b606061052c84846000856107a9565b949350505050565b604051636eb1769f60e11b81523060048201526001600160a01b03838116602483015282919085169063dd62ed3e90604401602060405180830381865afa158015610583573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105a79190610af8565b10156105185760405163095ea7b360e01b81526001600160a01b038381166004830152600019602483015284169063095ea7b390604401600060405180830381600087803b1580156105f857600080fd5b505af1925050508015610609575060015b6105185760405163095ea7b360e01b81526001600160a01b0383811660048301526000602483015284169063095ea7b390604401600060405180830381600087803b15801561065757600080fd5b505af115801561066b573d6000803e3d6000fd5b505060405163095ea7b360e01b81526001600160a01b03858116600483015260001960248301528616925063095ea7b39150604401600060405180830381600087803b1580156106ba57600080fd5b505af11580156106ce573d6000803e3d6000fd5b50505050505050565b600061072c826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b031661051d9092919063ffffffff16565b805190915015610518578080602001905181019061074a9190610b38565b6105185760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e6044820152691bdd081cdd58d8d9595960b21b6064820152608401610494565b60608247101561080a5760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f6044820152651c8818d85b1b60d21b6064820152608401610494565b600080866001600160a01b031685876040516108269190610b7e565b60006040518083038185875af1925050503d8060008114610863576040519150601f19603f3d011682016040523d82523d6000602084013e610868565b606091505b509150915061087987838387610884565b979650505050505050565b606083156108f35782516000036108ec576001600160a01b0385163b6108ec5760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606401610494565b508161052c565b61052c83838151156109085781518083602001fd5b8060405162461bcd60e51b81526004016104949190610b9a565b60008083601f84011261093457600080fd5b50813567ffffffffffffffff81111561094c57600080fd5b6020830191508360208260051b850101111561096757600080fd5b9250929050565b6001600160a01b038116811461098357600080fd5b50565b600080600080600080600080600060a08a8c0312156109a457600080fd5b893567ffffffffffffffff808211156109bc57600080fd5b6109c88d838e01610922565b909b50995060208c01359150808211156109e157600080fd5b6109ed8d838e01610922565b909950975060408c0135915080821115610a0657600080fd5b610a128d838e01610922565b909750955060608c01359150610a278261096e565b90935060808b01359080821115610a3d57600080fd5b818c0191508c601f830112610a5157600080fd5b813581811115610a6057600080fd5b8d6020828501011115610a7257600080fd5b6020830194508093505050509295985092959850929598565b600060208284031215610a9d57600080fd5b8151610aa88161096e565b9392505050565b634e487b7160e01b600052604160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b600060208284031215610aed57600080fd5b8135610aa88161096e565b600060208284031215610b0a57600080fd5b5051919050565b80820180821115610b3257634e487b7160e01b600052601160045260246000fd5b92915050565b600060208284031215610b4a57600080fd5b81518015158114610aa857600080fd5b60005b83811015610b75578181015183820152602001610b5d565b50506000910152565b60008251610b90818460208701610b5a565b9190910192915050565b6020815260008251806020840152610bb9816040850160208701610b5a565b601f01601f1916919091016040019291505056fe4552524f525f414156455f56325f464c4153485f4c4f414e5f43414c4c4241434ba26469706673582212209dce14d3411299b3234d0c7148cac7a1285c389bb1d1209a9bd021d56ae6164564736f6c63430008110033';

type FlashLoanCallbackAaveV2ConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: FlashLoanCallbackAaveV2ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class FlashLoanCallbackAaveV2__factory extends ContractFactory {
  constructor(...args: FlashLoanCallbackAaveV2ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    router_: PromiseOrValue<string>,
    aaveV2Provider_: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<FlashLoanCallbackAaveV2> {
    return super.deploy(router_, aaveV2Provider_, overrides || {}) as Promise<FlashLoanCallbackAaveV2>;
  }
  override getDeployTransaction(
    router_: PromiseOrValue<string>,
    aaveV2Provider_: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(router_, aaveV2Provider_, overrides || {});
  }
  override attach(address: string): FlashLoanCallbackAaveV2 {
    return super.attach(address) as FlashLoanCallbackAaveV2;
  }
  override connect(signer: Signer): FlashLoanCallbackAaveV2__factory {
    return super.connect(signer) as FlashLoanCallbackAaveV2__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FlashLoanCallbackAaveV2Interface {
    return new utils.Interface(_abi) as FlashLoanCallbackAaveV2Interface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): FlashLoanCallbackAaveV2 {
    return new Contract(address, _abi, signerOrProvider) as FlashLoanCallbackAaveV2;
  }
}