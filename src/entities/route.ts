import { ChainId } from '../constants'
import invariant from 'tiny-invariant'

import { Currency, ETHER } from './currency'
import { Token, WETH } from './token'
import { Pair } from './pair'
import { Price } from './fractions/price'

export class Route {
  public readonly pairs: Pair[]
  public readonly path: Token[]
  public readonly input: Currency
  public readonly output: Currency
  public readonly midPrice: Price

  public constructor(pairs: Pair[], input: Currency, output?: Currency) {
    invariant(pairs.length > 0, 'PAIRS')

    const chainId = pairs[0].chainId
    invariant(pairs.every(pair => pair.chainId === chainId), 'CHAIN_IDS')

    const inputToken = input instanceof Token ? input : WETH[chainId]
    invariant(pairs[0].involvesToken(inputToken), 'INPUT')

    const outputToken = output instanceof Token
      ? output
      : output === ETHER
        ? WETH[chainId]
        : undefined
    if (output !== undefined) {
      invariant(pairs[pairs.length - 1].involvesToken(outputToken!), 'OUTPUT')
    }

    const path: Token[] = [inputToken]
    for (const [i, pair] of pairs.entries()) {
      const currentInput = path[i]
      invariant(currentInput.equals(pair.token0) || currentInput.equals(pair.token1), 'PATH')
      const nextToken = currentInput.equals(pair.token0) ? pair.token1 : pair.token0
      path.push(nextToken)
    }

    this.pairs = pairs
    this.path = path
    this.input = input
    this.output = output ?? path[path.length - 1]
    this.midPrice = Price.fromRoute(this)
  }

  public get chainId(): ChainId {
    return this.pairs[0].chainId
  }
}
