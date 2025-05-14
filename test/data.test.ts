import { ChainId, WETH, Token, Fetcher } from '../src'
import { JsonRpcProvider } from '@ethersproject/providers'

// ⛽ Replace this with your own local or Alchemy/Infura endpoint for stability
const MAINNET_PROVIDER = new JsonRpcProvider(process.env.MAINNET_RPC || 'https://eth.llamarpc.com')
const BSC_TESTNET_PROVIDER = new JsonRpcProvider(process.env.BSC_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545')

describe('data', () => {
  it('fetches mainnet DAI token', async () => {
    const token = await Fetcher.fetchTokenData(
      ChainId.MAINNET,
      '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
      MAINNET_PROVIDER
    )
    expect(token.decimals).toEqual(18)
  })

  it('fetches mainnet DGD token (cached)', async () => {
    const token = await Fetcher.fetchTokenData(
      ChainId.MAINNET,
      '0xE0B7927c4aF23765Cb51314A0E0521A9645F0E2A', // DGD
      MAINNET_PROVIDER
    )
    expect(token.decimals).toEqual(9)
  })

  it('fetches BSC testnet pair WBNB/DAI', async () => {
    const token = new Token(
      ChainId.BSCTESTNET,
      '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735',
      18,
      'DAI'
    )

    const pair = await Fetcher.fetchPairData(
      WETH[ChainId.BSCTESTNET],
      token,
      BSC_TESTNET_PROVIDER
    )

    expect(pair.token0.equals(WETH[ChainId.BSCTESTNET]) || pair.token1.equals(WETH[ChainId.BSCTESTNET])).toBe(true)
    expect(pair.reserve0.currency.decimals).toBeDefined()
  })
})
