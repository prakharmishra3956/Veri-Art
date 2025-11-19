import axios from "axios";

export const uploadToIPFS = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: { type: "artwork" },
  });

  formData.append("pinataMetadata", metadata);
  formData.append("pinataOptions", '{"cidVersion": 1}');

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      maxBodyLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
        Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
      },
    }
  );

  return res.data.IpfsHash; // returns CID
};
