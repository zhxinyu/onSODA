import {accountAddresses} from "./config/accountAddress";
import dotenv from "dotenv";
declare let ethers: any;
dotenv.config();
async function accountQuery(){
    const accounts = await ethers.getSigners();
    accounts.forEach((element: typeof accounts[0]) => {
        console.log(element.address);
    }
    );
}
// process.env.PRIVATE_KEY0
// process.env.PRIVATE_KEY1

// interface TransactionType {
//     to: string;
//     from: string;
//     nonce: ethers.number;
//     data: ethers.DataHexString;
//     value: ethers.BigNumber;
//     gasLimit?: ethers.BigNumber;
//     gasPrice?: ethers.BigNumber;
//     maxFeePerGas?: ethers.BigNumber;
//     maxPriorityFeePerGas?: ethers.BigNumber
// }

async function sendTransaction(){
    const payer = accountAddresses[0];
    const payerCurrentBalance = ethers.utils.formatEther(await ethers.provider.getBalance(payer));
    const payee = accountAddresses[1];
    const payeeCurrentBalance = ethers.utils.formatEther(await ethers.provider.getBalance(payee));
    console.log("Payer current balance", payerCurrentBalance, "ETH");
    console.log("Payee current balance", payeeCurrentBalance, "ETH");
    const currGasPrice = await ethers.provider.getGasPrice();
    console.log("Current gas price: ", ethers.utils.formatUnits(currGasPrice,'gwei'), "GWei");
    
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY0, ethers.provider);

    const tx = {
        from: payer,
        to: payee,
        value: ethers.utils.parseEther("100"),
        nonce: ethers.provider.getTransactionCount(payer, "latest"),
        gasLimit: ethers.BigNumber.from("21000"), 
        // gasPrice: ethers.utils.parseUnits("0.5", "finney"),
        maxPriorityFeePerGas: ethers.utils.parseUnits("0.5", "finney"),
        maxFeePerGas: ethers.utils.parseUnits("2.0", "finney"),
        // data: ethers.utils.hexlify(ethers.utils.toUtf8Bytes("EthanZ's first transaction data info.!")),//43 bytes *16 wei/byte ->688  wei
    }

    console.log("Current block is ", await ethers.provider.getBlockNumber());

    console.log(await wallet.call(tx));

    const txResponse = await wallet.sendTransaction(tx);
    console.log(txResponse);

    console.log(txResponse.blockNumber, txResponse.blockHash, txResponse.timestamp, txResponse.confirmations, txResponse.raw);
    const txReceipt = await txResponse.wait();
    console.log(txReceipt);

    console.log(await wallet.call(tx));

    console.log("Now Payer current balance", ethers.utils.formatEther(await ethers.provider.getBalance(payer)), "ETH");
    console.log("Now Payee current balance", ethers.utils.formatEther(await ethers.provider.getBalance(payee)), "ETH");

    console.log("Current block is ", await ethers.provider.getBlockNumber());

}

sendTransaction().catch((error) =>{
    console.error(error);
    process.exit(1);
});

// accountQuery().catch((error) =>{
//     console.error(error);
//     process.exit(1);
// });
