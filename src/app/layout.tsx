import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "./Provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlumUnity",
  description: "Connecting Alumni and Students",
  icons:{
    icon:"./favicon_logoai/favicon.ico",
    apple:"./favicon_logoai/apple-touch-icon.png",
    other:[
      { rel:"icon", url:"./favicon_logoai/favicon.ico" },
      { rel:"apple-touch-icon", url:"./favicon_logoai/apple-touch-icon.png" }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider>
          <Toaster/>
          {children}
        </Provider>
      </body>
    </html>
  );
}
