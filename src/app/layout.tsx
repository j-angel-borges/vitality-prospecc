import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PwaRegister } from '@/components/PwaRegister';

export const viewport: Viewport = {
  themeColor: '#002244',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

export const metadata: Metadata = {
  title: 'Vitality ERP | Royal Prestige Central',
  description: 'Plataforma comercial y operativa de Vitality Royal Prestige.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Vitality ERP',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* Mobile App & PWA cross-browser meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-touch-fullscreen" content="yes" />
        
        {/* Prevent iOS Safari / Android auto telephone detection from corrupting layout */}
        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
      </head>
      <body className="font-body antialiased min-h-full h-full overscroll-none selection:bg-blue-600 selection:text-white">
        <ErrorBoundary fallbackTitle="Error en Vitality ERP">
          <FirebaseClientProvider>
            <PwaRegister />
            {children}
          </FirebaseClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
