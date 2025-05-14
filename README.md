# OrbionFinance SDK

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![CI](https://github.com/orbionchain/orbionfinance-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/orbionchain/orbionfinance-sdk/actions)
[![npm version](https://img.shields.io/npm/v/@orbionchain/orbionfinance-sdk/latest.svg)](https://www.npmjs.com/package/@orbionchain/orbionfinance-sdk)

> ⚡ OrbionFinance SDK is a TypeScript library for building DEX and DeFi applications powered by OrbionChain across multiple EVM-compatible blockchains such as Ethereum, BSC, Sepolia, and beyond.

---

## ✨ Features

- 🧮 Precise math with [`JSBI`](https://github.com/GoogleChrome/jsbi) and [`big.js`](https://github.com/MikeMcl/big.js)
- 🔁 Multichain support with chain-aware factory/router/config resolution
- ⚖️ Fractional arithmetic: `Price`, `Percent`, `TokenAmount`, `CurrencyAmount`
- 💸 Supports native assets (`ETH`, `BNB`, etc.) via wrapping abstraction
- 🧩 Modular structure: clean separation of entities, fractions, and core utilities

---

## 📦 Installation

```bash
npm install @orbionchain/orbionfinance-sdk
# or
yarn add @orbionchain/orbionfinance-sdk
