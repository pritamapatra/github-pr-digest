"use client";

import { useState, useMemo } from "react";
import { PullRequest } from "@/types/github";
import PRRow from "./PRRow";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PRTableProps {
  pullRequests: PullRequest[];
  fetchedAt: string;
}

type FilterState = "all" | "open" | "draft";
type SortState = "newest" | "oldest" | "recently-updated";

const PAGE_SIZE = 10;

export default function PRTable({ pullRequests, fetchedAt }: PRTableProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterState>("all");
  const [sort, setSort] = useState<SortState>("oldest");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...pullRequests];

    if (filter === "open") {
      result = result.filter((pr) => !pr.isDraft);
    } else if (filter === "draft") {
      result = result.filter((pr) => pr.isDraft);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (pr) =>
          pr.title.toLowerCase().includes(query) ||
          pr.author.toLowerCase().includes(query) ||
          pr.number.toString().includes(query)
      );
    }

    if (sort === "newest") {
      result.sort((a, b) => a.daysOpen - b.daysOpen);
    } else if (sort === "oldest") {
      result.sort((a, b) => b.daysOpen - a.daysOpen);
    } else if (sort === "recently-updated") {
  result.sort(
    (a, b) =>
      new Date(b.updatedAtRaw).getTime() - new Date(a.updatedAtRaw).getTime()
  );
}

    return result;
  }, [pullRequests, filter, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  function handleFilterChange(value: FilterState) {
    setFilter(value);
    setCurrentPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function handleSortChange(value: SortState) {
    setSort(value);
    setCurrentPage(1);
  }

  function getPageNumbers(): (number | "...")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [1];

    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("...");

    pages.push(totalPages);

    return pages;
  }

  const filterOptions: { label: string; value: FilterState }[] = [
    { label: "All", value: "all" },
    { label: "Open", value: "open" },
    { label: "Draft", value: "draft" },
  ];

  const sortOptions: { label: string; value: SortState }[] = [
  { label: "Oldest first", value: "oldest" },
  { label: "Newest first", value: "newest" },
  { label: "Recently updated", value: "recently-updated" },
];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1 self-start">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFilterChange(option.value)}
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-150",
                filter === option.value
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {option.label}
              {option.value === "all" && (
                <span className="ml-1.5 text-zinc-400">{pullRequests.length}</span>
              )}
              {option.value === "open" && (
                <span className="ml-1.5 text-zinc-400">
                  {pullRequests.filter((pr) => !pr.isDraft).length}
                </span>
              )}
              {option.value === "draft" && (
                <span className="ml-1.5 text-zinc-400">
                  {pullRequests.filter((pr) => pr.isDraft).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search
              size={13}
              strokeWidth={1.75}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search PRs..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full sm:w-48 pl-8 pr-8 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all"
            />
            {search && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X size={12} strokeWidth={1.75} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 border border-zinc-200 bg-white rounded-xl px-3 py-1.5 shrink-0">
            <SlidersHorizontal size={12} strokeWidth={1.75} className="text-zinc-400" />
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as SortState)}
              className="text-xs text-zinc-600 bg-transparent focus:outline-none cursor-pointer appearance-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center">
              <Search size={18} strokeWidth={1.5} className="text-zinc-300" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-medium text-zinc-700">
                No pull requests found
              </span>
              <span className="text-xs text-zinc-400">
                Try adjusting your search or filter
              </span>
            </div>
            {search && (
              <button
                onClick={() => handleSearchChange("")}
                className="text-xs text-zinc-500 underline underline-offset-2 hover:text-zinc-700 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="px-6 py-3 border-b border-zinc-50 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Pull Requests
              </span>
              <span className="text-xs text-zinc-400">
                {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
            </div>
            <div>
              {paginated.map((pr, index) => (
                <PRRow key={pr.id} pr={pr} index={index} />
              ))}
            </div>
          </>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150",
              currentPage === 1
                ? "text-zinc-300 cursor-not-allowed"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 active:scale-95"
            )}
          >
            <ChevronLeft size={15} strokeWidth={1.75} />
          </button>

          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="w-8 h-8 flex items-center justify-center text-xs text-zinc-400"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page as number)}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-medium transition-all duration-150",
                  currentPage === page
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 active:scale-95"
                )}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150",
              currentPage === totalPages
                ? "text-zinc-300 cursor-not-allowed"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 active:scale-95"
            )}
          >
            <ChevronRight size={15} strokeWidth={1.75} />
          </button>
        </div>
      )}

      <p className="text-xs text-zinc-300 text-right">
        Last fetched {fetchedAt}
      </p>
    </div>
  );
}