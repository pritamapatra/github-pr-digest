import { PullRequest } from "@/types/github";
import { getStaleStatus, getLabelTextColor } from "@/lib/transform";
import { cn } from "@/lib/utils";
import {
  GitPullRequest,
  GitPullRequestDraft,
  MessageSquare,
  Clock,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";

interface PRRowProps {
  pr: PullRequest;
  index: number;
}

export default function PRRow({ pr, index }: PRRowProps) {
  const stale = getStaleStatus(pr.daysOpen);

  return (
    <a
      href={pr.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex items-start gap-4 px-6 py-4 transition-colors duration-150 hover:bg-zinc-50",
        index !== 0 && "border-t border-zinc-100"
      )}
    >
      <div className="mt-0.5 shrink-0">
        {pr.isDraft ? (
          <GitPullRequestDraft size={18} strokeWidth={1.75} className="text-zinc-300" />
        ) : (
          <GitPullRequest size={18} strokeWidth={1.75} className="text-emerald-500" />
        )}
      </div>

      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-sm font-medium text-zinc-800 leading-snug truncate group-hover:text-zinc-900 transition-colors">
              {pr.title}
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-zinc-400">
                #{pr.number}
              </span>

              <span className="text-zinc-200 text-xs">·</span>

              <div className="flex items-center gap-1.5">
                <Image
                  src={pr.authorAvatar}
                  alt={pr.author}
                  width={14}
                  height={14}
                  className="rounded-full"
                />
                <span className="text-xs text-zinc-400">{pr.author}</span>
              </div>

              <span className="text-zinc-200 text-xs">·</span>

              <div className="flex items-center gap-1 text-zinc-400">
                <Clock size={11} strokeWidth={1.75} />
                <span className="text-xs">{pr.createdAt}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            {pr.commentsCount > 0 && (
              <div className="flex items-center gap-1 text-zinc-400">
                <MessageSquare size={12} strokeWidth={1.75} />
                <span className="text-xs">{pr.commentsCount}</span>
              </div>
            )}

            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                stale.color
              )}
            >
              {stale.label}
            </span>

            <ExternalLink
              size={13}
              strokeWidth={1.75}
              className="text-zinc-300 group-hover:text-zinc-400 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {pr.labels.slice(0, 3).map((label) => (
            <span
              key={label.id}
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `#${label.color}26`,
                color: `#${label.color}`,
                border: `1px solid #${label.color}40`,
              }}
            >
              {label.name}
            </span>
          ))}

          {pr.reviewers.length > 0 && (
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-xs text-zinc-300">reviewers</span>
              <div className="flex -space-x-1.5">
                {pr.reviewers.slice(0, 3).map((reviewer) => (
                  <Image
                    key={reviewer.login}
                    src={reviewer.avatarUrl}
                    alt={reviewer.login}
                    width={18}
                    height={18}
                    className="rounded-full ring-1 ring-white"
                    title={reviewer.login}
                  />
                ))}
                {pr.reviewers.length > 3 && (
                  <div className="w-[18px] h-[18px] rounded-full bg-zinc-100 ring-1 ring-white flex items-center justify-center">
                    <span className="text-[9px] font-medium text-zinc-400">
                      +{pr.reviewers.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </a>
  );
}