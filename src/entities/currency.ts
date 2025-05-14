import JSBI from 'jsbi'
import { SolidityType } from '../constants'
import { validateSolidityTypeInstance } from '../utils'

/**
 * A currency is any fungible financial instrument, including Ether and all ERC20 tokens.
 * The only instance of the base class `Currency` is ETHER (e.g., ETH or native chain token).
 */
export class Currency {
  public readonly decimals: number
  public readonly symbol?: string
  public readonly name?: string

  /**
   * Represents the native currency of the chain (ETH, BNB, etc.)
   */
  public static readonly ETHER: Currency = new Currency(18, 'ETH', 'Ether')

  protected constructor(decimals: number, symbol?: string, name?: string) {
    validateSolidityTypeInstance(JSBI.BigInt(decimals), SolidityType.uint8)
    this.decimals = decimals
    this.symbol = symbol
    this.name = name
  }
}

// Default export for convenience
const ETHER = Currency.ETHER
export { ETHER }
