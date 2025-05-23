import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import "./globals.css";
import Header from "@/components/Header";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: "baps expense",
  description: "The smartest way to split expense with freinds",
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
        <Header />
        <main className="min-h-screen">{children}</main>
        </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
