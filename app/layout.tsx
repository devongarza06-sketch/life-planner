import "@/styles/globals.css";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import DevHUD from "@/components/DevHUD";
import Toasts from "@/components/Toasts";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        {children}
        <DevHUD />
        <Toasts />
      </body>
    </html>
  );
}
