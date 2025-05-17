export const metadata = {
  title: 'OBS Pokepaste Browser Source',
  description: 'Display Pokémon teams from pokepast.es in OBS',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}