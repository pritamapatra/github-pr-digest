export interface PullRequest {
  id: number;
  number: number;
  title: string;
  author: string;
  authorAvatar: string;
  authorUrl: string;
  state: "open" | "closed" | "draft";
  createdAt: string;
  updatedAt: string;
  updatedAtRaw: string;
  url: string;
  labels: Label[];
  reviewers: Reviewer[];
  commentsCount: number;
  isDraft: boolean;
  baseRef: string;
  headRef: string;
  daysOpen: number;
}

export interface Label {
  id: number;
  name: string;
  color: string;
}

export interface Reviewer {
  login: string;
  avatarUrl: string;
  url: string;
}

export interface PRDigestSummary {
  totalOpen: number;
  draftCount: number;
  reviewNeededCount: number;
  stalePRCount: number;
  pullRequests: PullRequest[];
  fetchedAt: string;
  repo: string;
  owner: string;
}

export interface GitHubRawPR {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  draft: boolean;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  labels: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  requested_reviewers: Array<{
    login: string;
    avatar_url: string;
    html_url: string;
  }>;
  comments: number;
  base: {
    ref: string;
  };
  head: {
    ref: string;
  };
}

export interface DeliverPayload {
  destination: "slack" | "sheets";
  pullRequests: PullRequest[];
  summary: PRDigestSummary;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}