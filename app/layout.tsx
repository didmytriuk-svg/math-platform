import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Платформа матеріалів для викладачів математики",
  description: "Готові презентації, ігри, самостійні та контрольні роботи для викладання математики 5–11 класів.",
  metadataBase: new URL('https://my-platform.vercel.app'),
  openGraph: {
    title: "Платформа матеріалів для викладачів математики",
    description: "Готові презентації, ігри, самостійні та контрольні роботи для викладання математики.",
    url: 'https://my-platform.vercel.app',
    siteName: 'Овітня платформа',
    locale: 'uk_UA',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className="antialiased min-h-screen bg-white text-zinc-900">
        {children}
      </body>
    </html>
  );
}