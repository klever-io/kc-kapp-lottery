import type { Metadata } from "next";
import { Inter,Manrope} from "next/font/google";
import "../styles/global.css";
import { Providers } from "./providers";

const manrope = Manrope({ subsets: ["latin"] });

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
      <body className={`${manrope.className} h-screen w-screen flex flex-col justify-between items-center`}>

          <h1 className='text-center text-3xl font-bold py-4'>Lottery Klever Smart Contract</h1>
          <Providers>{children}</Providers>
          <footer className='text-center '>© 2024 — Copyright - Klever - version 1.0.0</footer>
      </body>
    </html>
  );
}
