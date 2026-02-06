import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MyShopList - Smart Shopping List',
  description: 'Manage your groceries simply. Add items, check them off in-store, and track your most purchased products.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
