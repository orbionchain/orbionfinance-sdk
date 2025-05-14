const CAN_SET_PROTOTYPE = 'setPrototypeOf' in Object

/**
 * Error: The pair has insufficient reserves for the desired output.
 */
export class InsufficientReservesError extends Error {
  public readonly isInsufficientReservesError: true = true

  public constructor(message = 'Insufficient reserves for this trade') {
    super(message)
    this.name = 'InsufficientReservesError'
    if (CAN_SET_PROTOTYPE) Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Error: The input amount is too small to produce any output.
 */
export class InsufficientInputAmountError extends Error {
  public readonly isInsufficientInputAmountError: true = true

  public constructor(message = 'Input amount too low to yield output') {
    super(message)
    this.name = 'InsufficientInputAmountError'
    if (CAN_SET_PROTOTYPE) Object.setPrototypeOf(this, new.target.prototype)
  }
}
