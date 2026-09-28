import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./loop-theme.css";
import { Providers } from "./providers";
import { ThemeModeProvider } from "./theme-provider";
import { AntdRegistry } from "@ant-design/nextjs-registry";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LOOP",
  description: "Voice-of-customer feedback analytics",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
  lang="en"
  data-scroll-behavior="smooth"
  className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
>
      <body className="min-h-full flex flex-col">
        <AntdRegistry>
          <ThemeModeProvider>
            <Providers>{children}</Providers>
          </ThemeModeProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}