import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/global.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lottery Smart Contract",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} h-screen w-screen flex flex-col justify-between items-center`}>
        <h1 className='text-center text-3xl font-bold py-4'>Lottery App Smart Contract</h1>
        <Providers>{children}</Providers>
        <footer className='text-center'>Version 1.0 Ⓒ Klever</footer>
      </body>
    </html>
  );
}
