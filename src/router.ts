import { TradeType, ChainId } from './constants'
import invariant from 'tiny-invariant'
import { validateAndParseAddress } from './utils'
import { CurrencyAmount, ETHER, Percent, Trade } from './entities'

export interface TradeOptions {
  allowedSlippage: Percent
  ttl: number
  recipient: string
  feeOnTransfer?: boolean
  chainId?: ChainId // Optional: useful if later you want custom behavior
}

export interface SwapParameters {
  methodName: string
  args: (string | string[])[]
  value: string
}

function toHex(currencyAmount: CurrencyAmount) {
  return `0x${currencyAmount.raw.toString(16)}`
}

const ZERO_HEX = '0x0'

export abstract class Router {
  private constructor() {}

  public static swapCallParameters(trade: Trade, options: TradeOptions): SwapParameters {
    const etherIn = trade.inputAmount.currency === ETHER
    const etherOut = trade.outputAmount.currency === ETHER

    invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')
    invariant(options.ttl > 0, 'TTL')

    const to = validateAndParseAddress(options.recipient)
    const amountIn = toHex(trade.maximumAmountIn(options.allowedSlippage))
    const amountOut = toHex(trade.minimumAmountOut(options.allowedSlippage))
    const path = trade.route.path.map(token => token.address)
    const deadline = `0x${(Math.floor(Date.now() / 1000) + options.ttl).toString(16)}`
    const useFeeOnTransfer = Boolean(options.feeOnTransfer)

    let methodName: string
    let args: (string | string[])[]
    let value: string

    switch (trade.tradeType) {
      case TradeType.EXACT_INPUT:
        if (etherIn) {
          methodName = useFeeOnTransfer ? 'swapExactETHForTokensSupportingFeeOnTransferTokens' : 'swapExactETHForTokens'
          args = [amountOut, path, to, deadline]
          value = amountIn
        } else if (etherOut) {
          methodName = useFeeOnTransfer
            ? 'swapExactTokensForETHSupportingFeeOnTransferTokens'
            : 'swapExactTokensForETH'
          args = [amountIn, amountOut, path, to, deadline]
          value = ZERO_HEX
        } else {
          methodName = useFeeOnTransfer
            ? 'swapExactTokensForTokensSupportingFeeOnTransferTokens'
            : 'swapExactTokensForTokens'
          args = [amountIn, amountOut, path, to, deadline]
          value = ZERO_HEX
        }
        break

      case TradeType.EXACT_OUTPUT:
        invariant(!useFeeOnTransfer, 'EXACT_OUT_FOT')
        if (etherIn) {
          methodName = 'swapETHForExactTokens'
          args = [amountOut, path, to, deadline]
          value = amountIn
        } else if (etherOut) {
          methodName = 'swapTokensForExactETH'
          args = [amountOut, amountIn, path, to, deadline]
          value = ZERO_HEX
        } else {
          methodName = 'swapTokensForExactTokens'
          args = [amountOut, amountIn, path, to, deadline]
          value = ZERO_HEX
        }
        break
    }

    return {
      methodName,
      args,
      value
    }
  }
}
