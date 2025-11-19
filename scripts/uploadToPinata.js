import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const PINATA_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyYWUwOTQ0Ny1mNDMyLTRjNjQtOTEzOC1lMDZlYzJkMDcxNGEiLCJlbWFpbCI6Im1pc2hyYXlhc2g2Mzg2NzhAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImUwYmI2N2VlYTBhMGU1NmU1Y2FkIiwic2NvcGVkS2V5U2VjcmV0IjoiN2I1MTM2MWU3MDNhZDBmMDYyNzExNGZlYTM1ZGQyZDhiNjU5N2NjNWZkNzE2M2E1YTQ1Yzg3NmQxOGRmNGY1ZSIsImV4cCI6MTc5Mzg3NjMxOH0.UjomMYMrU2iIobEf6ZHCjrsK0N7b_Sn37NehOyU2RhQ";

async function uploadToPinata() {
  const filePath = "./artworks/sample.jpg"; // place an image in this path
  const data = new FormData();

  data.append("file", fs.createReadStream(filePath));

  const metadata = JSON.stringify({
    name: "Mona Lisa Digital",
    keyvalues: {
      artist: "Leonardo da Vinci",
      year: "1503",
    },
  });

  data.append("pinataMetadata", metadata);

  const options = JSON.stringify({
    cidVersion: 1,
  });

  data.append("pinataOptions", options);

  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data,
      {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      }
    );

    console.log("✅ File uploaded successfully!");
    console.log("CID:", res.data.IpfsHash);
    console.log(
      `🔗 View at: https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`
    );
  } catch (error) {
    console.error("❌ Upload failed:", error.response?.data || error.message);
  }
}

uploadToPinata();
