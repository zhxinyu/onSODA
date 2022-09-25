import {getMarketContracts} from  "../config/contractAddress";
import { reserveAddresses, getERC20, abiEncode} from "../config/reserveAddress";
import {HardhatRuntimeEnvironment } from "hardhat/types";
import {accountAddresses} from "../config/accountAddress";
import {MAX_UINT_AMOUNT} from "../config/constants";

declare let hre: HardhatRuntimeEnvironment;

let ethers = hre.ethers;

async function poolQuery(){
    // feedAccount();
    const pool  = await getMarketContracts("Pool"); 
    const poolAddressProviderRegistry  = await getMarketContracts("PoolAddressesProviderRegistry"); 
    const poolAddress =  (await poolAddressProviderRegistry.getAddressesProvidersList())[0];
    const uiPool  = await getMarketContracts("UIPoolDataProvider"); 
    const payer = accountAddresses[0];

    // console.log(await uiPool.getUserReservesData(poolAddress,payer));
    // console.log(await uiPool.getReservesData(poolAddress));

    
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
    const tokenName = "WMATIC";
    const tokenAddress = reserveAddresses[tokenName];
    const token = await getERC20(tokenAddress);
    const decimals = await token.decimals();
    const rawAmount = ethers.utils.parseUnits("100000", decimals);
    const balance =await token.balanceOf(payer);
    console.log(balance, rawAmount);

    let txResponse = await token.approve("0x794a61358D6845594F94dc1DB02A252b5b4814aD", "0");
    txResponse.wait();
    txResponse  = await token.approve("0x794a61358D6845594F94dc1DB02A252b5b4814aD", MAX_UINT_AMOUNT);
    txResponse.wait();

    txResponse = await pool.supply(tokenAddress, rawAmount, payer, "0");
    // console.log(executionResponse);
    // console.log(await executionResponse.wait());
    await txResponse.wait()
    {
        const poolUserAccountData = await pool.getUserAccountData(payer);
        console.log(poolUserAccountData)
    }

    // supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)
    // withdraw(address asset, uint256 amount, address to)
    console.log("start borrowing!");

    const priceOracle = await getMarketContracts("PriceOracle");
    for (let address in reserveAddresses){
        console.log(address, "Price is :", ethers.utils.formatUnits(await priceOracle.getAssetPrice(reserveAddresses[address]),8));
    }
    const borrowTokenName = ['DAI','AAVE','CRV','SUSHI', 'USDC','GHST','BAL']
    for (let tName of borrowTokenName){
        console.log(tName);
        let eachtoken = await getERC20(reserveAddresses[tName]);
        const getUserAccountData = ethers.utils.parseUnits("1", await eachtoken.decimals());
        console.log();
        // txResponse = await pool.borrow(reserveAddresses[tName], rawAmount, "1"," 0", payer);
        // await txResponse.wait();
    }
    const {healthFactor} = await pool.getUserAccountData(payer);
    console.log(ethers.utils.formatUnits(healthFactor,18));
    
    // const txResponse borrow(address asset, uint256 amount, uint256 interestRateMode(1: stable, 2: variable), uint16 referralCode, address onBehalfOf)
    // repay(address asset, uint256 amount, uint256 rateMode, address onBehalfOf)

    // repayWithATokens(address asset,uint256 amount,uint256 interestRateMode)
    // swapBorrowRateMode(address asset, uint256 rateMode)
    // rebalanceStableBorrowRate(address asset, address user)
    // setUserUseReserveAsCollateral(address asset, bool useAsCollateral)
    // liquidationCall(address collateral, address debt, address user, uint256 debtToCover, bool receiveAToken
    // flashLoan( address receiverAddress, address[] calldata assets, uint256[] calldata amounts, uint256[] interestRateModes, address onBehalfOf, bytes calldata params, uint16 referralCode)
    // flashLoanSimple( address receiverAddress, address asset, uint256 amount, bytes calldata params, uint16 referralCode)

    // setUserEMode(uint8 categoryId)

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