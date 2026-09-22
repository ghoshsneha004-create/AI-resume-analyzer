import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata = {
  title: "CareerCraft AI — Production AI Resume Analyzer & ATS Optimizer",
  description: "Get comprehensive AI-powered resume analysis, ATS scoring, XYZ formula bullet rewriting, and downloadable executive audit reports.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-brand-500 selection:text-white">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-slate-850 py-8 bg-slate-950/80 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 CareerCraft AI • Production-Ready Resume Optimization</p>
            <p className="flex items-center space-x-4">
              <span>FastAPI Backend</span>
              <span>•</span>
              <span>Next.js Frontend</span>
              <span>•</span>
              <span>Google Gemini AI</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
