import axios from "axios";

export const uploadMetadataToIPFS = async (imageCID, name, description) => {
  const metadata = {
    name,
    description,
    image: `ipfs://${imageCID}`,
  };

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    metadata,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
      },
    }
  );

  return res.data.IpfsHash; // metadata CID
};
