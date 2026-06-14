import { Octokit } from "@octokit/rest";
import { GitHubRawPR } from "@/types/github";

const octokit = new Octokit({
  auth: process.env.GITHUB_PAT,
  userAgent: "github-pr-digest/1.0.0",
});

export async function fetchOpenPullRequests(
  owner: string,
  repo: string,
  perPage: number = 50
): Promise<GitHubRawPR[]> {
  const allPRs: GitHubRawPR[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await octokit.pulls.list({
      owner,
      repo,
      state: "open",
      per_page: perPage,
      page,
      sort: "created",
      direction: "desc",
    });

    const prs = response.data as unknown as GitHubRawPR[];

    if (prs.length === 0) {
      hasMore = false;
    } else {
      allPRs.push(...prs);
      if (prs.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }
    }

    if (allPRs.length >= 100) {
      hasMore = false;
    }
  }

  return allPRs;
}

export async function fetchSinglePullRequest(
  owner: string,
  repo: string,
  pullNumber: number
): Promise<GitHubRawPR> {
  const response = await octokit.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
  });

  return response.data as unknown as GitHubRawPR;
}

export async function validateGitHubToken(): Promise<{
  valid: boolean;
  username?: string;
  error?: string;
}> {
  try {
    const response = await octokit.users.getAuthenticated();
    return {
      valid: true,
      username: response.data.login,
    };
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 401) {
      return {
        valid: false,
        error: "Invalid or expired GitHub Personal Access Token.",
      };
    }
    return {
      valid: false,
      error: err.message || "Unknown error validating token.",
    };
  }
}

export async function checkRateLimit(): Promise<{
  remaining: number;
  limit: number;
  resetAt: string;
}> {
  const response = await octokit.rateLimit.get();
  const core = response.data.rate;

  return {
    remaining: core.remaining,
    limit: core.limit,
    resetAt: new Date(core.reset * 1000).toLocaleTimeString(),
  };
}