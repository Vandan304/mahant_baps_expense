import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import HeaderWrapper from "./HeaderWrapper"; // ✅ Use client component wrapper
import { Toaster } from "sonner";

export const metadata = {
  title: "baps expense",
  description: "The smartest way to split expense with friends",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logos/logo-s.png" sizes="any" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ClerkProvider>
          <ConvexClientProvider>
            <HeaderWrapper /> {/* ✅ This is client-side now */}
            <main className="min-h-screen">
              {children}
              <Toaster richColors/>
            </main>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
