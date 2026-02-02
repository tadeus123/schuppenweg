import type { Metadata } from "next";
import { Space_Grotesk, Inter, Outfit } from "next/font/google";
import { OrderProvider } from "@/lib/context/order-context";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Schuppenweg | 30 Tage. Schuppenfrei. Mann.",
  description:
    "Schluss mit Schuppen in 30 Tagen. Keine Arztbesuche, keine Verwirrung. Lade 5 Fotos hoch, wir erledigen den Rest.",
  keywords: [
    "Schuppen",
    "Schuppenweg",
    "Kopfhaut",
    "Männer",
    "Behandlung",
    "30 Tage",
    "Deutschland",
  ],
  authors: [{ name: "Schuppenweg" }],
  openGraph: {
    title: "Schuppenweg | 30 Tage. Schuppenfrei. Mann.",
    description:
      "Schluss mit Schuppen in 30 Tagen. Keine Arztbesuche, keine Verwirrung.",
    locale: "de_DE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" data-scroll-behavior="smooth">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${outfit.variable} antialiased`}
      >
        <OrderProvider>
          {children}
        </OrderProvider>
      </body>
    </html>
  );
}
