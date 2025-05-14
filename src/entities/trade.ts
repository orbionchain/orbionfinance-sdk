import invariant from 'tiny-invariant'

import { ChainId, ONE, TradeType, ZERO } from '../constants'
import { sortedInsert } from '../utils'
import { Currency, ETHER } from './currency'
import { CurrencyAmount } from './fractions/currencyAmount'
import { Fraction } from './fractions/fraction'
import { Percent } from './fractions/percent'
import { Price } from './fractions/price'
import { TokenAmount } from './fractions/tokenAmount'
import { Pair } from './pair'
import { Route } from './route'
import { currencyEquals, Token, WETH } from './token'

function computePriceImpact(midPrice: Price, inputAmount: CurrencyAmount, outputAmount: CurrencyAmount): Percent {
  const exactQuote = midPrice.raw.multiply(inputAmount.raw)
  const slippage = exactQuote.subtract(outputAmount.raw).divide(exactQuote)
  return new Percent(slippage.numerator, slippage.denominator)
}

interface InputOutput {
  readonly inputAmount: CurrencyAmount
  readonly outputAmount: CurrencyAmount
}

export function inputOutputComparator(a: InputOutput, b: InputOutput): number {
  invariant(currencyEquals(a.inputAmount.currency, b.inputAmount.currency), 'INPUT_CURRENCY')
  invariant(currencyEquals(a.outputAmount.currency, b.outputAmount.currency), 'OUTPUT_CURRENCY')
  if (a.outputAmount.equalTo(b.outputAmount)) {
    if (a.inputAmount.equalTo(b.inputAmount)) {
      return 0
    }
    return a.inputAmount.lessThan(b.inputAmount) ? -1 : 1
  } else {
    return a.outputAmount.lessThan(b.outputAmount) ? 1 : -1
  }
}

export function tradeComparator(a: Trade, b: Trade) {
  const ioComp = inputOutputComparator(a, b)
  if (ioComp !== 0) return ioComp
  if (a.priceImpact.lessThan(b.priceImpact)) return -1
  if (a.priceImpact.greaterThan(b.priceImpact)) return 1
  return a.route.path.length - b.route.path.length
}

export interface BestTradeOptions {
  maxNumResults?: number
  maxHops?: number
}

function wrappedAmount(currencyAmount: CurrencyAmount, chainId: ChainId): TokenAmount {
  if (currencyAmount instanceof TokenAmount) return currencyAmount
  const weth = WETH[chainId]
  invariant(weth !== undefined, 'WETH_NOT_FOUND')
  if (currencyAmount.currency === ETHER) return new TokenAmount(weth, currencyAmount.raw)
  invariant(false, 'CURRENCY')
}

function wrappedCurrency(currency: Currency, chainId: ChainId): Token {
  if (currency instanceof Token) return currency
  const weth = WETH[chainId]
  invariant(weth !== undefined, 'WETH_NOT_FOUND')
  if (currency === ETHER) return weth
  invariant(false, 'CURRENCY')
}

export class Trade {
  public readonly route: Route
  public readonly tradeType: TradeType
  public readonly inputAmount: CurrencyAmount
  public readonly outputAmount: CurrencyAmount
  public readonly executionPrice: Price
  public readonly nextMidPrice: Price
  public readonly priceImpact: Percent

  public static exactIn(route: Route, amountIn: CurrencyAmount): Trade {
    return new Trade(route, amountIn, TradeType.EXACT_INPUT)
  }

  public static exactOut(route: Route, amountOut: CurrencyAmount): Trade {
    return new Trade(route, amountOut, TradeType.EXACT_OUTPUT)
  }

  public constructor(route: Route, amount: CurrencyAmount, tradeType: TradeType) {
    const amounts: TokenAmount[] = new Array(route.path.length)
    const nextPairs: Pair[] = new Array(route.pairs.length)
    if (tradeType === TradeType.EXACT_INPUT) {
      invariant(currencyEquals(amount.currency, route.input), 'INPUT')
      amounts[0] = wrappedAmount(amount, route.chainId)
      for (let i = 0; i < route.path.length - 1; i++) {
        const pair = route.pairs[i]
        const [outputAmount, nextPair] = pair.getOutputAmount(amounts[i])
        amounts[i + 1] = outputAmount
        nextPairs[i] = nextPair
      }
    } else {
      invariant(currencyEquals(amount.currency, route.output), 'OUTPUT')
      amounts[amounts.length - 1] = wrappedAmount(amount, route.chainId)
      for (let i = route.path.length - 1; i > 0; i--) {
        const pair = route.pairs[i - 1]
        const [inputAmount, nextPair] = pair.getInputAmount(amounts[i])
        amounts[i - 1] = inputAmount
        nextPairs[i - 1] = nextPair
      }
    }

    this.route = route
    this.tradeType = tradeType
    this.inputAmount =
      tradeType === TradeType.EXACT_INPUT
        ? amount
        : route.input === ETHER
        ? CurrencyAmount.ether(amounts[0].raw)
        : amounts[0]
    this.outputAmount =
      tradeType === TradeType.EXACT_OUTPUT
        ? amount
        : route.output === ETHER
        ? CurrencyAmount.ether(amounts[amounts.length - 1].raw)
        : amounts[amounts.length - 1]
    this.executionPrice = new Price(
      this.inputAmount.currency,
      this.outputAmount.currency,
      this.inputAmount.raw,
      this.outputAmount.raw
    )
    this.nextMidPrice = Price.fromRoute(new Route(nextPairs, route.input))
    this.priceImpact = computePriceImpact(route.midPrice, this.inputAmount, this.outputAmount)
  }

  public minimumAmountOut(slippageTolerance: Percent): CurrencyAmount {
    invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE')
    if (this.tradeType === TradeType.EXACT_OUTPUT) {
      return this.outputAmount
    } else {
      const slippageAdjustedAmountOut = new Fraction(ONE)
        .add(slippageTolerance)
        .invert()
        .multiply(this.outputAmount.raw).quotient
      return this.outputAmount instanceof TokenAmount
        ? new TokenAmount(this.outputAmount.token, slippageAdjustedAmountOut)
        : CurrencyAmount.ether(slippageAdjustedAmountOut)
    }
  }

  public maximumAmountIn(slippageTolerance: Percent): CurrencyAmount {
    invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE')
    if (this.tradeType === TradeType.EXACT_INPUT) {
      return this.inputAmount
    } else {
      const slippageAdjustedAmountIn = new Fraction(ONE).add(slippageTolerance).multiply(this.inputAmount.raw).quotient
      return this.inputAmount instanceof TokenAmount
        ? new TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
        : CurrencyAmount.ether(slippageAdjustedAmountIn)
    }
  }

  public static bestTradeExactIn(
    pairs: Pair[],
    currencyAmountIn: CurrencyAmount,
    currencyOut: Currency,
    { maxNumResults = 3, maxHops = 3 }: BestTradeOptions = {},
    currentPairs: Pair[] = [],
    originalAmountIn: CurrencyAmount = currencyAmountIn,
    bestTrades: Trade[] = []
  ): Trade[] {
    invariant(pairs.length > 0, 'PAIRS')
    invariant(maxHops > 0, 'MAX_HOPS')
    invariant(originalAmountIn === currencyAmountIn || currentPairs.length > 0, 'INVALID_RECURSION')

    const chainId: ChainId | undefined =
      currencyAmountIn instanceof TokenAmount
        ? currencyAmountIn.token.chainId
        : currencyOut instanceof Token
        ? currencyOut.chainId
        : undefined

    invariant(chainId !== undefined, 'CHAIN_ID')

    const amountIn = wrappedAmount(currencyAmountIn, chainId)
    const tokenOut = wrappedCurrency(currencyOut, chainId)

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i]
      if (!pair.token0.equals(amountIn.token) && !pair.token1.equals(amountIn.token)) continue
      if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) continue

      let amountOut: TokenAmount
      try {
        ;[amountOut] = pair.getOutputAmount(amountIn)
      } catch (error: unknown) {
        if (error instanceof Error && (error as any).isInsufficientInputAmountError) {
          continue
        }
        throw error
      }

      if (amountOut.token.equals(tokenOut)) {
        sortedInsert(
          bestTrades,
          new Trade(new Route([...currentPairs, pair], originalAmountIn.currency, currencyOut), originalAmountIn, TradeType.EXACT_INPUT),
          maxNumResults,
          tradeComparator
        )
      } else if (maxHops > 1 && pairs.length > 1) {
        const pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1))
        Trade.bestTradeExactIn(
          pairsExcludingThisPair,
          amountOut,
          currencyOut,
          { maxNumResults, maxHops: maxHops - 1 },
          [...currentPairs, pair],
          originalAmountIn,
          bestTrades
        )
      }
    }

    return bestTrades
  }

  public static bestTradeExactOut(
    pairs: Pair[],
    currencyIn: Currency,
    currencyAmountOut: CurrencyAmount,
    { maxNumResults = 3, maxHops = 3 }: BestTradeOptions = {},
    currentPairs: Pair[] = [],
    originalAmountOut: CurrencyAmount = currencyAmountOut,
    bestTrades: Trade[] = []
  ): Trade[] {
    invariant(pairs.length > 0, 'PAIRS')
    invariant(maxHops > 0, 'MAX_HOPS')
    invariant(originalAmountOut === currencyAmountOut || currentPairs.length > 0, 'INVALID_RECURSION')

    const chainId: ChainId | undefined =
      currencyAmountOut instanceof TokenAmount
        ? currencyAmountOut.token.chainId
        : currencyIn instanceof Token
        ? currencyIn.chainId
        : undefined

    invariant(chainId !== undefined, 'CHAIN_ID')

    const amountOut = wrappedAmount(currencyAmountOut, chainId)
    const tokenIn = wrappedCurrency(currencyIn, chainId)

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i]
      if (!pair.token0.equals(amountOut.token) && !pair.token1.equals(amountOut.token)) continue
      if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) continue

      let amountIn: TokenAmount
      try {
        ;[amountIn] = pair.getInputAmount(amountOut)
      } catch (error: unknown) {
        if (error instanceof Error && (error as any).isInsufficientReservesError) {
          continue
        }
        throw error
      }

      if (amountIn.token.equals(tokenIn)) {
        sortedInsert(
          bestTrades,
          new Trade(new Route([pair, ...currentPairs], currencyIn, originalAmountOut.currency), originalAmountOut, TradeType.EXACT_OUTPUT),
          maxNumResults,
          tradeComparator
        )
      } else if (maxHops > 1 && pairs.length > 1) {
        const pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1))
        Trade.bestTradeExactOut(
          pairsExcludingThisPair,
          currencyIn,
          amountIn,
          { maxNumResults, maxHops: maxHops - 1 },
          [pair, ...currentPairs],
          originalAmountOut,
          bestTrades
        )
      }
    }

    return bestTrades
  }
}
