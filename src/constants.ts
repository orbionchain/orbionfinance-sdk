import JSBI from 'jsbi'

// Bigint input types
export type BigintIsh = JSBI | bigint | string

// Supported chain IDs
export enum ChainId {
  MAINNET = 106601,       // Alias for Orbion Mainnet
  ORBIONTESTNET = 109901, // Alias for Orbion Testnet
  ETHEREUM = 1,
  BSC_MAINNET = 56,       // Optional alias for BSC mainnet
  BSC = 56,
  BSCTESTNET = 97,
  SEPOLIA = 11155111
}

// Trade directions
export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT
}

// Rounding options
export enum Rounding {
  ROUND_DOWN,
  ROUND_HALF_UP,
  ROUND_UP
}

// Init code hash per chain
export const INIT_CODE_HASHES: Record<ChainId, string> = {
  [ChainId.BSCTESTNET]: '0xbf90f78951f8fd91390a1bcc642674d457d217fecec1aae078a09309cf3af6e1',
  [ChainId.SEPOLIA]: '0x09faf0db2abc7be63b2dda8a616404b1d7ddcbd4808dbc637ba037f57c88a696',
  [ChainId.BSC]: '0x0d9dc583e4e7ff700fe6e06c8dc012fd0e26c11ac8f2e4f556c6b3d407ecb1c6',
  [ChainId.ETHEREUM]: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
  [ChainId.MAINNET]: '0x0000000000000000000000000000000000000000000000000000000000000000',
  [ChainId.ORBIONTESTNET]: '0x0000000000000000000000000000000000000000000000000000000000000000'
}

// Factory addresses
export const FACTORY_ADDRESSES: Record<ChainId, string> = {
  [ChainId.BSCTESTNET]: '0x897630E3EFCC6B5043B666430c0a68776E11c198',
  [ChainId.SEPOLIA]: '0x897630E3EFCC6B5043B666430c0a68776E11c198',
  [ChainId.BSC]: '0xca143ce32fe78f1f7019d7d551a6402fc5350c73',
  [ChainId.ETHEREUM]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  [ChainId.MAINNET]: '0x0000000000000000000000000000000000000000',
  [ChainId.ORBIONTESTNET]: '0x0000000000000000000000000000000000000000'
}

// Router addresses
export const ROUTER_ADDRESSES: Record<ChainId, string> = {
  [ChainId.BSCTESTNET]: '0x7A8ba8b98eE2B67d157637C9Bce8535b7CA87761',
  [ChainId.SEPOLIA]: '0x7A8ba8b98eE2B67d157637C9Bce8535b7CA87761',
  [ChainId.BSC]: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
  [ChainId.ETHEREUM]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  [ChainId.MAINNET]: '0x0000000000000000000000000000000000000000',
  [ChainId.ORBIONTESTNET]: '0x0000000000000000000000000000000000000000'
}

// Wrapped native tokens
export const WRAPPED_NATIVE: Record<ChainId, string> = {
  [ChainId.BSCTESTNET]: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
  [ChainId.SEPOLIA]: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
  [ChainId.BSC]: '0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  [ChainId.ETHEREUM]: '0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2',
  [ChainId.MAINNET]: '0x0000000000000000000000000000000000000000',
  [ChainId.ORBIONTESTNET]: '0x0000000000000000000000000000000000000000'
}

// Minimum liquidity for pair creation
export const MINIMUM_LIQUIDITY = JSBI.BigInt(1000)

// Constants for math
export const ZERO = JSBI.BigInt(0)
export const ONE = JSBI.BigInt(1)
export const TWO = JSBI.BigInt(2)
export const THREE = JSBI.BigInt(3)
export const FIVE = JSBI.BigInt(5)
export const TEN = JSBI.BigInt(10)
export const _100 = JSBI.BigInt(100)
export const _997 = JSBI.BigInt(997)
export const _1000 = JSBI.BigInt(1000)

// Solidity integer types
export enum SolidityType {
  uint8 = 'uint8',
  uint256 = 'uint256'
}

// Maximum values for each Solidity type
export const SOLIDITY_TYPE_MAXIMA = {
  [SolidityType.uint8]: JSBI.BigInt('0xff'),
  [SolidityType.uint256]: JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
}
