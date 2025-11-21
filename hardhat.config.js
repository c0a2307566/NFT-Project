require("@nomicfoundation/hardhat-toolbox");

const HOST_IP = "127.0.0.1";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24", // Hardhat 2.26.0 の標準コンパイラ
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: `http://${HOST_IP}:8545`,
      chainId: 31337,
    },
  },
};