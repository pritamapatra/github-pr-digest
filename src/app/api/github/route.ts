import { NextRequest, NextResponse } from "next/server";
import { fetchOpenPullRequests, checkRateLimit } from "@/lib/github";
import { transformPullRequests, buildDigestSummary } from "@/lib/transform";
import { ApiResponse, PRDigestSummary } from "@/types/github";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const owner =
      searchParams.get("owner") || process.env.GITHUB_OWNER || "";
    const repo =
      searchParams.get("repo") || process.env.GITHUB_REPO || "";

    if (!owner || !repo) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: "Missing required parameters: owner and repo.",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (!process.env.GITHUB_PAT) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: "GitHub Personal Access Token is not configured.",
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const rawPRs = await fetchOpenPullRequests(owner, repo);
    const transformedPRs = transformPullRequests(rawPRs);
    const summary = buildDigestSummary(transformedPRs, owner, repo);

    const rateLimit = await checkRateLimit();

    const successResponse: ApiResponse<PRDigestSummary> = {
      success: true,
      data: summary,
      message: `Fetched ${transformedPRs.length} open PRs. Rate limit: ${rateLimit.remaining}/${rateLimit.limit} remaining.`,
    };

    return NextResponse.json(successResponse, {
      status: 200,
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error: unknown) {
    const err = error as {
      status?: number;
      message?: string;
    };

    if (err.status === 404) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: "Repository not found. Check the owner and repo name.",
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    if (err.status === 401) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: "GitHub authentication failed. Check your Personal Access Token.",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    if (err.status === 403) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: "GitHub API rate limit exceeded. Please wait before retrying.",
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    console.error("GitHub API route error:", err);

    const errorResponse: ApiResponse<null> = {
      success: false,
      error: err.message || "An unexpected error occurred.",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}