import JSBI from 'jsbi'
import invariant from 'tiny-invariant'

import { Token } from '../token'
import { TokenAmount } from './tokenAmount'
import { currencyEquals } from '../token'
import { Currency } from '../currency'
import { Route } from '../route'
import { Fraction } from './fraction'
import { CurrencyAmount } from './currencyAmount'

import { BigintIsh, Rounding, TEN } from '../../constants'

export class Price extends Fraction {
  public readonly baseCurrency: Currency // input currency (denominator)
  public readonly quoteCurrency: Currency // output currency (numerator)
  public readonly scalar: Fraction // scaling factor for decimal adjustment

  /**
   * Construct price from a Route.
   */
  public static fromRoute(route: Route): Price {
    const prices: Price[] = []

    for (const [i, pair] of route.pairs.entries()) {
      const inputToken = route.path[i]
      const price = inputToken.equals(pair.token0)
        ? new Price(pair.reserve0.currency, pair.reserve1.currency, pair.reserve0.raw, pair.reserve1.raw)
        : new Price(pair.reserve1.currency, pair.reserve0.currency, pair.reserve1.raw, pair.reserve0.raw)

      prices.push(price)
    }

    return prices.slice(1).reduce((acc, curr) => acc.multiply(curr), prices[0])
  }

  /**
   * denominator and numerator must be raw amounts (e.g., token.raw)
   */
  public constructor(
    baseCurrency: Currency,
    quoteCurrency: Currency,
    denominator: BigintIsh,
    numerator: BigintIsh
  ) {
    super(numerator, denominator)
    this.baseCurrency = baseCurrency
    this.quoteCurrency = quoteCurrency

    this.scalar = new Fraction(
      JSBI.exponentiate(TEN, JSBI.BigInt(baseCurrency.decimals)),
      JSBI.exponentiate(TEN, JSBI.BigInt(quoteCurrency.decimals))
    )
  }

  public get raw(): Fraction {
    return new Fraction(this.numerator, this.denominator)
  }

  public get adjusted(): Fraction {
    return super.multiply(this.scalar)
  }

  public invert(): Price {
    return new Price(this.quoteCurrency, this.baseCurrency, this.numerator, this.denominator)
  }

  public multiply(other: Price): Price {
    invariant(currencyEquals(this.quoteCurrency, other.baseCurrency), 'TOKEN')
    const fraction = super.multiply(other)
    return new Price(this.baseCurrency, other.quoteCurrency, fraction.denominator, fraction.numerator)
  }

  public quote(currencyAmount: CurrencyAmount): CurrencyAmount {
    invariant(currencyEquals(currencyAmount.currency, this.baseCurrency), 'TOKEN')
    const quotedRaw = super.multiply(currencyAmount.raw).quotient
    return this.quoteCurrency instanceof Token
      ? new TokenAmount(this.quoteCurrency, quotedRaw)
      : CurrencyAmount.ether(quotedRaw)
  }

  public toSignificant(significantDigits: number = 6, format?: object, rounding?: Rounding): string {
    return this.adjusted.toSignificant(significantDigits, format, rounding)
  }

  public toFixed(decimalPlaces: number = 4, format?: object, rounding?: Rounding): string {
    return this.adjusted.toFixed(decimalPlaces, format, rounding)
  }
}
