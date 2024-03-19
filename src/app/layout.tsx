import '@/styles/globals.css';

import { Inter } from 'next/font/google';

import { TRPCReactProvider } from '@/trpc/react';
import { AI } from './action';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'saga',
  description: 'Your right hand content man',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="fixed top-0 w-full overflow-y-hidden"
    >
      <body className={`font-sans ${inter.variable} w-full`}>
        <AI>
          <TRPCReactProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </TRPCReactProvider>
        </AI>
      </body>
    </html>
  );
}
