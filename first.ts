import {getMarketContracts} from  "./config/contractAddress";
import { reserveAddresses, ATokenAddresses, getERC20 } from "./config/reserveAddress";
import {HardhatRuntimeEnvironment } from "hardhat/types";
import {accountAddresses} from "./config/accountAddress";

declare let hre: HardhatRuntimeEnvironment;

let ethers = hre.ethers;

async function accountQuery(){
    const accounts = await ethers.getSigners();
    for (let i = 0;i<accounts.length;i++){
        const balance = await ethers.provider.getBalance(accounts[i].address);
        // console.log("Account number ", i, ": ", accounts[i].address, " ", ethers.utils.formatEther(1), "ETH");
    }

    console.log(ethers.utils.hexlify('0x01020304'));
    console.log(ethers.utils.arrayify('0x01020304'));

    
    console.log(ethers.utils.formatUnits(1,"ether"));
    console.log(ethers.utils.parseUnits("1.0", "ether"));
    console.log(ethers.BigNumber.from(1));
    const currentBlock = await ethers.provider.getBlock("latest");
    const currentBlockNumber = currentBlock.number;
    const blockTime = new Date(currentBlock.timestamp*1000);
    console.log("Current block is ", currentBlockNumber);
    console.log("Current Time is ", blockTime);
    console.log("Gas Limit is ", currentBlock.gasLimit.toNumber(), "Unit");
}

// accountQuery().catch((error) =>{
//     console.error(error);
//     process.exit(1);
// });


async function bytesTest(){
    const inputString:string = "EthanZ";
    console.log("Bytes32String:");
    console.log(ethers.utils.formatBytes32String(inputString)); // => string< DataHexString< 32 > >
    console.log(ethers.utils.parseBytes32String(ethers.utils.formatBytes32String(inputString)));

    console.log("UTF-8 Strings:");// Decimal
    console.log(ethers.utils.toUtf8Bytes(inputString));  // => Uint8Array
    console.log(ethers.utils.toUtf8String(ethers.utils.toUtf8Bytes(inputString)));
    console.log(ethers.utils.toUtf8CodePoints(inputString));  // array

    const bytesString = ethers.utils.formatBytes32String(inputString);
    const utf8String = ethers.utils.formatBytes32String(inputString);
    console.log(ethers.utils.arrayify(bytesString));     // ⇒ Uint8Array
    console.log("ethers.utils.arrayify using arryish", ethers.utils.arrayify([       // accept DataHexStringOrArrayish
        88, 105, 110, 121,
        117, 32, 90, 104,
        97, 110, 103
    ]
    ));     // ⇒ Uint8Array
    console.log(ethers.utils.hexlify(bytesString)); // => string<DataHexString>
    console.log(ethers.utils.hexlify([       // accept hexstringOrArrayish
        88, 105, 110, 121,
       117,  32,  90, 104,
        97, 110, 103
     ])); // => string<DataHexString>

    console.log(ethers.utils.hexValue([
        88, 105, 110, 121,
        117,  32,  90, 104,
         97, 110, 103
    ]))
    
    console.log("Test on object:" );
    console.log(ethers.utils.arrayify({ length: 5, "0": 1, "1": 2,"2":3, "4": 7,"3": 3 }));     // ⇒ Uint8Array
    console.log(ethers.utils.hexlify({ length: 5, "0": 1, "1": 2,"2":3, "4": 10,"3": 3 }));     // ⇒ Uint8Array
    console.log(ethers.utils.hexValue({ length: 5, "0": 1, "1": 2,"2":3, "4": 10,"3": 3 }));     // ⇒ Uint8Array
    
    console.log(ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Xinyu Zhang's first transaction data info.!")))

}

// bytesTest().catch((error) =>{
//     console.error(error);
//     process.exit(1);
// });


async function addressProviderContractQuery(){
    const addressProvider  = await getMarketContracts("PoolAddressesProvider"); 
    console.log("Market ID: ",await addressProvider.getMarketId());
    
    console.log("Adress for INCENTIVES_CONTROLLER: ",await addressProvider.getAddress(
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("INCENTIVES_CONTROLLER"))
    ));

    console.log("Adress for POOL: ",await addressProvider.getAddress(ethers.utils.formatBytes32String("POOL")));

    console.log("Pool address: ", await addressProvider.getPool());

    console.log("PoolConfigurator address: ", await addressProvider.getPoolConfigurator());

    console.log("PriceOracle address: ", await addressProvider.getPriceOracle());

    console.log("ACLM address: ", await addressProvider.getACLManager());

    console.log("Owner address: ", await addressProvider.owner());

    console.log("Who is ACL Admin: ", await addressProvider.getACLAdmin());

    /** do not exist for Polygon. 
     * console.log("Price Oracle Sentinel: ", await addressProvider.getPriceOracleSentinel());
     *  */ 

    console.log("Pool Data Provider: ", await addressProvider.getPoolDataProvider());

}

async function poolAddressesProviderRegistryQuery(){
    const poolAddressProviderRegistry  = await getMarketContracts("PoolAddressesProviderRegistry"); 
    console.log("List of active PoolAddressesProvider: ", await poolAddressProviderRegistry.getAddressesProvidersList());
    console.log("getAddressesProviderIdByAddress: ", (await poolAddressProviderRegistry.getAddressesProviderIdByAddress("0x794a61358D6845594F94dc1DB02A252b5b4814aD")).toNumber());
}

async function poolDataProviderQuery(){
    const poolDataProvider  = await getMarketContracts("PoolDataProvider"); 
    console.log("List of the existing reserves in the pool: ", (await poolDataProvider.getAllReservesTokens()).map((each: any)=>{
        return (each.symbol).concat(": " + each.tokenAddress);
    }));
    console.log("List of the existing ATokens in the pool: ", (await poolDataProvider.getAllATokens()).map((each:any)=>{
        return (each.symbol).concat(": " + each.tokenAddress);;
    })
    );
    
    const tokenAddress = reserveAddresses["AAVE"];
    const aTokenAddress = ATokenAddresses["aPolDAI"];
    const tokenID = 6
    console.log("Reserve Configuration for %s: ", Object.keys(reserveAddresses)[tokenID], await poolDataProvider.getReserveConfigurationData(tokenAddress));
    // work but meaningless
    // console.log("Reserve Configuration for %s: ", Object.keys(ATokenAddresses)[tokenID], await poolDataProvider.getReserveConfigurationData(aTokenAddress));

    console.log("getReserveEModeCategory for %s: ", Object.keys(reserveAddresses)[tokenID], await poolDataProvider.getReserveEModeCategory(tokenAddress));
    // console.log("getReserveEModeCategory for %s: ", Object.keys(ATokenAddresses)[0], await poolDataProvider.getReserveEModeCategory(aTokenAddress));

    console.log("getReserveCaps for %s: ", Object.keys(reserveAddresses)[tokenID], await poolDataProvider.getReserveCaps(tokenAddress));
    // work but meaningless
    // console.log("getReserveCaps for %s: ", Object.keys(ATokenAddresses)[tokenID], await poolDataProvider.getReserveCaps(aTokenAddress));

    console.log("getPaused %s: ", Object.keys(reserveAddresses)[tokenID], await poolDataProvider.getPaused(tokenAddress));
    // work but meaningless
    // console.log("getPaused %s: ", Object.keys(ATokenAddresses)[tokenID], await poolDataProvider.getPaused(aTokenAddress));

    console.log("getSiloedBorrowing %s: ", Object.keys(reserveAddresses)[tokenID], await poolDataProvider.getSiloedBorrowing(tokenAddress));
    // console.log("getSiloedBorrowing %s: ", Object.keys(ATokenAddresses)[0], await poolDataProvider.getSiloedBorrowing(aTokenAddress));

    console.log("getLiquidationProtocolFee %s: ", Object.keys(reserveAddresses)[tokenID], await poolDataProvider.getLiquidationProtocolFee(tokenAddress));
    // console.log("getLiquidationProtocolFee %s: ", Object.keys(ATokenAddresses)[0], await poolDataProvider.getLiquidationProtocolFee(aTokenAddress));

    console.log("getUnbackedMintCap %s: ", Object.keys(reserveAddresses)[tokenID], await poolDataProvider.getUnbackedMintCap(tokenAddress));
    // console.log("getUnbackedMintCap %s: ", Object.keys(ATokenAddresses)[0], await poolDataProvider.getUnbackedMintCap(aTokenAddress));

    console.log("getDebtCeiling %s: ", Object.keys(reserveAddresses)[tokenID], await poolDataProvider.getDebtCeiling(tokenAddress));
    // console.log("getDebtCeiling %s: ", Object.keys(ATokenAddresses)[0], await poolDataProvider.getDebtCeiling(aTokenAddress));

    console.log("getDebtCeilingDecimals %s: ", Object.keys(reserveAddresses)[tokenID], await poolDataProvider.getDebtCeilingDecimals());

    console.log("getReserveData %s: ", Object.keys(reserveAddresses)[tokenID], await poolDataProvider.getReserveData(tokenAddress));
    // only work for reserve address
    // console.log("getReserveData %s: ", Object.keys(ATokenAddresses)[tokenID], await poolDataProvider.getReserveData(aTokenAddress));

    console.log("getATokenTotalSupply %s: ", Object.keys(reserveAddresses)[tokenID], await poolDataProvider.getATokenTotalSupply(tokenAddress));
    // only work for reserve address
    // console.log("getATokenTotalSupply %s: ", Object.keys(ATokenAddresses)[tokenID], await poolDataProvider.getATokenTotalSupply(aTokenAddress));

    console.log("getTotalDebt %s: ", Object.keys(reserveAddresses)[tokenID], await poolDataProvider.getTotalDebt(tokenAddress));
    // only work for reserve address
    // console.log("getTotalDebt %s: ", Object.keys(ATokenAddresses)[tokenID], await poolDataProvider.getTotalDebt(aTokenAddress));

    const payer = accountAddresses[0];
    console.log("getUserReserveData %s: ", Object.keys(reserveAddresses)[tokenID], await poolDataProvider.getUserReserveData(tokenAddress, payer));
    // only work for reserve address
    // console.log("getUserReserveData %s: ", Object.keys(ATokenAddresses)[tokenID], await poolDataProvider.getUserReserveData(aTokenAddress, payer));

    console.log("getReserveTokensAddresses %s: ", Object.keys(reserveAddresses)[tokenID], await poolDataProvider.getReserveTokensAddresses(tokenAddress));
    // work but meaningless
    // console.log("getReserveTokensAddresses %s: ", Object.keys(ATokenAddresses)[tokenID], await poolDataProvider.getReserveTokensAddresses(aTokenAddress));

    console.log("getInterestRateStrategyAddress %s: ", Object.keys(reserveAddresses)[tokenID], await poolDataProvider.getInterestRateStrategyAddress(tokenAddress));
    // work but meaningless
    // console.log("getInterestRateStrategyAddress %s: ", Object.keys(ATokenAddresses)[tokenID], await poolDataProvider.getInterestRateStrategyAddress(aTokenAddress));

}
// poolDataProviderQuery().catch((error) =>{
//     console.error(error);
//     process.exit(1);
// });
// accountQuery().catch((error) =>{
//     console.error(error);
//     process.exit(1);
// });

// addressProviderContractQuery().catch((error) =>{
//     console.error(error);
//     process.exit(1);
// });

// poolAddressesProviderRegistryQuery().catch((error) =>{
//     console.error(error);
//     process.exit(1);
// });
async function getWETH(){
    const poolAddressProviderRegistry  = await getMarketContracts("PoolAddressesProviderRegistry"); 
    const poolAddress =  (await poolAddressProviderRegistry.getAddressesProvidersList())[0];
    const payer = accountAddresses[0];
    const tokenAddress = reserveAddresses["WETH"];
    const token = await getERC20(tokenAddress);
    console.log("Before deposit call, current WETH balance", ethers.utils.formatEther(await token.balanceOf(payer)),
                "Current ETH Value is ", ethers.utils.formatEther(await ethers.provider.getBalance(payer)));
    console.log("Total WETH balance is", ethers.utils.formatEther((await token.totalSupply())));
    const wethGateway  = await getMarketContracts("WETHGateway");
    const txResponse = await wethGateway.depositETH(poolAddress, payer, 0, {value: ethers.utils.parseEther("100")});
    console.log(txResponse);
    console.log(await txResponse.wait());
    console.log("After deposit call, current WETH balance", ethers.utils.formatEther(await token.balanceOf(payer)),
                "Current ETH Value is ", ethers.utils.formatEther(await ethers.provider.getBalance(payer)));
    console.log("Total WETH balance is", ethers.utils.formatEther((await token.totalSupply())));

    
    // depositETH(address pool, address onBehalfOf, uint16 referralCode);
}

// getWETH().catch((error) =>{
//     console.error(error);
//     process.exit(1);
// });
async function checkBalance(){
    const poolAddressProviderRegistry  = await getMarketContracts("PoolAddressesProviderRegistry"); 
    const poolAddress =  (await poolAddressProviderRegistry.getAddressesProvidersList())[0];
    const payer = accountAddresses[0];
    const tokenAddress = "0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97";
    const token = await getERC20(tokenAddress);
    console.log("current balance", ethers.utils.formatEther(await token.balanceOf(payer)),
                "Current ETH Value is ", ethers.utils.formatEther(await ethers.provider.getBalance(payer)));    
}

checkBalance().catch((error) =>{
    console.error(error);
    process.exit(1);
});


async function poolQuery(){
    const pool  = await getMarketContracts("Pool"); 
    const poolAddressProviderRegistry  = await getMarketContracts("PoolAddressesProviderRegistry"); 
    const poolAddress =  (await poolAddressProviderRegistry.getAddressesProvidersList())[0];
    const uiPool  = await getMarketContracts("UIPoolDataProvider"); 
    const payer = accountAddresses[0];

    // console.log(await uiPool.getUserReservesData(poolAddress,payer));
    console.log(await uiPool.getReservesData(poolAddress));

    
    console.log(await pool.getUserAccountData(payer));
    // const tokenAddress = reserveAddresses["WETH"];
    // const token = await getWETH(tokenAddress);
    // console.log("Before deposit call, current WETH balance", ethers.utils.formatEther(await token.balanceOf(payer)),
    //             "Current ETH Value is ", ethers.utils.formatEther(await ethers.provider.getBalance(payer)));
    // console.log("WETH balance is", ethers.utils.formatEther((await token.totalSupply())));
    // console.log("*******************************");    
    // const transaction = await token.deposit({ value: ethers.utils.parseEther("100") })
    // await transaction.wait()
    // console.log(transaction);
    // console.log("*******************************");

    // console.log("After deposit call, current WETH balance", ethers.utils.formatEther(await token.balanceOf(payer)),
    //             "Current ETH Value is ", ethers.utils.formatEther(await ethers.provider.getBalance(payer)));
    // console.log("WETH balance is", ethers.utils.formatEther((await token.totalSupply())));
    // console.log("executionResponse", await pool.getReservesList());
    // const executionResponse = await pool.supply(pool,100, payer, 0);

    // supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)
    // supplyWithPermit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode, uint256 deadline, uint8 permitV, permitR, bytes32 permitS)
    // withdraw(address asset, uint256 amount, address to)
    // borrow(address asset, uint256 amount, uint256 interestRateMode(1: stable, 2: variable), uint16 referralCode, address onBehalfOf)
    // repay(address asset, uint256 amount, uint256 rateMode, address onBehalfOf)
    // repayWithPermit(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf, uint256 deadline, uint8 permitV, permitR, bytes32 permitS)
    // repayWithATokens(address asset,uint256 amount,uint256 interestRateMode)
    // swapBorrowRateMode(address asset, uint256 rateMode)
    // rebalanceStableBorrowRate(address asset, address user)
    // setUserUseReserveAsCollateral(address asset, bool useAsCollateral)
    // liquidationCall(address collateral, address debt, address user, uint256 debtToCover, bool receiveAToken
    // flashLoan( address receiverAddress, address[] calldata assets, uint256[] calldata amounts, uint256[] interestRateModes, address onBehalfOf, bytes calldata params, uint16 referralCode)
    // flashLoanSimple( address receiverAddress, address asset, uint256 amount, bytes calldata params, uint16 referralCode)
    // mintToTreasury(address[] calldata assets)
    // setUserEMode(uint8 categoryId)
    // mintUnbacked (asset, amount, onBehalfOf, referralCode)
    // backUnbacked (asset, amount, fee)
    // rescueTokens(address token, address to, uint256 amount)
    // getReserveData(address asset)
    // getUserAccountData(address user)
    // getConfiguration(address asset)
    // getUserConfiguration(address user)
    // getReserveNormalizedIncome(address asset)
    // getReserveNormalizedVariableDebt(address asset)
    // getReservesList()
    // getEModeCategoryData(uint8 id)
    // getUserEMode(address user)
    // FLASHLOAN_PREMIUM_TOTAL() public view returns (uint128)
    // FLASHLOAN_PREMIUM_TO_PROTOCOL() public view returns (uint128)

}
poolQuery().catch((error) =>{
    console.error(error);
    process.exit(1);
});