import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ToastProvider } from "@/components/ui/Toast";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export const metadata: Metadata = {
  title: "ITQAN Union — Digital Campus & Leadership Network",
  description:
    "ITQAN Union is a premium digital campus designed for the next generation of innovators, empowering students through knowledge, creativity, and community.",
  keywords: ["ITQAN", "Student Union", "Leadership", "Digital Campus", "Innovation Hub"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-slate-950 text-foreground selection:bg-primary/30 min-h-screen">
        <AuthProvider>
          <ToastProvider>
            <LoadingScreen />
            <ScrollProgress />
            <CommandPalette />
            <Header />
            <ErrorBoundary>
              <main className="min-h-[calc(100vh-80px)]">{children}</main>
            </ErrorBoundary>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
