import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const geistSans = Geist({
   variable: '--font-geist-sans',
   subsets: ['latin'],
});

const geistMono = Geist_Mono({
   variable: '--font-geist-mono',
   subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pockit.vercel.app';

export const metadata: Metadata = {
   metadataBase: new URL(siteUrl),
   title: {
      template: '%s | PocKit',
      default: 'PocKit — Pocket Project Management Toolkit',
   },
   description:
      'PocKit — a pocket-sized project management toolkit. Plan projects, track tasks on kanban boards, keep personal to-dos and team conversations together with a modern, responsive UI built on Next.js and shadcn/ui.',
   openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteUrl,
      siteName: 'PocKit',
      images: [
         {
            url: `${siteUrl}/banner.png`,
            width: 2560,
            height: 1440,
            alt: 'PocKit — Pocket Project Management Toolkit',
         },
      ],
   },
   twitter: {
      card: 'summary_large_image',
      images: [
         {
            url: `${siteUrl}/banner.png`,
            width: 2560,
            height: 1440,
            alt: 'PocKit — Pocket Project Management Toolkit',
         },
      ],
   },
   keywords: ['pockit', 'project management', 'kanban', 'tasks', 'nextjs', 'toolkit'],
};

import { ThemeProvider } from '@/components/layout/theme-provider';

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en" suppressHydrationWarning>
         <head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
         </head>
         <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
               {children}
               <Toaster />
            </ThemeProvider>
         </body>
      </html>
   );
}
