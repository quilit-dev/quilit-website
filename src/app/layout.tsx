import type { Metadata } from "next";
import { Inter, Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/* Instrument Sans carries the whole UI — confident, tight, modern grotesque.
   Instrument Serif appears only as italic accent words inside headlines.
   JetBrains Mono is reserved for figures, codes and eyebrow labels. */
const sans = Instrument_Sans({
  variable: "--font-sans-var",
  subsets: ["latin"],
  display: "swap",
});

const serif = Instrument_Serif({
  variable: "--font-serif-var",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-var",
  subsets: ["latin"],
  display: "swap",
});

/* Inter is the ERP's own UI face. It is loaded only so the embedded product
   demo can render in the application's real typeface rather than the site's —
   nothing outside `.erp` uses it. */
const erpSans = Inter({
  variable: "--font-erp-var",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quilit ERP — Everything your business runs on, in one system",
  description:
    "Quilit ERP connects quotations, POS, inventory, manufacturing, double-entry accounting, HR and payroll into one platform — offline on your own hardware or hosted in the cloud. Licensed per module, customisable to your operation.",
  openGraph: {
    title: "Quilit ERP — Everything your business runs on",
    description:
      "One system for sales, stock, production, accounting and people. Offline or cloud, licensed per module, built around how you work.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${mono.variable} ${erpSans.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
