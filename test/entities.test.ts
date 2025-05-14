import invariant from 'tiny-invariant'
import {
  ChainId,
  WETH as _WETH,
  TradeType,
  Rounding,
  Token,
  TokenAmount,
  Pair,
  Route,
  Trade,
  Percent
} from '../src'

const ADDRESSES = [
  '0x0000000000000000000000000000000000000001',
  '0x0000000000000000000000000000000000000002',
  '0x0000000000000000000000000000000000000003'
]
const CHAIN_ID = ChainId.BSCTESTNET
const WETH = _WETH[CHAIN_ID]
const DECIMAL_PERMUTATIONS: [number, number, number][] = [
  [0, 0, 0],
  [0, 9, 18],
  [18, 18, 18]
]

function decimalize(amount: number, decimals: number): bigint {
  return BigInt(amount) * BigInt(10) ** BigInt(decimals)
}

describe('entities', () => {
  DECIMAL_PERMUTATIONS.forEach(decimals => {
    describe(`decimals permutation: ${decimals}`, () => {
      let tokens: Token[]

      it('Token', () => {
        tokens = ADDRESSES.map((address, i) => new Token(CHAIN_ID, address, decimals[i]))
        tokens.forEach((token, i) => {
          expect(token.chainId).toEqual(CHAIN_ID)
          expect(token.address).toEqual(ADDRESSES[i])
          expect(token.decimals).toEqual(decimals[i])
        })
      })

      let pairs: Pair[]
      it('Pair', () => {
        pairs = [
          new Pair(
            new TokenAmount(tokens[0], decimalize(1, tokens[0].decimals)),
            new TokenAmount(tokens[1], decimalize(1, tokens[1].decimals))
          ),
          new Pair(
            new TokenAmount(tokens[1], decimalize(1, tokens[1].decimals)),
            new TokenAmount(tokens[2], decimalize(1, tokens[2].decimals))
          ),
          new Pair(
            new TokenAmount(tokens[2], decimalize(1, tokens[2].decimals)),
            new TokenAmount(WETH, decimalize(1234, WETH.decimals))
          )
        ]
      })

      let route: Route
      it('Route', () => {
        route = new Route(pairs, tokens[0])
        expect(route.pairs).toEqual(pairs)
        expect(route.path).toEqual(tokens.concat([WETH]))
        expect(route.input).toEqual(tokens[0])
        expect(route.output).toEqual(WETH)
      })

      it('Price: Route.midPrice', () => {
        invariant(route.input instanceof Token)
        invariant(route.output instanceof Token)
        expect(route.midPrice.quote(new TokenAmount(route.input, decimalize(1, route.input.decimals)))).toEqual(
          new TokenAmount(route.output, decimalize(1234, route.output.decimals))
        )
        expect(
          route.midPrice.invert().quote(new TokenAmount(route.output, decimalize(1234, route.output.decimals)))
        ).toEqual(new TokenAmount(route.input, decimalize(1, route.input.decimals)))

        expect(route.midPrice.toSignificant(4)).toEqual('1234')
        expect(route.midPrice.toFixed(2)).toEqual('1234.00')
        expect(route.midPrice.invert().toFixed(7, undefined, Rounding.ROUND_DOWN)).toEqual('0.0008103')
      })

      describe('Trade', () => {
        let route: Route
        it('TradeType.EXACT_INPUT', () => {
          route = new Route(
            [
              new Pair(
                new TokenAmount(tokens[1], decimalize(5, tokens[1].decimals)),
                new TokenAmount(WETH, decimalize(10, WETH.decimals))
              )
            ],
            tokens[1]
          )
          const inputAmount = new TokenAmount(tokens[1], decimalize(1, tokens[1].decimals))
          const expectedOutputAmount = new TokenAmount(WETH, '1662497915624478906')
          const trade = new Trade(route, inputAmount, TradeType.EXACT_INPUT)

          expect(trade.inputAmount).toEqual(inputAmount)
          expect(trade.outputAmount).toEqual(expectedOutputAmount)

          // Slippage checks
          const slippage = new Percent('50', '10000') // 0.5%
          expect(trade.minimumAmountOut(slippage).raw.toString()).toMatch(/^\d+$/)
          expect(trade.maximumAmountIn(slippage).raw.toString()).toMatch(/^\d+$/)
        })

        it('TradeType.EXACT_OUTPUT', () => {
          const outputAmount = new TokenAmount(WETH, '1662497915624478906')
          const expectedInputAmount = new TokenAmount(tokens[1], decimalize(1, tokens[1].decimals))
          const trade = new Trade(route, outputAmount, TradeType.EXACT_OUTPUT)

          expect(trade.inputAmount).toEqual(expectedInputAmount)
          expect(trade.outputAmount).toEqual(outputAmount)
        })

        it('Minimum slippage logic', () => {
          if ([9, 18].includes(tokens[1].decimals)) {
            const adjustment = tokens[1].decimals === 9 ? BigInt('30090280812437312') : BigInt('30090270812437322')
            const pair = new Pair(
              new TokenAmount(tokens[1], decimalize(1, tokens[1].decimals)),
              new TokenAmount(WETH, decimalize(10, WETH.decimals) + adjustment)
            )
            const route = new Route([pair], tokens[1])
            const outputAmount = new TokenAmount(tokens[1], '1')
            const trade = new Trade(route, outputAmount, TradeType.EXACT_INPUT)
            const expectedImpact =
              tokens[1].decimals === 9 ? '0.300000099400899902' : '0.3000000000000001'
            expect(trade.priceImpact.toSignificant(18)).toEqual(expectedImpact)
          }
        })
      })

      it('TokenAmount formatting', () => {
        const amount = new TokenAmount(WETH, '1234567000000000000000')
        expect(amount.toExact()).toEqual('1234.567')
        expect(amount.toExact({ groupSeparator: ',' })).toEqual('1,234.567')
      })
    })
  })
})
