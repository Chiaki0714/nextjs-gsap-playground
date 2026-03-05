import './globals.css';
import LenisProvider from './providers/LenisProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
