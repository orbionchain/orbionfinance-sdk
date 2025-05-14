import { getChainConfig } from '../src/utils'

describe('constants', () => {
  describe('INIT_CODE_HASH per chain', () => {
    it('matches expected hash for BSC Testnet (97)', () => {
      const config = getChainConfig(97)
      expect(config.initCodeHash).toEqual(
        '0xbf90f78951f8fd91390a1bcc642674d457d217fecec1aae078a09309cf3af6e1'
      )
    })

    it('matches expected hash for Sepolia (11155111)', () => {
      const config = getChainConfig(11155111)
      expect(config.initCodeHash).toEqual(
        '0x09faf0db2abc7be63b2dda8a616404b1d7ddcbd4808dbc637ba037f57c88a696'
      )
    })

    it('matches expected hash for Mainnet BSC/Ethereum (56)', () => {
      const config = getChainConfig(56)
      expect(config.initCodeHash).toEqual(
        '0xf52c5189a89e7ca2ef4f19f2798e3900fba7a316de7cef6c5a9446621ba86286'
      )
    })
  })

  describe('FACTORY per chain', () => {
    it('factory address is correct for BSC Testnet (97)', () => {
      expect(getChainConfig(97).factory).toEqual('0x897630E3EFCC6B5043B666430c0a68776E11c198')
    })

    it('factory address is correct for Sepolia (11155111)', () => {
      expect(getChainConfig(11155111).factory).toEqual('0x897630E3EFCC6B5043B666430c0a68776E11c198')
    })

    it('factory address is correct for Mainnet (56)', () => {
      expect(getChainConfig(56).factory).toEqual('0xdd538E4Fd1b69B7863E1F741213276A6Cf1EfB3B')
    })
  })

  describe('Router per chain', () => {
    it('router is correct for BSC Testnet (97)', () => {
      expect(getChainConfig(97).router).toEqual('0x7A8ba8b98eE2B67d157637C9Bce8535b7CA87761')
    })

    it('router is correct for Sepolia (11155111)', () => {
      expect(getChainConfig(11155111).router).toEqual('0x7A8ba8b98eE2B67d157637C9Bce8535b7CA87761')
    })

    it('router is correct for Mainnet (56)', () => {
      expect(getChainConfig(56).router).toEqual('0x10ED43C718714eb63d5aA57B78B54704E256024E')
    })
  })
})
