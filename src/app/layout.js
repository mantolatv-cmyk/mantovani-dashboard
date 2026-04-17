import { Inter } from "next/font/google"; 
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { AuthProvider } from "@/components/AuthProvider";
import LayoutWrapper from "@/components/LayoutWrapper";

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
          <AuthProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
