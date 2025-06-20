import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MEDWAY Analytics | Dashboard Inteligente',
  description: 'Sistema Inteligente de Monitoramento Psicológico - MEDWAY Analytics v2.0',
  keywords: 'medway, analytics, psicologia, monitoramento, dashboard',
  authors: [{ name: 'MEDWAY Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
