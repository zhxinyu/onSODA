import {expect} from "chai";
import {HardhatRuntimeEnvironment } from "hardhat/types";
import { reserveAddresses, ATokenAddresses, getERC20, abiEncode} from "../config/reserveAddress";
import {MAX_UINT_AMOUNT} from "../config/constants";


declare let hre: HardhatRuntimeEnvironment;

let ethers = hre.ethers; 

describe("dispatcher.sol", async ()=>{
    let contractFactory;
    let contract: any;
    let payerAddress: string;
    let tokenAddress: string;
    let poolAddress: string;
    let amount: any;
    const tokenName = "WMATIC";
    let token:any;
    before(async ()=> {
        payerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
        tokenAddress = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
        poolAddress = "0x794a61358D6845594F94dc1DB02A252b5b4814aD";

        contractFactory = await ethers.getContractFactory("OrderDispatcher");
        contract = await contractFactory.deploy();
        token = await getERC20(reserveAddresses[tokenName]);
        amount = ethers.utils.formatEther(await token.balanceOf(payerAddress));        
    });

    describe("Put", ()=>{
        it ("", async ()=>{
            const putAmount = ethers.utils.parseEther("1");
            const contractSigner = await contract.connect((await ethers.getSigners())[0]);
            expect(await contractSigner.balanceOf(payerAddress)).to.equal(ethers.utils.parseEther("0"));
            await (await contractSigner.put({value:putAmount})).wait();
            expect(await contractSigner.balanceOf(payerAddress)).to.equal(putAmount);
            await expect(contractSigner.put({value: ethers.utils.parseEther("100000")})).to.be.revertedWith("Not Enough fund");
        })

    });

    describe("Supply and Borrow", () => {
        it("", async () => { 
            const depositAmount = ethers.utils.parseEther("1");
            console.log("Before submitOrder:", amount);
            console.log(ethers.utils.formatUnits(await ethers.provider.getBalance(payerAddress)));

            const contractSigner = await contract.connect((await ethers.getSigners())[0]);
            await (await token.approve(contractSigner.address, "0")).wait();
            await (await token.approve(contractSigner.address, MAX_UINT_AMOUNT)).wait();

            await (await contractSigner.submitOrder(poolAddress, tokenAddress, depositAmount, payerAddress)).wait();

            amount = ethers.utils.formatEther(await token.balanceOf(payerAddress));                    
            console.log("After submitOrder:", amount);
        }
        )
        it ("More than expected",async ()=> {
            const depositAmount = ethers.utils.parseEther("20000000000000000000000");
            const contractSigner = await contract.connect((await ethers.getSigners())[0]);
            await (await token.approve(contractSigner.address, "0")).wait();
            await (await token.approve(contractSigner.address, MAX_UINT_AMOUNT)).wait();
            await expect(contractSigner.submitOrder(poolAddress, tokenAddress, depositAmount, payerAddress)).to.be.revertedWith("Not Enough fund");
        })

    });

    describe("getNumTransactions", () => {
        it("Initial State", async () => { 
            const contractSigner = await contract.connect((await ethers.getSigners())[0]);
            expect(await contractSigner.getNumTransactions()).to.be.equal(0);
        }
        )
    });    

    describe("getTokenAddress", () => {
        it("First token", async () => { 
            const contractSigner = await contract.connect((await ethers.getSigners())[0]);
            expect(await contractSigner.getTokenAddress(0)).to.be.equal("0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063");
        }
        )
    });    

    describe("getTokenDecimals", () => {
        it("DAI", async () => { 
            const contractSigner = await contract.connect((await ethers.getSigners())[0]);
            expect(await contractSigner.getTokenDecimals("0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063")).to.be.equal(18);
        }
        )
    });    

    describe("ParseOrder", () => {
        it("", async () => { 
            const contractSigner = await contract.connect((await ethers.getSigners())[0]);
            let compressedOrder = "11,1,1,11,4.3,2,5,16.44,1,1,11,4.3,2,5,16.44,1,1,11,4.3,2,5,16.44,1,1,11,4.3,2,5,16.44,1,1,11,4.3,2,5,16.44,1,1,11,4.3,2,5,16.44,1,1,11,4.3,2,5,16.44,1,1,11,4.3,2,5,16.44,1,1,11,4.3,2,5,16.44,1,1,11,4.3,2,5,16.44,1,1,11,4.3,2,5,16.44";
            await (await contractSigner.parseOrder(compressedOrder)).wait();      
            expect(await contractSigner.getNumTransactions()).to.be.equal(11);
            expect(await contractSigner.getSubLengths()).deep.equal(Array(11).fill(ethers.utils.parseUnits("1",0)));
            expect(await contractSigner.getTransactionTypes()).deep.equal(Array(11).fill([1,2]).flat());
            expect(await contractSigner.getTokens()).deep.equal(Array(11).fill([11,5]).flat());
            expect(await contractSigner.getQuantites()).deep.equal(Array(11).fill([ethers.utils.parseUnits("4.3",18),ethers.utils.parseUnits("16.44",6)]).flat());

        }
        )
    });    

    
})