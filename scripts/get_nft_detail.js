const hre = require("hardhat");
const readline = require("readline");

// ★コントラクトアドレス
const CONTRACT_ADDRESS = "0x922D6956C99E12DFeB3224DEA977D0939758A1Fe";

// 入力受付の設定
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const nft = MyNFT.attach(CONTRACT_ADDRESS);

  console.log("🔍 NFT詳細検索プログラム");
  console.log("--------------------------------------------------");

  // 1. IDの入力を求める
  const inputId = await askQuestion("👉 詳細を見たい作品のIDを入力してください: ");
  const tokenId = parseInt(inputId);

  // 数値チェック
  if (isNaN(tokenId)) {
    console.log("\n❌ エラー: 半角数字でIDを入力してください。");
    rl.close();
    return;
  }

  console.log(`\n🔄 ID: ${tokenId} をブロックチェーンから検索中...`);

  try {
    // 2. 所有者を取得（存在しないIDの場合はここでエラーになり catch ブロックへ）
    const owner = await nft.ownerOf(tokenId);

    // 3. 独自のデータ（名前、作者、CID）を取得
    const [name, author, cid] = await nft.getPhotoInfo(tokenId);

    // 4. 結果を見やすく表示
    console.log("\n✅ データが見つかりました！");
    console.log("==================================================");
    console.log(`🆔 作品ID   : ${tokenId}`);
    console.log(`📛 作品名   : ${name}`);
    console.log(`👤 作者     : ${author}`);
    console.log(`🔑 オーナー : ${owner}`);
    console.log(`📦 画像CID  : ${cid}`);
    console.log("==================================================");

    // おまけ：画像を表示するためのコマンド例
    console.log(`\n💡 ターミナルで画像を表示/保存するコマンド:`);
    console.log(`   ipfs cat ${cid} > output_${tokenId}.jpg`);

  } catch (error) {
    // エラーの内容によってメッセージを変える
    if (error.message.includes("ERC721NonexistentToken") || error.message.includes("invalid token ID")) {
        console.log(`\n❌ エラー: ID ${tokenId} の作品は存在しません。`);
    } else {
        console.log(`\n❌ エラーが発生しました: ${error.message}`);
    }
  }

  rl.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});