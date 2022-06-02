const Moralis = require("moralis/node");
const fs = require("fs");
const util = require("util");
const { serverUrl, appId } = require("./secrets.json");

const snapshot = async () => {
  await Moralis.start({ serverUrl, appId });
  var nftOwners = null;

  const options = {
    address: "0xc175da1b577e3108164900f5231aef20d5e57a85",
    chain: "0x1",
  };

  const fetchNFTOwners = async () => {
    const singleOwners = new Map();

    nftOwners = await Moralis.Web3API.token.getNFTOwners(options);
    let totalEntries = nftOwners.page * 25;

    while (totalEntries < nftOwners.total) {
      for (let i = 0; i < nftOwners.page_size; i++) {
        if (nftOwners.result[i] != undefined) {
          if (!singleOwners.has(nftOwners.result[i].owner_of)) {
            singleOwners.set(nftOwners.result[i].owner_of, 1);
          } else {
            let newCount = singleOwners.get(nftOwners.result[i].owner_of) + 1;
            singleOwners.set(nftOwners.result[i].owner_of, newCount);
          }
        }
      }

      options.cursor = nftOwners.cursor;
      nftOwners = await Moralis.Web3API.token.getNFTOwners(options);
      totalEntries = nftOwners.page * 25;
    }

    const data = Object.fromEntries(singleOwners);
    fs.writeFileSync("./data.txt", util.inspect(data), "utf-8");
  };

  fetchNFTOwners();
};

snapshot();
