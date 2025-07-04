import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meteo Italia | Confronta le previsioni meteorologiche",
  description: "Confronta le previsioni del tempo dai principali provider meteorologici italiani: 3B Meteo, Il Meteo, MeteoAM e Meteo.it. Previsioni affidabili per tutte le città d'Italia.",
  keywords: "meteo, previsioni, tempo, Italia, 3B Meteo, Il Meteo, MeteoAM, confronto",
  authors: [{ name: "Meteo Italia" }],
  creator: "Meteo Italia",
  publisher: "Meteo Italia",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://meteo-italia.vercel.app'),
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Meteo Italia',
  },
  openGraph: {
    title: "Meteo Italia | Confronta le previsioni meteorologiche",
    description: "Confronta le previsioni del tempo dai principali provider meteorologici italiani",
    url: "https://meteo-italia.vercel.app",
    siteName: "Meteo Italia",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Meteo Italia - Confronta le previsioni meteorologiche",
      },
    ],
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meteo Italia | Confronta le previsioni meteorologiche",
    description: "Confronta le previsioni del tempo dai principali provider meteorologici italiani",
    images: ["/api/og"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var shouldBeDark = theme === 'dark' || (!theme && prefersDark);
                  
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                    document.body.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.body.classList.remove('dark');
                  }
                } catch (e) {
                  console.error('Error setting initial theme:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
