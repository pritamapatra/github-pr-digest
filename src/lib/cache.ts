import { unstable_cache } from "next/cache";
import { fetchOpenPullRequests } from "@/lib/github";
import { transformPullRequests, buildDigestSummary } from "@/lib/transform";
import { PRDigestSummary } from "@/types/github";

export const getCachedDigest = unstable_cache(
  async (owner: string, repo: string): Promise<PRDigestSummary> => {
    const rawPRs = await fetchOpenPullRequests(owner, repo);
    const pullRequests = transformPullRequests(rawPRs);
    return buildDigestSummary(pullRequests, owner, repo);
  },
  ["pr-digest"],
  {
    revalidate: 300,
    tags: ["pr-digest"],
  }
);