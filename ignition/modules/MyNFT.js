const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MyNFTModule", (m) => {
  // "MyNFT" という名前のコントラクトをデプロイする定義
  const nft = m.contract("MyNFT");

  // デプロイ結果を返す
  return { nft };
});