"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type UpiQrProps = { upiId: string; amount: number };

export function UpiQr({ upiId, amount }: UpiQrProps) {
  const [source, setSource] = useState("");
  const cleanUpiId = upiId.trim();
  const payload = `upi://pay?pa=${encodeURIComponent(cleanUpiId)}&pn=${encodeURIComponent("Motion Mirage Studios")}&am=${amount.toFixed(2)}&cu=INR`;

  useEffect(() => {
    let active = true;
    if (!cleanUpiId || amount <= 0) {
      const timer = window.setTimeout(() => { if (active) setSource(""); }, 0);
      return () => { active = false; window.clearTimeout(timer); };
    }
    void QRCode.toDataURL(payload, { width: 132, margin: 1, errorCorrectionLevel: "M" }).then((url) => {
      if (active) setSource(url);
    });
    return () => { active = false; };
  }, [amount, cleanUpiId, payload]);

  if (!source) return null;
  return <div className="upi-qr"><img src={source} alt={`Scan to pay ${amount.toFixed(2)} INR via UPI`} /><span>Scan to pay via UPI</span><strong>{cleanUpiId}</strong></div>;
}
