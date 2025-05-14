import invariant from 'tiny-invariant'
import warning from 'tiny-warning'
import JSBI from 'jsbi'
import { getAddress } from '@ethersproject/address'

import {
  BigintIsh,
  ZERO,
  ONE,
  TWO,
  THREE,
  SolidityType,
  SOLIDITY_TYPE_MAXIMA,
  ChainId,
  FACTORY_ADDRESSES,
  INIT_CODE_HASHES,
  ROUTER_ADDRESSES,
  WRAPPED_NATIVE
} from './constants'

/**
 * Validates if a JSBI value fits within a specific Solidity type.
 */
export function validateSolidityTypeInstance(value: JSBI, solidityType: SolidityType): void {
  invariant(JSBI.greaterThanOrEqual(value, ZERO), `${value} is not a ${solidityType}.`)
  invariant(JSBI.lessThanOrEqual(value, SOLIDITY_TYPE_MAXIMA[solidityType]), `${value} is not a ${solidityType}.`)
}

/**
 * Parses and checksums an Ethereum address. Throws if invalid.
 */
export function validateAndParseAddress(address: string): string {
  try {
    const checksummedAddress = getAddress(address)
    warning(address === checksummedAddress, `${address} is not checksummed.`)
    return checksummedAddress
  } catch {
    invariant(false, `${address} is not a valid address.`)
  }
}

/**
 * Converts bigint-like inputs into JSBI.
 */
export function parseBigintIsh(bigintIsh: BigintIsh): JSBI {
  return bigintIsh instanceof JSBI
    ? bigintIsh
    : typeof bigintIsh === 'bigint'
    ? JSBI.BigInt(bigintIsh.toString())
    : JSBI.BigInt(bigintIsh)
}

/**
 * Integer square root (mimics EVM sqrt).
 */
export function sqrt(y: JSBI): JSBI {
  validateSolidityTypeInstance(y, SolidityType.uint256)
  let z: JSBI = ZERO
  let x: JSBI
  if (JSBI.greaterThan(y, THREE)) {
    z = y
    x = JSBI.add(JSBI.divide(y, TWO), ONE)
    while (JSBI.lessThan(x, z)) {
      z = x
      x = JSBI.divide(JSBI.add(JSBI.divide(y, x), x), TWO)
    }
  } else if (JSBI.notEqual(y, ZERO)) {
    z = ONE
  }
  return z
}

/**
 * Sorted insert into array with max length.
 */
export function sortedInsert<T>(items: T[], add: T, maxSize: number, comparator: (a: T, b: T) => number): T | null {
  invariant(maxSize > 0, 'MAX_SIZE_ZERO')
  invariant(items.length <= maxSize, 'ITEMS_SIZE')

  if (items.length === 0) {
    items.push(add)
    return null
  }

  const isFull = items.length === maxSize
  if (isFull && comparator(items[items.length - 1], add) <= 0) {
    return add
  }

  let lo = 0,
    hi = items.length

  while (lo < hi) {
    const mid = (lo + hi) >>> 1
    if (comparator(items[mid], add) <= 0) {
      lo = mid + 1
    } else {
      hi = mid
    }
  }
  items.splice(lo, 0, add)
  return isFull ? items.pop()! : null
}

/**
 * Multichain: get config by chainId
 */
export function getChainConfig(chainId: ChainId) {
  return {
    factory: FACTORY_ADDRESSES[chainId],
    router: ROUTER_ADDRESSES[chainId],
    initCodeHash: INIT_CODE_HASHES[chainId],
    wrappedNative: WRAPPED_NATIVE[chainId]
  }
}
