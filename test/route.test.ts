import { Token, WETH, ChainId, Pair, TokenAmount, Route, ETHER } from '../src'

describe('Route', () => {
  const token0 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000001', 18, 't0')
  const token1 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000002', 18, 't1')
  const weth = WETH[ChainId.MAINNET]

  const pair_0_1 = new Pair(new TokenAmount(token0, '100'), new TokenAmount(token1, '200'))
  const pair_0_weth = new Pair(new TokenAmount(token0, '100'), new TokenAmount(weth, '100'))
  const pair_1_weth = new Pair(new TokenAmount(token1, '175'), new TokenAmount(weth, '100'))

  it('constructs a direct route from two tokens', () => {
    const route = new Route([pair_0_1], token0)
    expect(route.pairs).toEqual([pair_0_1])
    expect(route.path).toEqual([token0, token1])
    expect(route.input).toEqual(token0)
    expect(route.output).toEqual(token1)
    expect(route.chainId).toEqual(ChainId.MAINNET)
  })

  it('constructs a circular route returning to input token', () => {
    const route = new Route([pair_0_weth, pair_0_1, pair_1_weth], weth)
    expect(route.input).toEqual(weth)
    expect(route.output).toEqual(weth)
    expect(route.path[0]).toEqual(weth)
    expect(route.path[route.path.length - 1]).toEqual(weth)
    expect(route.pairs).toHaveLength(3)
  })

  it('supports ether as input', () => {
    const route = new Route([pair_0_weth], ETHER)
    expect(route.input).toEqual(ETHER)
    expect(route.output).toEqual(token0)
    expect(route.path).toEqual([weth, token0])
  })

  it('supports ether as output', () => {
    const route = new Route([pair_0_weth], token0, ETHER)
    expect(route.input).toEqual(token0)
    expect(route.output).toEqual(ETHER)
    expect(route.path).toEqual([token0, weth])
  })

  it('throws if pairs have different chainId', () => {
    const tokenBSC = new Token(ChainId.BSCTESTNET, token0.address, 18)
    const invalidPair = new Pair(new TokenAmount(tokenBSC, '100'), new TokenAmount(token1, '100'))
    expect(() => new Route([invalidPair], tokenBSC)).toThrow('CHAIN_IDS')
  })

  it('throws if input not involved in first pair', () => {
    const unrelated = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000009', 18)
    expect(() => new Route([pair_0_1], unrelated)).toThrow('INPUT')
  })

  it('throws if output not involved in last pair', () => {
    const unrelated = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000009', 18)
    expect(() => new Route([pair_0_1], token0, unrelated)).toThrow('OUTPUT')
  })
})
