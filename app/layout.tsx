import type { Metadata } from "next";
import { Unbounded, Plus_Jakarta_Sans, Fira_Code } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-unbounded",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "cyrillic-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Volya Academy — Матеріали для викладачів математики",
  description:
    "Готові презентації, ігри, самостійні та контрольні роботи з математики 5–11 класів.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${unbounded.variable} ${jakarta.variable} ${firaCode.variable}`}
    >
      <body className="min-h-screen bg-[#F7F9FD] text-[#0D1117] font-sans antialiased selection:bg-[#1E56FF] selection:text-white">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}