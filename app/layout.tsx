import type { Metadata } from 'next';
import { Onest } from 'next/font/google';
import { Playfair_Display } from 'next/font/google';
import './globals.css';
import { PageTransition } from '@/components/PageTransition';
import { BottomNav } from '@/components/BottomNav';

const onest = Onest({ subsets: ['latin'], variable: '--font-onest' });
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'ZenSudoku',
  description: 'The Sudoku experience, reimagined.',
  openGraph: {
    title: 'ZenSudoku',
    description: 'The Sudoku experience, reimagined.',
    siteName: 'ZenSudoku',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <body
        className={`${onest.variable} ${playfair.variable} font-sans antialiased min-h-screen`}
      >
        <PageTransition>
          {children}
        </PageTransition>
        <BottomNav />
      </body>
    </html>
  );
}
