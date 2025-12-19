const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

// ★コントラクトアドレス
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// 画像フォルダ
const ASSETS_DIR = path.join(__dirname, "../hashlips_art_engine-main/build/images");

// ユーザー入力を受け付けるための設定
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 質問をして入力を待つヘルパー関数
function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// IPFSアップロード関数
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
  console.log("🤖 対話型NFT発行プログラムを起動します...\n");

  // 0. 準備
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const nft = MyNFT.attach(CONTRACT_ADDRESS);
  const [signer] = await hre.ethers.getSigners(); // デフォルトの実行者

  // 1. ファイル一覧を表示して選択させる
  const files = fs.readdirSync(ASSETS_DIR).filter(file => file.endsWith(".png") || file.endsWith(".jpg"));

  if (files.length === 0) {
    console.log("⚠️ assetsフォルダに画像が見つかりません。");
    rl.close();
    return;
  }

  console.log("📂 画像ファイル一覧:");
  files.forEach((file, index) => {
    console.log(`   [${index + 1}] ${file}`);
  });
  console.log(""); // 改行

  // ファイル番号の入力
  const fileIndexStr = await askQuestion("👉 NFTにしたい画像の番号を入力してください: ");
  const fileIndex = parseInt(fileIndexStr) - 1;

  if (isNaN(fileIndex) || fileIndex < 0 || fileIndex >= files.length) {
    console.log("❌ 無効な番号です。終了します。");
    rl.close();
    return;
  }

  const selectedFile = files[fileIndex];
  const filePath = path.join(ASSETS_DIR, selectedFile);
  console.log(`✅ 選択された画像: ${selectedFile}\n`);

  // 2. 作品情報の入力
  const nftName = await askQuestion("👉 作品名を入力してください (例: My Best Photo): ");
  if (!nftName) { console.log("❌ 名前は必須です"); rl.close(); return; }

  const authorName = await askQuestion(`👉 作者名を入力してください (Enterで "${"Taro Yamada"}" ): `);
  // 入力がなければデフォルト値を使う
  const finalAuthor = authorName.trim() === "" ? "Taro Yamada" : authorName;

  // 3. オーナー（送り先）の指定
  // デフォルトは自分（signer.address）にする
  console.log(`\n🔑 あなたのアドレス: ${signer.address}`);
  const ownerInput = await askQuestion("👉 オーナー(受取人)のアドレスを入力してください (Enterで自分宛): ");
  const finalOwner = ownerInput.trim() === "" ? signer.address : ownerInput;

  console.log("\n--------------------------------------------------");
  console.log(`📝 以下の内容で発行します:`);
  console.log(`   ファイル : ${selectedFile}`);
  console.log(`   作品名   : ${nftName}`);
  console.log(`   作者     : ${finalAuthor}`);
  console.log(`   オーナー : ${finalOwner}`);
  console.log("--------------------------------------------------");

  const confirm = await askQuestion("実行しますか？ (y/n): ");
  if (confirm.toLowerCase() !== "y") {
    console.log("キャンセルしました。");
    rl.close();
    return;
  }

  // 4. 実行処理
  console.log("\n🚀 処理を開始します...");

  // IPFSへアップロード
  console.log("   📸 Uploading to IPFS...");
  const imageCid = uploadToIPFS(filePath);
  console.log(`      CID: ${imageCid}`);

  // ブロックチェーンへ書き込み
  console.log("   ⏳ Minting NFT...");
  try {
    const tx = await nft.mintPhoto(
        finalOwner,   // 指定したオーナーへ送る
        nftName,      // 入力した作品名
        finalAuthor,  // 入力した作者名
        imageCid      // IPFSのCID
    );
    await tx.wait();
    console.log("\n🎉 NFTの発行が完了しました！");
  } catch (err) {
    console.error("\n❌ エラーが発生しました:", err.message);
  }

  rl.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});