import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { PullRequest, ApiResponse, PRDigestSummary } from "@/types/github";
import { getStaleStatus } from "@/lib/transform";

function buildSlackBlocks(summary: PRDigestSummary): object[] {
  const { pullRequests, totalOpen, draftCount, reviewNeededCount, stalePRCount, owner, repo, fetchedAt } = summary;

  const blocks: object[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "GitHub PR Digest",
        emoji: false,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${owner}/${repo}* — ${fetchedAt}`,
      },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Open PRs*\n${totalOpen}` },
        { type: "mrkdwn", text: `*Review Needed*\n${reviewNeededCount}` },
        { type: "mrkdwn", text: `*Drafts*\n${draftCount}` },
        { type: "mrkdwn", text: `*Stale (7d+)*\n${stalePRCount}` },
      ],
    },
    { type: "divider" },
  ];

  const actionablePRs = pullRequests
    .filter((pr: PullRequest) => !pr.isDraft)
    .slice(0, 10);

  if (actionablePRs.length === 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "No open (non-draft) pull requests at this time.",
      },
    });
    return blocks;
  }

  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: "*Open Pull Requests (top 10)*",
    },
  });

  actionablePRs.forEach((pr: PullRequest) => {
    const stale = getStaleStatus(pr.daysOpen);
    const reviewerText =
      pr.reviewers.length > 0
        ? `Reviewers: ${pr.reviewers.map((r) => r.login).join(", ")}`
        : "No reviewers assigned";

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*<${pr.url}|#${pr.number} ${pr.title}>*\nBy *${pr.author}* — opened ${pr.createdAt} — *${stale.label}*\n${reviewerText}`,
      },
    });
  });

  blocks.push({ type: "divider" });
  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `Delivered by GitHub PR Digest | ${fetchedAt}`,
      },
    ],
  });

  return blocks;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { summary } = body as { summary: PRDigestSummary };

    if (!summary) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: "Missing summary payload.",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: "SLACK_WEBHOOK_URL is not configured in environment variables.",
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const blocks = buildSlackBlocks(summary);

    await axios.post(webhookUrl, {
      blocks,
      text: `GitHub PR Digest — ${summary.owner}/${summary.repo}: ${summary.totalOpen} open PRs`,
    });

    const successResponse: ApiResponse<null> = {
      success: true,
      message: `Digest delivered to Slack successfully. ${summary.totalOpen} PRs included.`,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { data?: unknown } };

    console.error("Slack delivery error:", err.response?.data || err.message);

    const errorResponse: ApiResponse<null> = {
      success: false,
      error: err.message || "Failed to deliver digest to Slack.",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}