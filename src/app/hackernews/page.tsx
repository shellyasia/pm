import { Suspense } from "react";
import { HackerNewsContent } from "./content";
import { Newspaper, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Hacker News - Latest Tech Stories",
  description: "Browse the latest tech news and stories from Hacker News",
};

export default function HackerNewsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-orange-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
              <Newspaper className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Hacker News
              </h1>
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Latest tech stories and discussions
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"
                >
                  <div className="h-6 bg-slate-200 rounded-md w-3/4 mb-3"></div>
                  <div className="h-4 bg-slate-100 rounded-md w-1/2 mb-2"></div>
                  <div className="h-4 bg-slate-100 rounded-md w-1/3"></div>
                </div>
              ))}
            </div>
          }
        >
          <HackerNewsContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 backdrop-blur mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-slate-600">
          <p>
            Powered by{" "}
            <span className="font-semibold text-orange-600">
              Hacker News API
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
