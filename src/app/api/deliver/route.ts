import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { PullRequest, ApiResponse, PRDigestSummary } from "@/types/github";
import { getStaleStatus } from "@/lib/transform";

interface NexlaPR {
  number: number;
  title: string;
  author_login: string;
  state: string;
  created_at: string;
  html_url: string;
}

function buildSlackBlocks(summary: PRDigestSummary): object[] {
  const { pullRequests, totalOpen, draftCount, reviewNeededCount, stalePRCount, owner, repo, fetchedAt } = summary;
  const blocks: object[] = [
    { type: "header", text: { type: "plain_text", text: "GitHub PR Digest", emoji: false } },
    { type: "section", text: { type: "mrkdwn", text: `*${owner}/${repo}* — ${fetchedAt}` } },
    { type: "section", fields: [
      { type: "mrkdwn", text: `*Open PRs*\n${totalOpen}` },
      { type: "mrkdwn", text: `*Review Needed*\n${reviewNeededCount}` },
      { type: "mrkdwn", text: `*Drafts*\n${draftCount}` },
      { type: "mrkdwn", text: `*Stale (7d+)*\n${stalePRCount}` },
    ]},
    { type: "divider" },
  ];
  const actionablePRs = pullRequests.filter((pr: PullRequest) => !pr.isDraft).slice(0, 10);
  if (actionablePRs.length === 0) {
    blocks.push({ type: "section", text: { type: "mrkdwn", text: "No open (non-draft) pull requests at this time." } });
    return blocks;
  }
  blocks.push({ type: "section", text: { type: "mrkdwn", text: "*Open Pull Requests (top 10)*" } });
  actionablePRs.forEach((pr: PullRequest) => {
    const stale = getStaleStatus(pr.daysOpen);
    const reviewerText = pr.reviewers.length > 0 ? `Reviewers: ${pr.reviewers.map((r) => r.login).join(", ")}` : "No reviewers assigned";
    blocks.push({ type: "section", text: { type: "mrkdwn", text: `*<${pr.url}|#${pr.number} ${pr.title}>*\nBy *${pr.author}* — opened ${pr.createdAt} — *${stale.label}*\n${reviewerText}` } });
  });
  blocks.push({ type: "divider" });
  blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: `Delivered by GitHub PR Digest | ${fetchedAt}` }] });
  return blocks;
}

function buildNexlaSlackBlocks(prs: NexlaPR[]): object[] {
  const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const blocks: object[] = [
    { type: "header", text: { type: "plain_text", text: "🔀 GitHub PR Digest — via Nexla", emoji: true } },
    { type: "section", text: { type: "mrkdwn", text: `*vercel/next.js* — Nexla Express Pipeline | ${now} IST` } },
    { type: "section", fields: [
      { type: "mrkdwn", text: `*Total PRs*\n${prs.length}` },
      { type: "mrkdwn", text: `*State*\nAll Open ✅` },
    ]},
    { type: "divider" },
    { type: "section", text: { type: "mrkdwn", text: "*Latest Open Pull Requests*" } },
  ];
  prs.slice(0, 10).forEach((pr) => {
    const date = new Date(pr.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    blocks.push({ type: "section", text: { type: "mrkdwn", text: `*<${pr.html_url}|#${pr.number} ${pr.title}>*\nBy *${pr.author_login}* — opened ${date}` } });
  });
  blocks.push({ type: "divider" });
  blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: `Powered by Nexla Express Pipeline (Nexset ID: 428758) | Delivered ${now} IST` }] });
  return blocks;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json({ success: false, error: "SLACK_WEBHOOK_URL is not configured." }, { status: 500 });
    }
    if (Array.isArray(body)) {
      const prs = body as NexlaPR[];
      const blocks = buildNexlaSlackBlocks(prs);
      await axios.post(webhookUrl, { blocks, text: `Nexla PR Digest — vercel/next.js: ${prs.length} open PRs` });
      return NextResponse.json({ success: true, message: `Nexla digest delivered. ${prs.length} PRs sent to Slack.` }, { status: 200 });
    }
    const { summary } = body as { summary: PRDigestSummary };
    if (!summary) {
      return NextResponse.json({ success: false, error: "Missing summary payload." }, { status: 400 });
    }
    const blocks = buildSlackBlocks(summary);
    await axios.post(webhookUrl, { blocks, text: `GitHub PR Digest — ${summary.owner}/${summary.repo}: ${summary.totalOpen} open PRs` });
    return NextResponse.json({ success: true, message: `Digest delivered to Slack successfully. ${summary.totalOpen} PRs included.` }, { status: 200 });
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { data?: unknown } };
    console.error("Delivery error:", err.response?.data || err.message);
    return NextResponse.json({ success: false, error: err.message || "Failed to deliver digest." }, { status: 500 });
  }
}
