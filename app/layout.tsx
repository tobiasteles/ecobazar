import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { Toaster } from "sonner";

// Configuração da fonte Outfit - Mais encorpada e legível que a Geist
const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"], // Incluído pesos maiores para títulos
  variable: "--font-outfit",
});

// Metadados otimizados para o evento da Escola Salesiana
export const metadata: Metadata = {
  title: "EcoBazar | 6º Ano Escola Salesiana",
  description: "Bazar Sustentável dos alunos do 6º Ano. Reserve suas peças online e retire na Feira do Empreendedor dia 30/05.",
  icons: {
    icon: "/favicon.ico", // Lembre-se de colocar um ícone de reciclagem ou folha aqui
  },
};

// Garantir que o site seja responsivo e tenha a cor do tema no navegador
export const viewport: Viewport = {
  themeColor: "#14b8a6", // Cor Teal-500 (Verde Água)
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body 
        className={`${outfit.className} min-h-full flex flex-col bg-white selection:bg-teal-100 selection:text-teal-900`}
      >
        <Providers>
          {/* O conteúdo das páginas (Index, Admin, etc.) entra aqui */}
          <div className="flex-1 flex flex-col">
            {children}
          </div>

          {/* Gerenciador de notificações (Toasts) */}
          <Toaster 
            position="top-center" 
            richColors 
            closeButton
            toastOptions={{
              style: { 
                fontFamily: 'var(--font-outfit)',
                borderRadius: '12px' 
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}