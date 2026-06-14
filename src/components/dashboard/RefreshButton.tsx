"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    if (isRefreshing) return;

    setIsRefreshing(true);

    router.refresh();

    setTimeout(() => setIsRefreshing(false), 1500);
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      title="Refresh data"
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200",
        isRefreshing
          ? "border-zinc-200 bg-zinc-50 text-zinc-300 cursor-not-allowed"
          : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 hover:border-zinc-300 active:scale-95"
      )}
    >
      <RefreshCw
        size={12}
        strokeWidth={1.75}
        className={cn(
          "transition-transform duration-700",
          isRefreshing && "animate-spin"
        )}
      />
      {isRefreshing ? "Refreshing..." : "Refresh"}
    </button>
  );
}