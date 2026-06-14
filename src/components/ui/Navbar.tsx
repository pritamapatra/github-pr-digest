import { GitPullRequest } from "lucide-react";
import RefreshButton from "@/components/dashboard/RefreshButton";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-8 sm:px-12 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
            <GitPullRequest size={14} strokeWidth={2} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-zinc-900 tracking-tight">
            PR Digest
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors font-medium"
          >
            GitHub
          </a>
          <div className="w-px h-3.5 bg-zinc-200" />
          <RefreshButton />
        </div>
      </div>
    </header>
  );
}