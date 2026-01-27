import { QRCodeCanvas } from "qrcode.react";

export default function QrGenerator({ cid }) {
  const verifyURL = `${window.location.origin}/verify?cid=${cid}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <QRCodeCanvas
        value={verifyURL}
        size={150}
        bgColor="#0f0d0a"
        fgColor="#e4d09c"
        level="H"
        includeMargin={true}
      />

      <a
        href={document.querySelector("canvas")?.toDataURL()}
        download="vericart-qr.png"
        className="text-xs bg-[#1a1813] text-[#e4d09c] px-3 py-1 rounded border border-[#2c2a23]"
      >
        Download QR
      </a>
    </div>
  );
}
