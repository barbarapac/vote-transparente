import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Vote Transparente — Pesquise candidatos com dados oficiais",
  description: "Pesquise candidatos e tome uma decisão de voto informada com base em dados oficiais do governo brasileiro.",
  icons: {
    icon: '/logo-sem-fundo.png',
    apple: '/logo-sem-fundo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-white">{children}</body>
    </html>
  );
}
