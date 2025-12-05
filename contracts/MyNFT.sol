// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    // ★重要: あなたが保存したいデータ構造を定義
    struct PhotoData {
        string name;    // 作品名
        string author;  // 作者名
        string ipfsCid; // 画像のCID (直接保存)
    }

    // IDをキーにしてデータを保存する「辞書」
    mapping(uint256 => PhotoData) public photoLibrary;

    constructor() ERC721("MyDirectNFT", "MDNFT") Ownable(msg.sender) {
        // IDは1からスタートさせます
        _nextTokenId = 1;
    }

    // ★修正: JSONのURIではなく、データそのものを受け取る関数
    function mintPhoto(address to, string memory _name, string memory _author, string memory _cid) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        
        _safeMint(to, tokenId);
        
        // データをブロックチェーン上の辞書に書き込む
        photoLibrary[tokenId] = PhotoData({
            name: _name,
            author: _author,
            ipfsCid: _cid
        });
    }

    // データの取得用関数（Pythonなどから呼び出す用）
    function getPhotoInfo(uint256 tokenId) public view returns (string memory, string memory, string memory) {
        PhotoData memory data = photoLibrary[tokenId];
        return (data.name, data.author, data.ipfsCid);
    }
}