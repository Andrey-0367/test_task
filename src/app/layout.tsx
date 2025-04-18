import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './global.css';
import ReduxProviders from '@/store/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Products SPA',
  description: 'Test task for products management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProviders>
          {children}
        </ReduxProviders>
      </body>
    </html>
  );
}