const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ★再デプロイ後の新しいアドレスに書き換えてください
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// 画像フォルダ
const ASSETS_DIR = path.join(__dirname, "../hashlips_art_engine-main/build/images");

// 作者名（共通と仮定。個別にするならファイル名などから生成）
const AUTHOR_NAME = "Taro Yamada";

// IPFSアップロード関数（画像のみ使用）
function uploadToIPFS(filePath) {
  try {
    const cid = execSync(`ipfs add -Q "${filePath}"`).toString().trim();
    return cid;
  } catch (error) {
    console.error(`❌ IPFS Error: ${error.message}`);
    process.exit(1);
  }
}

async function main() {
  console.log("🤖 オンチェーン保存型NFTの発行を開始します...\n");

  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const nft = MyNFT.attach(CONTRACT_ADDRESS);
  const [owner] = await hre.ethers.getSigners();

  const files = fs.readdirSync(ASSETS_DIR).filter(file => file.endsWith(".png") || file.endsWith(".jpg"));

  for (const [index, file] of files.entries()) {
    const filePath = path.join(ASSETS_DIR, file);
    const currentId = index + 1;
    
    console.log(`[${currentId}/${files.length}] 画像: ${file}`);

    // 1. 画像をIPFSへ (JSONは作らない)
    const imageCid = uploadToIPFS(filePath);
    console.log(`   📸 Image CID: ${imageCid}`);

    // 2. ブロックチェーンに「名前」「作者」「CID」を直接書き込む
    const nftName = `My Photo #${currentId}`;
    
    process.stdout.write("   ⏳ Writing to Blockchain... ");
    
    // ★ここで新しい mintPhoto 関数を呼び出す
    const tx = await nft.mintPhoto(
        owner.address, 
        nftName,      // 名前
        AUTHOR_NAME,  // 作者
        imageCid      // CID
    );
    
    await tx.wait();
    console.log("✅ Done!\n");
  }

  console.log("🎉 完了しました。データはブロックチェーン上に直接保存されました。");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});