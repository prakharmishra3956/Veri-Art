// import { NFTStorage, File } from "nft.storage";
// import fs from "fs";
// import mime from "mime";
// import dotenv from "dotenv";

// dotenv.config();

// const API_KEY = process.env.NFT_STORAGE_API_KEY;

// async function main() {
//   if (!API_KEY) {
//     console.error("❌ NFT_STORAGE_API_KEY not found in environment variables");
//     return;
//   }

//   const client = new NFTStorage({ token: API_KEY });
//   const filePath = "./artworks/sample.jpg";

//   try {
//     const content = await fs.promises.readFile(filePath);
//     if (content.length === 0) {
//       console.error(
//         "❌ The sample.jpg file is empty. Please add image content to the file."
//       );
//       return;
//     }
//     const type = mime.getType(filePath);

//     const file = new File([content], "sample.jpg", { type });
//     const cid = await client.storeBlob(file);

//     console.log(`✅ Uploaded to IPFS: https://ipfs.io/ipfs/${cid}`);
//   } catch (error) {
//     console.error("❌ Upload failed:", error.message);
//   }
// }

// main();
import pinataSDK from "@pinata/sdk";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

async function main() {
  const filePath = "./artworks/sample.jpg";

  try {
    const stream = fs.createReadStream(filePath);
    const options = {
      pinataMetadata: {
        name: "sample.jpg",
      },
    };
    const result = await pinata.pinFileToIPFS(stream, options);
    console.log(
      `✅ Uploaded to IPFS via Pinata: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    );
  } catch (error) {
    console.error("❌ Upload failed:", error.message);
  }
}

main();
