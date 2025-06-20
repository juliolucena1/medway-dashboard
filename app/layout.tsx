import './globals.css'

export const metadata = {
  title: 'MEDWAY Analytics - Dashboard',
  description: 'Sistema de monitoramento',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
