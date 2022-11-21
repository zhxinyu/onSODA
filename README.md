# OnSODA
ETH Online 2022 [link](https://ethglobal.com/showcase/onestoporderdispatch-jt223)
## Introduction 

Write a dispatcher contract that can allow users to submit multiple actions in a single transaction. For example, Deposit then Borrow (Deposit ETH > Borrow USDC) or Leverage Long On Asset (Deposit ETH > Borrow USDC > Buy ETH > Deposit ETH > Borrow USDC).

## Project Description

The project aims to build a one-stop DApp to facilitate FOREX liquity market. It allows users to efficiently access liquidity using new features from AAVE v3 including E-mode and flash loans. The project provides an easy-to-use transaction builder where several actions can be submitted in a single transaction.

## How it's Made

The project uses AAVE API to get access to the borrow/supply market and leverage flashloan to enhance transaction efficiency. We use theGraph to store transaction data and will deploy contracts in Polygon. We used React and Ant Design (included inside Schaffold ETH) to design the frontend and the backend. Hardhat is used for contract writing, testing and depolyment.

