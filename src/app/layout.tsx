import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hostal Don Tito - Tu hogar en Izalco, Sonsonate',
  description: 'Sistema de reservas online del Hostal Don Tito en Izalco, Sonsonate. Reserva tu habitación de forma fácil y segura.',
  keywords: 'hostal, Izalco, Sonsonate, reservas, alojamiento, El Salvador, turismo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
