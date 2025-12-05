const hre = require("hardhat");

async function main() {
  // 1. デプロイ時に表示されたアドレス
  // (もし違うアドレスが表示されていた場合は書き換えてください)
  const CONTRACT_ADDRESS = "0x922D6956C99E12DFeB3224DEA977D0939758A1Fe";

  // 2. さきほど取得した MetadataCID (埋め込み済み)
  const TOKEN_URI = "ipfs://QmdMmf5ymedyQwrTyvCbqWmmPuDNK6qACrvA3ZtuAhDpXm";

  console.log("🚀 ミントを開始します...");

  // コントラクトに接続
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const nft = MyNFT.attach(CONTRACT_ADDRESS);

  // 自分自身のアドレスを取得
  const [owner] = await hre.ethers.getSigners();

  // NFTを発行！
  const tx = await nft.safeMint(owner.address, TOKEN_URI);
  await tx.wait();

  console.log(`🎉 NFT Minted!`);
  console.log(`To:  ${owner.address}`);
  console.log(`URI: ${TOKEN_URI}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});