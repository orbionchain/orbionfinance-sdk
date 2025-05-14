import { Fraction } from '../src'
import JSBI from 'jsbi'

describe('Fraction', () => {
  describe('#quotient', () => {
    it('performs floor division', () => {
      expect(new Fraction(JSBI.BigInt(8), JSBI.BigInt(3)).quotient).toEqual(JSBI.BigInt(2))
      expect(new Fraction(JSBI.BigInt(12), JSBI.BigInt(4)).quotient).toEqual(JSBI.BigInt(3))
      expect(new Fraction(JSBI.BigInt(16), JSBI.BigInt(5)).quotient).toEqual(JSBI.BigInt(3))
    })
  })

  describe('#remainder', () => {
    it('returns the remainder fraction', () => {
      expect(new Fraction(JSBI.BigInt(8), JSBI.BigInt(3)).remainder).toEqual(new Fraction(JSBI.BigInt(2), JSBI.BigInt(3)))
      expect(new Fraction(JSBI.BigInt(12), JSBI.BigInt(4)).remainder).toEqual(new Fraction(JSBI.BigInt(0), JSBI.BigInt(4)))
      expect(new Fraction(JSBI.BigInt(16), JSBI.BigInt(5)).remainder).toEqual(new Fraction(JSBI.BigInt(1), JSBI.BigInt(5)))
    })
  })

  describe('#invert', () => {
    it('swaps numerator and denominator', () => {
      const f = new Fraction(JSBI.BigInt(5), JSBI.BigInt(10)).invert()
      expect(f.numerator).toEqual(JSBI.BigInt(10))
      expect(f.denominator).toEqual(JSBI.BigInt(5))
    })
  })

  describe('#add', () => {
    it('adds fractions with different denominators', () => {
      const result = new Fraction(JSBI.BigInt(1), JSBI.BigInt(10)).add(
        new Fraction(JSBI.BigInt(4), JSBI.BigInt(12))
      )
      expect(result).toEqual(new Fraction(JSBI.BigInt(52), JSBI.BigInt(120)))
    })

    it('adds fractions with the same denominator', () => {
      const result = new Fraction(JSBI.BigInt(1), JSBI.BigInt(5)).add(
        new Fraction(JSBI.BigInt(2), JSBI.BigInt(5))
      )
      expect(result).toEqual(new Fraction(JSBI.BigInt(3), JSBI.BigInt(5)))
    })
  })

  describe('#subtract', () => {
    it('subtracts fractions with different denominators', () => {
      const result = new Fraction(JSBI.BigInt(1), JSBI.BigInt(10)).subtract(
        new Fraction(JSBI.BigInt(4), JSBI.BigInt(12))
      )
      expect(result).toEqual(new Fraction(JSBI.BigInt(-28), JSBI.BigInt(120)))
    })

    it('subtracts fractions with same denominator', () => {
      const result = new Fraction(JSBI.BigInt(3), JSBI.BigInt(5)).subtract(
        new Fraction(JSBI.BigInt(2), JSBI.BigInt(5))
      )
      expect(result).toEqual(new Fraction(JSBI.BigInt(1), JSBI.BigInt(5)))
    })
  })

  describe('#lessThan', () => {
    it('compares correctly', () => {
      expect(new Fraction(JSBI.BigInt(1), JSBI.BigInt(10)).lessThan(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12)))).toBe(true)
      expect(new Fraction(JSBI.BigInt(1), JSBI.BigInt(3)).lessThan(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12)))).toBe(false)
      expect(new Fraction(JSBI.BigInt(5), JSBI.BigInt(12)).lessThan(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12)))).toBe(false)
    })
  })

  describe('#equalTo', () => {
    it('evaluates equality correctly', () => {
      expect(new Fraction(JSBI.BigInt(1), JSBI.BigInt(10)).equalTo(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12)))).toBe(false)
      expect(new Fraction(JSBI.BigInt(1), JSBI.BigInt(3)).equalTo(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12)))).toBe(true)
      expect(new Fraction(JSBI.BigInt(5), JSBI.BigInt(12)).equalTo(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12)))).toBe(false)
    })
  })

  describe('#greaterThan', () => {
    it('evaluates greater-than correctly', () => {
      expect(new Fraction(JSBI.BigInt(1), JSBI.BigInt(10)).greaterThan(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12)))).toBe(false)
      expect(new Fraction(JSBI.BigInt(1), JSBI.BigInt(3)).greaterThan(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12)))).toBe(false)
      expect(new Fraction(JSBI.BigInt(5), JSBI.BigInt(12)).greaterThan(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12)))).toBe(true)
    })
  })

  describe('#multiply', () => {
    it('multiplies correctly', () => {
      expect(new Fraction(JSBI.BigInt(1), JSBI.BigInt(10)).multiply(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12)))).toEqual(
        new Fraction(JSBI.BigInt(4), JSBI.BigInt(120))
      )
      expect(new Fraction(JSBI.BigInt(1), JSBI.BigInt(3)).multiply(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12)))).toEqual(
        new Fraction(JSBI.BigInt(4), JSBI.BigInt(36))
      )
      expect(new Fraction(JSBI.BigInt(5), JSBI.BigInt(12)).multiply(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12)))).toEqual(
        new Fraction(JSBI.BigInt(20), JSBI.BigInt(144))
      )
    })
  })

  describe('#divide', () => {
    it('divides correctly', () => {
      expect(new Fraction(JSBI.BigInt(1), JSBI.BigInt(10)).divide(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12)))).toEqual(
        new Fraction(JSBI.BigInt(12), JSBI.BigInt(40))
      )
      expect(new Fraction(JSBI.BigInt(1), JSBI.BigInt(3)).divide(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12)))).toEqual(
        new Fraction(JSBI.BigInt(12), JSBI.BigInt(12))
      )
      expect(new Fraction(JSBI.BigInt(5), JSBI.BigInt(12)).divide(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12)))).toEqual(
        new Fraction(JSBI.BigInt(60), JSBI.BigInt(48))
      )
    })
  })
})
