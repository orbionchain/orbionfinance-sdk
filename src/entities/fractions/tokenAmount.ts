import JSBI from 'jsbi'
import invariant from 'tiny-invariant'

import { CurrencyAmount } from './currencyAmount'
import { Token } from '../token'
import { BigintIsh } from '../../constants'

export class TokenAmount extends CurrencyAmount {
  public readonly token: Token

  /**
   * Constructs a TokenAmount. Amount must be raw (e.g. wei).
   */
  public constructor(token: Token, amount: BigintIsh) {
    super(token, amount)
    this.token = token
  }

  /**
   * Static factory for TokenAmount.
   * Equivalent to `new TokenAmount(...)` but more readable.
   */
  public static fromRawAmount(token: Token, rawAmount: BigintIsh): TokenAmount {
    return new TokenAmount(token, rawAmount)
  }

  public add(other: TokenAmount): TokenAmount {
    invariant(this.token.equals(other.token), 'TOKEN')
    return new TokenAmount(this.token, JSBI.add(this.raw, other.raw))
  }

  public subtract(other: TokenAmount): TokenAmount {
    invariant(this.token.equals(other.token), 'TOKEN')
    return new TokenAmount(this.token, JSBI.subtract(this.raw, other.raw))
  }
}
