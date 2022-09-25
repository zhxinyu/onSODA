import { task } from "hardhat/config";
import {accountAddresses} from "../config/accountAddress";
import { reserveAddresses, getERC20, abiEncode} from "../config/reserveAddress";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
        const token = "WMATIC";
        const accountIndex = 0;
        const amount = "100";
        const tokenAddress = reserveAddresses[token];
        const payee = accountAddresses[accountIndex];
        const tokenInstance = await getERC20(tokenAddress);
        const decimals = await tokenInstance.decimals();
        const rawAmount = hre.ethers.utils.parseUnits(amount, decimals);
        const slotValue = abiEncode(["uint"], [rawAmount.add(await tokenInstance.balanceOf(payee)).toString()]);
        console.log(tokenInstance, "balance:", hre.ethers.utils.formatEther(await tokenInstance.balanceOf(payee)));
        const account = hre.ethers.constants.AddressZero;
        const probeA = abiEncode(["uint"],[1]);
        const probeB = abiEncode(["uint"],[2]);
 
        for (let i = 0; i<100; i++){
            let probedSlot = hre.ethers.utils.keccak256(abiEncode(["address","uint"], [account, i]));
            while(probedSlot.startsWith("0x0")){
                probedSlot = "0x" + probedSlot.slice(3);
            }
            const prev = await hre.ethers.provider.send("eth_getStorageAt", [tokenAddress, probedSlot, "latest"]);
            const probe = prev === probeA ? probeB: probeA;
            await hre.ethers.provider.send("hardhat_setStorageAt", [tokenAddress,probedSlot, probe,]);
            const balance =await tokenInstance.balanceOf(account);
            await hre.ethers.provider.send("hardhat_setStorageAt", [tokenAddress,probedSlot, prev,]);
            if (balance.eq(hre.ethers.BigNumber.from(probe))){
                // console.log("Location is ", i);
                let accountSlotLocation = hre.ethers.utils.keccak256(
                    abiEncode(["address", "uint"], [payee, i])
                );
                while (accountSlotLocation.startsWith("0x0")) {
                    accountSlotLocation = "0x" + accountSlotLocation.slice(3);
                }
                await hre.ethers.provider.send("hardhat_setStorageAt", [
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
        console.log(token, "balance:", hre.ethers.utils.formatEther(await tokenInstance.balanceOf(payee)));        
  });
// task(
//     "feed-account", 
//     "Add tokens to user account"
// )
// .addOptionalParam("token")
// .addOptionalParam("amount")
// .addOptionalParam("accountIndex")
// .setAction(
//     async({token="WMATIC", amount="100", accountIndex=0},hre) => {
//         const tokenAddress = reserveAddresses[token];
//         const payee = accountAddresses[accountIndex];
//         const tokenInstance = await getERC20(tokenAddress);
//         const decimals = await tokenInstance.decimals();
//         const rawAmount = hre.ethers.utils.parseUnits(amount, decimals);
//         const slotValue = abiEncode(["uint"], [rawAmount.add(await tokenInstance.balanceOf(payee)).toString()]);
//         console.log(tokenInstance, "balance:", hre.ethers.utils.formatEther(await tokenInstance.balanceOf(payee)));
//         const account = hre.ethers.constants.AddressZero;
//         const probeA = abiEncode(["uint"],[1]);
//         const probeB = abiEncode(["uint"],[2]);
 
//         for (let i = 0; i<100; i++){
//             let probedSlot = hre.ethers.utils.keccak256(abiEncode(["address","uint"], [account, i]));
//             while(probedSlot.startsWith("0x0")){
//                 probedSlot = "0x" + probedSlot.slice(3);
//             }
//             const prev = await hre.ethers.provider.send("eth_getStorageAt", [tokenAddress, probedSlot, "latest"]);
//             const probe = prev === probeA ? probeB: probeA;
//             await hre.ethers.provider.send("hardhat_setStorageAt", [tokenAddress,probedSlot, probe,]);
//             const balance =await token.balanceOf(account);
//             await hre.ethers.provider.send("hardhat_setStorageAt", [tokenAddress,probedSlot, prev,]);
//             if (balance.eq(hre.ethers.BigNumber.from(probe))){
//                 // console.log("Location is ", i);
//                 let accountSlotLocation = hre.ethers.utils.keccak256(
//                     abiEncode(["address", "uint"], [payee, i])
//                 );
//                 while (accountSlotLocation.startsWith("0x0")) {
//                     accountSlotLocation = "0x" + accountSlotLocation.slice(3);
//                 }
//                 await hre.ethers.provider.send("hardhat_setStorageAt", [
//                     tokenAddress,
//                     accountSlotLocation,
//                     slotValue,
//                   ]);
//                 break;
//             }
//             if (i === 99) {
//                 throw `Balances slot not found for ${tokenAddress}`;
//             }
//         }
//         console.log(token, "balance:", hre.ethers.utils.formatEther(await token.balanceOf(payee)));        
//     }
// );