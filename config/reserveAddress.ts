import {abi as tokenABI } from "@aave/core-v3/artifacts/contracts/dependencies/openzeppelin/contracts/IERC20Detailed.sol/IERC20Detailed.json"

import { HardhatRuntimeEnvironment } from "hardhat/types";
declare let hre: HardhatRuntimeEnvironment;
let ethers = hre.ethers;

export const reserveAddresses: { [name: string]: string } = {
    ['DAI']: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    ['LINK']: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
    ['USDC']: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    ['WBTC']: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    ['WETH']: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    ['USDT']: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    ['AAVE']: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
    ['WMATIC']: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    ['CRV']: '0x172370d5Cd63279eFa6d502DAB29171933a610AF',
    ['SUSHI']: '0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a',
    ['GHST']: '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7',
    ['BAL']: '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3',
    ['DPI']: '0x85955046DF4668e1DD369D2DE9f3AEB98DD2A369',
    ['EURS']: '0xE111178A87A3BFf0c8d18DECBa5798827539Ae99',
    ['jEUR']: '0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c',
    ['agEUR']: '0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4',
    ['miMATIC']: '0xa3Fa99A148fA48D14Ed51d610c367C61876997F1',
    ['stMATIC']: '0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4',
}

export const ATokenAddresses: { [name: string]: string } = {
    ['aPolDAI']:  '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE',
    ['aPolLINK']:  '0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530',
    ['aPolUSDC']:  '0x625E7708f30cA75bfd92586e17077590C60eb4cD',
    ['aPolWBTC']:  '0x078f358208685046a11C85e8ad32895DED33A249',
    ['aPolWETH']:  '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8',
    ['aPolUSDT']:  '0x6ab707Aca953eDAeFBc4fD23bA73294241490620',
    ['aPolAAVE']:  '0xf329e36C7bF6E5E86ce2150875a84Ce77f477375',
    ['aPolWMATIC']:  '0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97',
    ['aPolCRV']:  '0x513c7E3a9c69cA3e22550eF58AC1C0088e918FFf',
    ['aPolSUSHI']:  '0xc45A479877e1e9Dfe9FcD4056c699575a1045dAA',
    ['aPolGHST']:  '0x8Eb270e296023E9D92081fdF967dDd7878724424',
    ['aPolBAL']:  '0x8ffDf2DE812095b1D19CB146E4c004587C0A0692',
    ['aPolDPI']:  '0x724dc807b04555b71ed48a6896b6F41593b8C637',
    ['aPolEURS']:  '0x38d693cE1dF5AaDF7bC62595A37D667aD57922e5',
    ['aPolJEUR']:  '0x6533afac2E7BCCB20dca161449A13A32D391fb00',
    ['aPolAGEUR']:  '0x8437d7C167dFB82ED4Cb79CD44B7a32A1dd95c77',
    ['aPolMIMATIC']:  '0xeBe517846d0F36eCEd99C735cbF6131e1fEB775D',
    ['aPolSTMATIC']:  '0xEA1132120ddcDDA2F119e99Fa7A27a0d036F7Ac9'
}

export const getERC20 = async (token: string) => {
    const signer = (await ethers.getSigners())[0];
    return (await hre.ethers.getContractAt(tokenABI, token, signer));
};
export const abiEncode = (types: string[], values: (string | number)[]) =>
  hre.ethers.utils.defaultAbiCoder.encode(types, values);

