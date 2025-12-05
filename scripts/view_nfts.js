const hre = require("hardhat");

// ★デプロイ時に表示されたコントラクトアドレスをここに貼ってください
const CONTRACT_ADDRESS = "0x922D6956C99E12DFeB3224DEA977D0939758A1Fe";

async function main() {
  // 1. コントラクトに接続
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const nft = MyNFT.attach(CONTRACT_ADDRESS);

  console.log("🔍 ブロックチェーン上のデータを検索中...\n");
  console.log("--------------------------------------------------");

  // ID 1から順番に検索していく（エラーが出るまで無限ループ）
  for (let i = 1; ; i++) {
    try {
      // 2. まず所有者を確認（存在しないIDならここでエラーになりループ終了）
      const owner = await nft.ownerOf(i);

      // 3. 独自のデータ（名前、作者、CID）を取得
      // コントラクトの getPhotoInfo 関数を呼び出す
      const [name, author, cid] = await nft.getPhotoInfo(i);

      // 4. ターミナルに表示
      console.log(`🆔 Token ID : ${i}`);
      console.log(`📛 Name     : ${name}`);
      console.log(`👤 Author   : ${author}`);
      console.log(`💎 Owner    : ${owner}`);
      console.log(`📦 IPFS CID : ${cid}`);
      
      console.log(""); // 空行
      console.log(`   👉 画像を見るコマンド:`);
      console.log(`   ipfs cat ${cid} > image_${i}.png`); // 便利機能として表示
      
      console.log("--------------------------------------------------");

    } catch (error) {
      // 所有者が取得できない＝これ以上NFTがないと判断して終了
      // console.log(error); // デバッグ用
      console.log("✅ 全データの取得が完了しました。");
      break; 
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});