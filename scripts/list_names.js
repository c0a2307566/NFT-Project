const hre = require("hardhat");

// ★現在使用している最新のコントラクトアドレスに書き換えてください
const CONTRACT_ADDRESS = "0x922D6956C99E12DFeB3224DEA977D0939758A1Fe";

async function main() {
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const nft = MyNFT.attach(CONTRACT_ADDRESS);

  console.log("📜 ブロックチェーン上の作品名一覧を取得しています...\n");
  console.log("ID | 作品名");
  console.log("---|--------------------------------");

  let count = 0;

  // ID 1から順に、エラーが出る（存在しなくなる）までループ
  for (let i = 1; ; i++) {
    try {
      // 1. まず存在確認（所有者が取得できなければエラーになるためcatchへ飛ぶ）
      await nft.ownerOf(i);

      // 2. データを取得
      // getPhotoInfoは [name, author, cid] を返すが、name だけ取り出す
      const [name] = await nft.getPhotoInfo(i);

      // 3. 表示
      // 見やすく整形して表示
      console.log(`${String(i).padEnd(2)} | ${name}`);
      
      count++;

    } catch (error) {
      // 次のIDが見つからなければ終了
      break; 
    }
  }

  if (count === 0) {
    console.log("\n⚠️ 作品はまだ登録されていません。");
  } else {
    console.log(`\n✅ 合計 ${count} 作品が見つかりました。`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});