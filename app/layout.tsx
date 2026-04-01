import type { Metadata } from 'next';
import './globals.css';
import LenisProvider from './providers/LenisProvider';
import { Inter, Noto_Sans_JP } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansJp = Noto_Sans_JP({
  subsets: ['latin'], // google font loader上の制約でOK（日本語は自動で含まれる）
  variable: '--font-noto-jp',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'GSAP Playground',
    template: 'Chiakis | GSAP Playground',
  },
  description: 'Scroll-driven motion experiments built with Next.js + GSAP',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ja' className={`${inter.variable} ${notoSansJp.variable}`}>
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
