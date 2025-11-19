import fs from "fs";
import path from "path";
import pinataSDK from "@pinata/sdk";
import dotenv from "dotenv";

dotenv.config();

const pinata = new pinataSDK({
  pinataJWTKey: process.env.PINATA_JWT,
});

const IMAGE_CID =
  "Qmbafkreif7o7vr2cia7stetseg2uttyv7moioaq576npgybwuromgexkt4zy";

async function main() {
  const metadata = {
    name: "VeriArt: The Starry Night",
    description: "This is a verified artwork stored using VeriArt on IPFS.",
    image: `ipfs://${IMAGE_CID}`,
    artist: "Vincent van Gogh",
    attributes: [
      { trait_type: "Medium", value: "Oil on canvas" },
      { trait_type: "Year", value: "1889" },
      { trait_type: "Condition", value: "Excellent" },
    ],
  };

  // Save to local file
  const metadataPath = path.join("./artworks", "metadata.json");
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  try {
    const readableStream = fs.createReadStream(metadataPath);
    const result = await pinata.pinFileToIPFS(readableStream, {
      pinataMetadata: {
        name: "metadata.json",
      },
    });
    console.log("✅ Metadata uploaded to IPFS:");
    console.log(`https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
  } catch (error) {
    console.error("❌ Upload failed:", error.message);
  }
}

main();
