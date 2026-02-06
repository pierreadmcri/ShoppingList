import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MaCourseList - Liste de courses intelligente',
  description: 'Gérez vos courses simplement. Ajoutez des articles, validez en direct et retrouvez vos achats fréquents.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
