"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Copy, Share2 } from "lucide-react";

export default function ShareLink({ path }) {
  const [origin, setOrigin] = useState("");
  const fullUrl = useMemo(() => (origin ? `${origin}${path.startsWith("/") ? path : `/${path}`}` : ""), [origin, path]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const copyToClipboard = async () => {
    if (!fullUrl) return;
    try {
      await navigator.clipboard.writeText(fullUrl);
      alert("Link copied to clipboard");
    } catch (_) {}
  };

  const openShare = (href) => {
    if (!fullUrl) return;
    const w = 600, h = 540;
    const y = window.top.outerHeight / 2 + window.top.screenY - h / 2;
    const x = window.top.outerWidth / 2 + window.top.screenX - w / 2;
    window.open(href, "share", `width=${w},height=${h},top=${y},left=${x}`);
  };

  const shares = [
    { label: "WhatsApp", build: (u) => `https://wa.me/?text=${encodeURIComponent(u)}` },
    { label: "X", build: (u) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}` },
    { label: "Telegram", build: (u) => `https://t.me/share/url?url=${encodeURIComponent(u)}` },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={copyToClipboard}>
        <Copy className="w-4 h-4 mr-2" /> Copy
      </Button>
      {shares.map((s) => (
        <Button key={s.label} variant="outline" onClick={() => openShare(s.build(fullUrl))}>
          <Share2 className="w-4 h-4 mr-2" /> {s.label}
        </Button>
      ))}
      <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="inline-flex">
        <Button variant="outline">
          <Link2 className="w-4 h-4 mr-2" /> Open
        </Button>
      </a>
    </div>
  );
}


