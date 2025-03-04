import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { KeycloakProvider } from "@/components/KeycloakProvider"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "Центр социальной поддержки",
  description: "Приложение для регистрации и записи на услуги центра социальной поддержки",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <KeycloakProvider>
          {children}
        </KeycloakProvider>
      </body>
    </html>
  )
}

