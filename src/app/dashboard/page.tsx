export const revalidate = 300;

import { Suspense } from "react";
import { AlertCircle, Code2, FileEdit, Users, Clock, GitPullRequest } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import PRTable from "@/components/dashboard/PRTable";
import DeliverButton from "@/components/dashboard/DeliverButton";
import { getCachedDigest } from "@/lib/cache";

async function DashboardContent() {
  const owner = process.env.GITHUB_OWNER || "";
  const repo = process.env.GITHUB_REPO || "";

  try {
    const summary = await getCachedDigest(owner, repo);

    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Code2 size={14} strokeWidth={1.75} className="text-zinc-400" />
              <span className="text-xs text-zinc-400 font-medium tracking-tight">
                {owner} / {repo}
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
              Pull Request Digest
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Last updated {summary.fetchedAt}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium">Live</span>
            </div>
            <DeliverButton summary={summary} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Open PRs"
            value={summary.totalOpen}
            icon={GitPullRequest}
            description="Total open pull requests"
            variant="default"
          />
          <StatCard
            label="Review Needed"
            value={summary.reviewNeededCount}
            icon={Users}
            description="PRs with assigned reviewers"
            variant="success"
          />
          <StatCard
            label="Drafts"
            value={summary.draftCount}
            icon={FileEdit}
            description="Work in progress"
            variant="default"
          />
          <StatCard
            label="Stale PRs"
            value={summary.stalePRCount}
            icon={Clock}
            description="Open longer than 7 days"
            variant={summary.stalePRCount > 0 ? "warning" : "default"}
          />
        </div>

        <PRTable
          pullRequests={summary.pullRequests}
          fetchedAt={summary.fetchedAt}
        />
      </div>
    );
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertCircle size={22} strokeWidth={1.5} className="text-red-400" />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-sm font-semibold text-zinc-800">
            Failed to load pull requests
          </span>
          <span className="text-xs text-zinc-400 max-w-xs">
            {err.status === 401
              ? "Invalid GitHub token. Check your .env.local file."
              : err.status === 404
              ? "Repository not found. Verify GITHUB_OWNER and GITHUB_REPO."
              : err.message || "An unexpected error occurred."}
          </span>
        </div>
        <a
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          Try again
        </a>
      </div>
    );
  }
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div className="flex flex-col gap-1">
        <div className="h-3 w-24 bg-zinc-100 rounded-lg" />
        <div className="h-7 w-56 bg-zinc-100 rounded-lg mt-1" />
        <div className="h-3 w-36 bg-zinc-100 rounded-lg mt-1" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-100 bg-white px-6 py-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-zinc-100 rounded" />
              <div className="w-8 h-8 rounded-xl bg-zinc-100" />
            </div>
            <div className="h-8 w-16 bg-zinc-100 rounded-lg" />
            <div className="h-3 w-28 bg-zinc-50 rounded" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100">
        <div className="px-6 py-3 border-b border-zinc-50">
          <div className="h-3 w-24 bg-zinc-100 rounded" />
        </div>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-4 border-b border-zinc-50 last:border-0"
          >
            <div className="w-4 h-4 rounded-full bg-zinc-100 shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-3.5 bg-zinc-100 rounded w-3/4" />
              <div className="h-3 bg-zinc-50 rounded w-1/3" />
            </div>
            <div className="h-5 w-12 bg-zinc-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="max-w-5xl mx-auto px-8 sm:px-12 py-12">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </div>
    </main>
  );
}