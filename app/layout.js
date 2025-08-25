import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/header";
import CreateEventDrawer from "@/components/create-event";
import BookingDrawer from "@/components/booking-drawer";

const inter = Inter({ subsets: ["latin"] });

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata = {
  title: "Mischief Meet",
  description: "Where connections happen",
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: "website",
    siteName: "Mischief Meet",
    url: baseUrl,
    images: [
      {
        url: "/poster.png",
        width: 1200,
        height: 630,
        alt: "Mischief Meet",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mischiefmeet",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Header />
          <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {children}
          </main>
          
          <CreateEventDrawer />
          <BookingDrawer />
        </body>
      </html>
    </ClerkProvider>
  );
}
