"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  Clock,
  ExternalLink,
  Flame,
  Search,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface HnItem {
  id: number;
  title: string;
  url: string;
  type: string;
  score: number;
  created_at: string;
}

export function HackerNewsContent() {
  const [items, setItems] = useState<HnItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 40;

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search }),
        });

        const response = await fetch(`/api/hackernews?${params}`);
        const data = await response.json();
        setItems(data.rows || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error("Failed to fetch items:", error);
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [page, search]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const totalPages = Math.ceil(total / limit);

  const getTimeSince = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const seconds = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 500) return "from-red-500 to-orange-500";
    if (score >= 200) return "from-orange-500 to-amber-500";
    if (score >= 100) return "from-amber-500 to-yellow-500";
    return "from-slate-500 to-slate-400";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 500) return { icon: Flame, label: "Hot", color: "bg-red-500" };
    if (score >= 200)
      return { icon: TrendingUp, label: "Trending", color: "bg-orange-500" };
    return null;
  };

  return (
    <div className="space-y-6">
 

      {/* Stories List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse"
            >
              <div className="h-5 bg-slate-200 rounded-md w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-100 rounded-md w-1/2 mb-2"></div>
              <div className="h-3 bg-slate-100 rounded-md w-1/3"></div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            No stories found
          </h3>
          <p className="text-slate-600">
            Try adjusting your search or check back later for new content.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => {
            const scoreBadge = getScoreBadge(item.score);
            return (
              <div
                key={item.id}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md border border-slate-200 hover:border-orange-300 transition-all duration-200 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex gap-3">
                    {/* Rank and Score */}
                    <div className="flex-shrink-0 text-center">
                      <div className="text-lg font-bold text-slate-300 group-hover:text-orange-400 transition-colors">
                        {(page - 1) * limit + index + 1}
                      </div>
                      <div
                        className={`mt-1 px-2 py-0.5 rounded-full bg-gradient-to-r ${getScoreColor(
                          item.score
                        )} text-white text-xs font-semibold shadow`}
                      >
                        ▲ {item.score}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h3 className="text-base font-semibold text-slate-900 mb-1.5 group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight">
                        {item.title}
                      </h3>

                      {/* URL */}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 hover:underline mb-2 max-w-full truncate"
                      >
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{item.url}</span>
                      </a>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{getTimeSince(item.created_at)}</span>
                        </div>

                        <Badge
                          variant="outline"
                          className="border-slate-300 text-slate-700 text-xs px-1.5 py-0 h-5"
                        >
                          {item.type}
                        </Badge>

                        {scoreBadge && (
                          <Badge
                            className={`${scoreBadge.color} text-white border-0 text-xs px-1.5 py-0 h-5`}
                          >
                            <scoreBadge.icon className="h-3 w-3 mr-0.5" />
                            {scoreBadge.label}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 group-hover:bg-orange-500 text-slate-600 group-hover:text-white transition-all duration-200"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              variant="outline"
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <Button
                    key={i}
                    onClick={() => setPage(pageNum)}
                    variant={page === pageNum ? "default" : "outline"}
                    className={
                      page === pageNum
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                        : ""
                    }
                    disabled={loading}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              variant="outline"
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-center text-sm text-slate-600 mt-4">
            Page {page} of {totalPages} • {total.toLocaleString()} total stories
          </p>
        </div>
      )}

     {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search stories by title or URL..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-12 h-12 text-base border-slate-300 focus:border-orange-500 focus:ring-orange-500/20"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="h-12 px-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30"
          >
            Search
          </Button>
        </div>

        {search && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-slate-600">Searching for:</span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              {search}
            </Badge>
            <button
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setPage(1);
              }}
              className="text-sm text-orange-600 hover:text-orange-700 underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>



    </div>
  );
}
