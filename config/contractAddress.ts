import {abi as poolAddressesProviderABI}  from "@aave/core-v3/artifacts/contracts/protocol/configuration/PoolAddressesProvider.sol/PoolAddressesProvider.json";
import {abi as poolAddressesProviderRegistryABI} from "@aave/core-v3/artifacts/contracts/protocol/configuration/PoolAddressesProviderRegistry.sol/PoolAddressesProviderRegistry.json"
import {abi as poolDataProviderABI} from "@aave/core-v3/artifacts/contracts/misc/AaveProtocolDataProvider.sol/AaveProtocolDataProvider.json"
import {abi as poolABI} from "@aave/core-v3/artifacts/contracts/protocol/pool/Pool.sol/Pool.json"
import {abi as wethGatewayABI} from "@aave/periphery-v3/artifacts/contracts/misc/WETHGateway.sol/WETHGateway.json"
import {abi as uiPoolDataProviderABI} from "@aave/periphery-v3/artifacts/contracts/misc/UiPoolDataProviderV3.sol/UiPoolDataProviderV3.json"
import {abi as priceOracleABI} from "@aave/core-v3/artifacts/contracts/misc/AaveOracle.sol/AaveOracle.json"
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Contract } from "ethers";


declare let hre: HardhatRuntimeEnvironment;

let ethers = hre.ethers;

interface MarketAddresses {
    addressesProvider: string;
    poolAddressesProviderRegister:string;
    pool: string;
    PoolConfigurator: string;
    PriceOracle: string;
    ACLManager: string;
    PoolDataProvider: string;
    priceOracle: string
};

const addresses: MarketAddresses = {
    addressesProvider: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
    poolAddressesProviderRegister: "0x770ef9f4fe897e59daCc474EF11238303F9552b6",
    pool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
    PoolConfigurator: "0x8145eddDf43f50276641b55bd3AD95944510021E",
    PriceOracle: "0xb023e699F5a33916Ea823A16485e259257cA8Bd1",
    ACLManager: "0xa72636CbcAa8F5FF95B2cc47F3CDEe83F3294a0B",
    PoolDataProvider: "0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654",
    priceOracle: "0xb023e699F5a33916Ea823A16485e259257cA8Bd1",
};

const peripheryAddress = {
    WETHGateway:"0x1e4b7A6b903680eab0c5dAbcb8fD429cD2a9598c",
    UIPoolDataProviderABI: "0x7006e5a16E449123a3F26920746d03337ff37340"
}

const abiMap: { [abiKey: string]: any[] } = {
    ["PoolAddressesProvider"]: [poolAddressesProviderABI, addresses.addressesProvider],
    ["PoolAddressesProviderRegistry"]: [poolAddressesProviderRegistryABI, addresses.poolAddressesProviderRegister],
    ["PoolDataProvider"]:[poolDataProviderABI, addresses.PoolDataProvider],
    ["Pool"]: [poolABI, addresses.pool],
    ["WETHGateway"]: [wethGatewayABI, peripheryAddress.WETHGateway],
    ["UIPoolDataProvider"]:[uiPoolDataProviderABI, peripheryAddress.UIPoolDataProviderABI],
    ["PriceOracle"]:[priceOracleABI, addresses.priceOracle]
}



const getContract = async <ContractType extends Contract>(
    abi:any[], address:string): Promise<ContractType> => {
        const signer = (await ethers.getSigners())[0];
        return hre.ethers.getContractAt(abi, address, signer) as Promise<ContractType>;
};

export const getMarketContracts = async (abiKey:string)=>{
    return (await getContract(abiMap[abiKey][0], abiMap[abiKey][1]));
};