import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Naykama AI — Your AI Business Employee",
    short_name: "Naykama AI",
    description:
      "Naykama AI answers customers, books appointments, creates invoices, manages inventory, and works 24/7.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#070912",
    theme_color: "#4f46e5",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    shortcuts: [
      { name: "AI Assistant", url: "/dashboard/chat" },
      { name: "Inbox", url: "/dashboard/inbox" },
      { name: "New Invoice", url: "/dashboard/invoices" },
    ],
  };
}
