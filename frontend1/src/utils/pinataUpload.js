import axios from "axios";

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export const uploadFileToPinata = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  const res = await axios.post(url, formData, {
    maxBodyLength: "Infinity",
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
  });

  return `https://ipfs.io/ipfs/${res.data.IpfsHash}`;
};

export const uploadJSONToPinata = async (json) => {
  const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

  const res = await axios.post(url, json, {
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      "Content-Type": "application/json",
    },
  });

  return `https://ipfs.io/ipfs/${res.data.IpfsHash}`;
};
