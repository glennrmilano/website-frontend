import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Vx Predict',
  description: 'Healthcare supply chain forecasting with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Initialize auth store on client side */}
        <ClientInitializer />
        {children}
      </body>
    </html>
  )
}

// Client-side initializer
function ClientInitializer() {
  // This component ensures auth store is loaded from localStorage
  // before any routes that depend on it
  if (typeof window !== 'undefined') {
    // Suppress hydration warning by not rendering anything server-side
    const { useAuthStore } = require('@/lib/store/authStore')
    useAuthStore.getState().loadFromStorage()
  }
  return null
}
