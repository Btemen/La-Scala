import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'

export const metadata = {
  title: 'La Scala | Curated Luxury',
  description: 'Curated luxury from the world\'s finest houses',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
