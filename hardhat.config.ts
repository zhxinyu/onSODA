/** @type import('hardhat/config').HardhatUserConfig */
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";

require("dotenv").config();
const alchemyUrl = process.env.ALCHEMY_URL;
const blockNum = process.env.BLOCK_NUM ? parseInt(process.env.BLOCK_NUM):0;
// import fs from "fs";
// import path from "path";
// {
//     let tasksPath = path.join(__dirname, "tasks"); 
//     fs.readdirSync(tasksPath)
//     .filter((pth) => pth.includes(".ts") || pth.includes(".js"))
//     .forEach((task) => {
//         require(`${tasksPath}/${task}`);
//     });
// }
  
export default {
    solidity:"0.8.10",
    networks:{
        hardhat:{
            forking: {
                url: alchemyUrl,
                blockNumber: blockNum
            }
        }
    },
};
