import { formatDistanceToNow, differenceInDays, parseISO, format } from "date-fns";
import { GitHubRawPR, PullRequest, PRDigestSummary } from "@/types/github";

export function transformPullRequest(raw: GitHubRawPR): PullRequest {
  const createdAt = parseISO(raw.created_at);
  const updatedAt = parseISO(raw.updated_at);
  const daysOpen = differenceInDays(new Date(), createdAt);

  return {
    id: raw.id,
    number: raw.number,
    title: raw.title,
    author: raw.user.login,
    authorAvatar: raw.user.avatar_url,
    authorUrl: raw.user.html_url,
    state: raw.draft ? "draft" : (raw.state as "open" | "closed"),
    createdAt: format(createdAt, "MMM dd, yyyy · hh:mm a"),
    updatedAt: formatDistanceToNow(updatedAt, { addSuffix: true }),
    updatedAtRaw: raw.updated_at,
    url: raw.html_url,
    labels: raw.labels.map((label) => ({
      id: label.id,
      name: label.name,
      color: label.color,
    })),
    reviewers: raw.requested_reviewers.map((reviewer) => ({
      login: reviewer.login,
      avatarUrl: reviewer.avatar_url,
      url: reviewer.html_url,
    })),
    commentsCount: raw.comments,
    isDraft: raw.draft,
    baseRef: raw.base.ref,
    headRef: raw.head.ref,
    daysOpen,
  };
}

export function transformPullRequests(rawList: GitHubRawPR[]): PullRequest[] {
  return rawList
    .filter((pr) => pr.state === "open")
    .map(transformPullRequest)
    .sort((a, b) => b.daysOpen - a.daysOpen);
}

export function buildDigestSummary(
  pullRequests: PullRequest[],
  owner: string,
  repo: string
): PRDigestSummary {
  const draftCount = pullRequests.filter((pr) => pr.isDraft).length;
  const reviewNeededCount = pullRequests.filter(
    (pr) => pr.reviewers.length > 0 && !pr.isDraft
  ).length;
  const stalePRCount = pullRequests.filter((pr) => pr.daysOpen > 7).length;

  return {
    totalOpen: pullRequests.length,
    draftCount,
    reviewNeededCount,
    stalePRCount,
    pullRequests,
    fetchedAt: format(new Date(), "MMM dd, yyyy · hh:mm a"),
    repo,
    owner,
  };
}

export function getStaleStatus(daysOpen: number): {
  label: string;
  color: string;
} {
  if (daysOpen <= 1) return { label: "Fresh", color: "bg-green-100 text-green-700" };
  if (daysOpen <= 3) return { label: "Active", color: "bg-blue-100 text-blue-700" };
  if (daysOpen <= 7) return { label: "Aging", color: "bg-yellow-100 text-yellow-700" };
  if (daysOpen <= 14) return { label: "Stale", color: "bg-orange-100 text-orange-700" };
  return { label: "Critical", color: "bg-red-100 text-red-700" };
}

export function getLabelTextColor(hexColor: string): string {
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
}