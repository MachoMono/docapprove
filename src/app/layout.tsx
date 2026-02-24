import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "DocApprove - Documentation Approval CMS",
  description: "AI-powered documentation approval system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <div style={{ display: 'flex' }}>
          <Sidebar />
          <main style={{ flex: 1, padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
