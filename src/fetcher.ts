import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'
import { TokenAmount } from './entities/fractions/tokenAmount'
import { Pair } from './entities/pair'
import OrbionFinancePairAbi from '@orbionfinance/orbionfinance-core/artifacts/contracts/OrbionFinancePair.sol/OrbionFinancePair.json';
import invariant from 'tiny-invariant'
import ERC20 from './abis/ERC20.json'
import { ChainId } from './constants'
import { Token } from './entities/token'

// Optional: map chainId ke public RPC, bisa juga diinject dari luar
const RPCS: Record<number, string> = {
  [ChainId.BSCTESTNET]: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  [ChainId.SEPOLIA]: 'https://rpc.sepolia.org',
  [ChainId.BSC]: 'https://bsc-dataseed.binance.org',
  [ChainId.ETHEREUM]: 'https://rpc.ankr.com/eth',
  [ChainId.MAINNET]: 'https://rpc.ankr.com/eth' // same as ETHEREUM
}

let TOKEN_DECIMALS_CACHE: { [chainId: number]: { [address: string]: number } } = {
  [ChainId.BSC]: {
    '0xE0B7927c4aF23765Cb51314A0E0521A9645F0E2A': 9 // DGD
  }
}

export abstract class Fetcher {
  private constructor() {}

  public static async fetchTokenData(
    chainId: ChainId,
    address: string,
    provider = new JsonRpcProvider(RPCS[chainId]),
    symbol?: string,
    name?: string
  ): Promise<Token> {
    const parsedDecimals =
      typeof TOKEN_DECIMALS_CACHE?.[chainId]?.[address] === 'number'
        ? TOKEN_DECIMALS_CACHE[chainId][address]
        : await new Contract(address, ERC20, provider).decimals().then((decimals: number): number => {
            TOKEN_DECIMALS_CACHE = {
              ...TOKEN_DECIMALS_CACHE,
              [chainId]: {
                ...TOKEN_DECIMALS_CACHE?.[chainId],
                [address]: decimals
              }
            }
            return decimals
          })

    return new Token(chainId, address, parsedDecimals, symbol, name)
  }

  public static async fetchPairData(
    tokenA: Token,
    tokenB: Token,
    provider = new JsonRpcProvider(RPCS[tokenA.chainId])
  ): Promise<Pair> {
    invariant(tokenA.chainId === tokenB.chainId, 'CHAIN_ID')
    const address = Pair.getAddress(tokenA, tokenB)
    const pairContract = new Contract(address, OrbionFinancePairAbi.abi, provider)
    const [reserves0, reserves1] = await pairContract.getReserves()
    const balances = tokenA.sortsBefore(tokenB) ? [reserves0, reserves1] : [reserves1, reserves0]
    return new Pair(new TokenAmount(tokenA, balances[0]), new TokenAmount(tokenB, balances[1]))
  }
}