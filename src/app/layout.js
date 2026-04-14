import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Mantovani — Sistema de Locação de Equipamentos",
  description:
    "Dashboard de gestão para locação de equipamentos de construção. Gerencie estoque, contratos e devoluções em um só lugar.",
  keywords: "locação, equipamentos, construção, estoque, gestão, Mantovani",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ToastProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            {/* Main content area */}
            <main className="flex-1 lg:ml-[260px] min-h-screen bg-grid-pattern">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8">
                {children}
              </div>
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
