import { Inter, Montserrat } from 'next/font/google'
import './globals.css'

// Load Montserrat font
const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata = {
  title: 'OBS Pokepaste Browser Source',
  description: 'Display Pokémon teams from pokepast.es in OBS',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable}`}>{children}</body>
    </html>
  )
}