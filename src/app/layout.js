import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://mywedding-woad.vercel.app"),
  title: "Axel & Améline | Notre mariage",
  description:
    "Nous nous marions le 14 novembre 2026. Retrouvez toutes les infos et confirmez votre présence.",
  openGraph: {
    title: "Axel & Améline | Notre mariage",
    description:
      "Nous nous marions le 14 novembre 2026. Retrouvez toutes les infos et confirmez votre présence.",
    url: "/",
    siteName: "Axel & Améline",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-invitation.jpg",
        width: 1200,
        height: 630,
        alt: "Axel et Améline",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
