import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/header/page";
import Navbar from "./components/navbar/page";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Collpoll",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen overflow-hidden flex justify-between`}
      >
        <div className="w-[17%] h-full bg-[#43C17A]">
          <Navbar />
        </div>

        <div className="flex flex-col w-[83%] h-full">
          <div className="h-[13%] flex justify-end bg-[#F4F4F4]">
            <Header />
          </div>

          <div className="h-[87%] overflow-auto bg-[#F4F4F4]">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
