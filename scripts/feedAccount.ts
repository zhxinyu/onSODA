import { reserveAddresses, getERC20, abiEncode} from "../config/reserveAddress";
import {HardhatRuntimeEnvironment } from "hardhat/types";
import {accountAddresses} from "../config/accountAddress";

declare let hre: HardhatRuntimeEnvironment;

let ethers = hre.ethers;
export async function feedAccount(){
    const tokenName = "WMATIC";
    const amount = "1000000000";
    const accountIndex = 0;
    const tokenAddress = reserveAddresses[tokenName];
    const payer = accountAddresses[accountIndex];
    const token = await getERC20(tokenAddress);
    const decimals = await token.decimals();
    const rawAmount = ethers.utils.parseUnits(amount, decimals);
    const slotValue = abiEncode(["uint"], [rawAmount.add(await token.balanceOf(payer)).toString()]);
    console.log(tokenName, "balance:", ethers.utils.formatEther(await token.balanceOf(payer)));
    {
        const account = ethers.constants.AddressZero;
        const probeA = abiEncode(["uint"],[1]);
        const probeB = abiEncode(["uint"],[2]);
        for (let i = 0; i<100; i++){
            let probedSlot = ethers.utils.keccak256(abiEncode(["address","uint"], [account, i]));
            while(probedSlot.startsWith("0x0")){
                probedSlot = "0x" + probedSlot.slice(3);
            }
            const prev = await ethers.provider.send("eth_getStorageAt", [tokenAddress, probedSlot, "latest"]);
            const probe = prev === probeA ? probeB: probeA;
            await ethers.provider.send("hardhat_setStorageAt", [tokenAddress,probedSlot, probe,]);
            const balance =await token.balanceOf(account);
            await ethers.provider.send("hardhat_setStorageAt", [tokenAddress,probedSlot, prev,]);
            if (balance.eq(ethers.BigNumber.from(probe))){
                // console.log("Location is ", i);
                let accountSlotLocation = hre.ethers.utils.keccak256(
                    abiEncode(["address", "uint"], [payer, i])
                );
                while (accountSlotLocation.startsWith("0x0")) {
                    accountSlotLocation = "0x" + accountSlotLocation.slice(3);
                }
                await ethers.provider.send("hardhat_setStorageAt", [
                    tokenAddress,
                    accountSlotLocation,
                    slotValue,
                  ]);
                break;
            }
            if (i === 99) {
                throw `Balances slot not found for ${tokenAddress}`;
            }
        }
    }
    console.log(tokenName, "balance:", ethers.utils.formatEther(await token.balanceOf(payer)));
}

feedAccount().catch((error) =>{
    console.error(error);
    process.exit(1);
});