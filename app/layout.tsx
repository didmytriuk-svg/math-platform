import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-math',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VOLYA ACADEMY — Матеріали для викладачів математики 5–11 класів',
  description:
    'Готові презентації, інтерактивні HTML5-ігри, самостійні та контрольні роботи з математики для вчителів і репетиторів.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-[#F7F9FD] text-[#0D1117] antialiased flex flex-col font-sans selection:bg-[#1E56FF] selection:text-white">
        <Header />
        <main className="grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}