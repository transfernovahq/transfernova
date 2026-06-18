import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TransferNova - Rumores y Fichajes de Fútbol en Tiempo Real",
  description: "Los últimos rumores, fichajes y traspasos del fútbol mundial. Actualizado en tiempo real con las noticias más recientes del mercado de fichajes.",
  keywords: "fichajes fútbol, rumores fichajes, mercado fichajes, traspasos fútbol, noticias fichajes",
  openGraph: {
    title: "TransferNova - Rumores y Fichajes de Fútbol",
    description: "Los últimos rumores y fichajes del fútbol en tiempo real",
    url: "https://gettransfernova.com",
    siteName: "TransferNova",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <GoogleAnalytics gaId="G-RYPC3RXRZD" />
      </body>
    </html>
  );
}