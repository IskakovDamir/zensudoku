import type { Metadata } from 'next';
import { Onest } from 'next/font/google';
import './globals.css';

const onest = Onest({
  subsets: ['latin'],
  variable: '--font-onest',
});

export const metadata: Metadata = {
  title: 'ZenSudoku',
  description: 'A clean, distraction-free Sudoku experience',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${onest.variable} font-sans bg-zinc-950 text-zinc-100 antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
