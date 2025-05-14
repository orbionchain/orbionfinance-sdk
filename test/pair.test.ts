import { ChainId, Token, Pair, TokenAmount, WETH, Price } from '../src'

describe('Pair', () => {
  const USDC = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 18, 'USDC', 'USD Coin')
  const DAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'DAI Stablecoin')

  describe('constructor', () => {
    it('throws if tokens are on different chains', () => {
      expect(() =>
        new Pair(new TokenAmount(USDC, '100'), new TokenAmount(WETH[ChainId.BSCTESTNET], '100'))
      ).toThrow('CHAIN_IDS')
    })
  })

  describe('#getAddress', () => {
    it('returns correct deterministic address', () => {
      expect(Pair.getAddress(USDC, DAI)).toEqual('0x80193B5E9E2D96880f5fA1Fc9B45d3f1FA97c112')
    })
  })

  describe('#token0 & #token1', () => {
    it('token0 is the one that sorts before', () => {
      const pair = new Pair(new TokenAmount(USDC, '100'), new TokenAmount(DAI, '100'))
      expect(pair.token0).toEqual(DAI)
      expect(pair.token1).toEqual(USDC)
    })
  })

  describe('#reserve0 & #reserve1', () => {
    it('reserves follow token sort order', () => {
      const pair = new Pair(new TokenAmount(USDC, '100'), new TokenAmount(DAI, '101'))
      expect(pair.reserve0).toEqual(new TokenAmount(DAI, '101'))
      expect(pair.reserve1).toEqual(new TokenAmount(USDC, '100'))
    })
  })

  describe('#token0Price & #token1Price', () => {
    it('returns correct price values', () => {
      const pair = new Pair(new TokenAmount(DAI, '100'), new TokenAmount(USDC, '101'))
      expect(pair.token0Price).toEqual(new Price(DAI, USDC, '100', '101'))
      expect(pair.token1Price).toEqual(new Price(USDC, DAI, '101', '100'))
    })
  })

  describe('#priceOf', () => {
    const pair = new Pair(new TokenAmount(DAI, '100'), new TokenAmount(USDC, '101'))
    it('returns the price of a token in terms of the other', () => {
      expect(pair.priceOf(DAI)).toEqual(pair.token0Price)
      expect(pair.priceOf(USDC)).toEqual(pair.token1Price)
    })

    it('throws if token not in pair', () => {
      expect(() => pair.priceOf(WETH[ChainId.MAINNET])).toThrow('TOKEN')
    })
  })

  describe('#reserveOf', () => {
    const pair = new Pair(new TokenAmount(DAI, '101'), new TokenAmount(USDC, '100'))
    it('returns correct reserve for valid token', () => {
      expect(pair.reserveOf(USDC)).toEqual(new TokenAmount(USDC, '100'))
      expect(pair.reserveOf(DAI)).toEqual(new TokenAmount(DAI, '101'))
    })

    it('throws if token not in pair', () => {
      expect(() => pair.reserveOf(WETH[ChainId.MAINNET])).toThrow('TOKEN')
    })
  })

  describe('#chainId', () => {
    it('returns the chainId from tokens', () => {
      expect(new Pair(new TokenAmount(DAI, '100'), new TokenAmount(USDC, '100')).chainId).toEqual(ChainId.MAINNET)
    })
  })

  describe('#involvesToken', () => {
    const pair = new Pair(new TokenAmount(USDC, '100'), new TokenAmount(DAI, '100'))
    it('returns true if token in pair', () => {
      expect(pair.involvesToken(USDC)).toBe(true)
      expect(pair.involvesToken(DAI)).toBe(true)
    })

    it('returns false if token not in pair', () => {
      expect(pair.involvesToken(WETH[ChainId.MAINNET])).toBe(false)
    })
  })
})
