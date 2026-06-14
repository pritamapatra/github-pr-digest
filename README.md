🔀 GitHub PR Digest
A production-grade dashboard that automatically extracts, transforms, and delivers a clean daily digest of open Pull Requests from the vercel/next.js repository — built as a Nexla CSE Take-Home Assessment (Option A: Nexla Express Application).

🔗 Live Demo: https://github-pr-digest-fawn.vercel.app/dashboard

📋 Executive Summary
This project solves a real-world problem for engineering teams: developer context-switching and alert fatigue caused by noisy GitHub notifications. Instead of logging into GitHub to hunt for open PRs, this pipeline automatically extracts live PR data via the GitHub REST API, filters and transforms it through a Nexla Express pipeline, and surfaces it in a clean, searchable dashboard — with one-click Slack delivery.

The system demonstrates an end-to-end data integration: API Source → Nexla Transform → Dashboard Delivery.

✨ Features
Live PR Dashboard — Real-time open PRs from vercel/next.js with stat cards (Open, Review Needed, Drafts, Stale)

Smart Filtering — Only actionable open state PRs surfaced, noise removed

Search & Sort — Search by title/author, sort by newest/oldest/most discussed

Pagination — 10 PRs per page across 100+ results

Slack Delivery — One-click /api/deliver route sends PR digest to Slack webhook

ISR Caching — Incremental Static Regeneration with 300s revalidation

Refresh Button — Manual refresh with last-updated timestamp

Nexla Express Pipeline — Full ETL pipeline: GitHub API → Flink SQL Transform → Validated CSV output

🏗️ Architecture
text
┌─────────────────────────────────────────────────────────────┐
│                    NEXLA EXPRESS PIPELINE                   │
│                                                             │
│  GitHub REST API  ──►  Source Nexset  ──►  Flink SQL        │
│  (vercel/next.js)       ID: 123722        Transform         │
│  PAT Auth               1,908 records     ID: 428758        │
│                                           6 fields extracted│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   NEXT.JS 14 DASHBOARD                      │
│                                                             │
│  /api/github  ──►  Transform Layer  ──►  Dashboard UI       │
│  (Octokit)         (filter/format)       (Stat Cards +      │
│  ISR Cache         date-fns              PR Table)          │
│  300s revalidate   type-safe                                │
│                                           /api/deliver      │
│                                           (Slack Webhook)   │
└─────────────────────────────────────────────────────────────┘
🔧 Nexla Express Pipeline — Technical Details
Pipeline Components
Component	Name	ID	Status
Credential	GitHub PAT - Next.js	30904	✅ ACTIVE
Source	GitHub Next.js Open PRs	123722	✅ ACTIVE
Source Nexset	1 - GitHub Next.js Open PRs	428756	✅ ACTIVE
Transform Nexset	Filtered Next.js PRs	428758	✅ ACTIVE
Source Configuration
Connector: GitHub REST API

Endpoint: GET /repos/vercel/next.js/pulls?state=open

Auth: Personal Access Token (Bearer)

Records fetched: 1,908

Flink SQL Transform
The transform extracts 6 key fields from the raw GitHub JSON payload, dropping hundreds of irrelevant metadata fields (node IDs, patch URLs, diff stats, etc.):

sql
-- Key columns extracted
number        -- PR identification number (Integer)
title         -- PR title string (String)
author_login  -- GitHub username of PR author (String)
state         -- PR state: open/closed/draft (String)
created_at    -- ISO 8601 UTC timestamp (Timestamp String)
html_url      -- Full GitHub PR URL (URL String)
Validated CSV Output Sample
text
author_login,created_at,html_url,number,state,title
aurorascharff,2026-06-13T21:18:50Z,https://github.com/vercel/next.js/pull/94798,94798,open,dev-overlay: wire Link prefetch={true} Partial Prefetching warning into Insights
unstubbable,2026-06-13T19:39:58Z,https://github.com/vercel/next.js/pull/94797,94797,open,[test] Recover from a leftover build process on test retry
unstubbable,2026-06-13T19:37:12Z,https://github.com/vercel/next.js/pull/94796,94796,open,[test] Unflake `metadata static routes cache` test
berry95,2026-06-13T17:34:25Z,https://github.com/vercel/next.js/pull/94794,94794,open,Fix sandbox timeout memory leak causing stepwise heap growth
lukesandberg,2026-06-13T16:11:29Z,https://github.com/vercel/next.js/pull/94792,94792,open,[turbo-tasks] Shrink RawVc to 8 bytes and CellId to 4 bytes
✅ All rows: state = open | ✅ ISO 8601 timestamps | ✅ Valid GitHub URLs

🛠️ Tech Stack
Layer	Technology
Framework	Next.js 14 (App Router)
Language	TypeScript
Styling	Tailwind CSS
GitHub API	Octokit REST
Date Formatting	date-fns
Icons	Lucide React
Caching	ISR (revalidate: 300s)
Deployment	Vercel
Data Pipeline	Nexla Express
📁 Project Structure
text
github-pr-digest/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── github/route.ts       # GitHub API endpoint
│   │   │   └── deliver/route.ts      # Slack delivery endpoint
│   │   └── dashboard/
│   │       └── page.tsx              # Main dashboard page
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── PRTable.tsx           # PR table with pagination
│   │   │   ├── PRRow.tsx             # Individual PR row
│   │   │   ├── DeliverButton.tsx     # Slack delivery button
│   │   │   └── RefreshButton.tsx     # Manual refresh button
│   │   └── ui/
│   │       ├── Navbar.tsx            # Sticky navbar with backdrop blur
│   │       └── StatCard.tsx          # Metric stat cards
│   ├── lib/
│   │   ├── github.ts                 # Octokit API client
│   │   ├── transform.ts              # Data filtering & normalization
│   │   ├── cache.ts                  # ISR caching strategy
│   │   └── utils.ts                  # Utility helpers
│   └── types/
│       └── github.ts                 # TypeScript interfaces
├── .env.local                        # Environment variables (gitignored)
├── .gitignore
└── README.md
🚀 Local Setup
Prerequisites
Node.js 18+

A GitHub Personal Access Token with public_repo scope

Installation
bash
# 1. Clone the repository
git clone https://github.com/pritamapatra/github-pr-digest.git
cd github-pr-digest

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
Environment Variables
Create a .env.local file in the root:

text
# GitHub Configuration
GITHUB_PAT=your_github_personal_access_token
GITHUB_OWNER=vercel
GITHUB_REPO=next.js

# Slack (optional)
SLACK_WEBHOOK_URL=your_slack_webhook_url

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
Run Development Server
bash
npm run dev
# Open http://localhost:3000/dashboard
🌐 Deployment
This project is deployed on Vercel with automatic deployments from the main branch.

Live URL: https://github-pr-digest-fawn.vercel.app/dashboard

Deploy Your Own
[

Click the button above

Add environment variables (GITHUB_PAT, GITHUB_OWNER, GITHUB_REPO)

Deploy

📡 API Routes
Route	Method	Description
/api/github	GET	Fetches open PRs from GitHub API with ISR cache
/api/deliver	POST	Sends PR digest to configured Slack webhook
🔄 Implementation Log
Challenges & Solutions
Challenge	Solution
GitHub API rate limits (60 req/hr unauthenticated)	Used PAT authentication → 5,000 req/hr
Raw GitHub JSON has 100+ fields per PR	Nexla Flink SQL transform extracts only 6 needed fields
Nexla has no direct local file export sink	Used Nexla UI "Download Sample" from nexset preview panel
Stale data on dashboard reload	ISR with revalidate: 300 — fresh every 5 minutes
PAT accidentally shown in terminal	Immediately revoked and rotated token
💡 Reflections
Working with the Nexla Express platform was a genuinely impressive experience. The ability to:

Connect to any REST API using just a PAT credential

Auto-generate a Flink SQL transform from natural language

Preview and validate transformed data without writing a single line of custom code

...makes it immediately clear why Nexla is powerful for data engineering teams. The platform abstracts away the complexity of ETL pipelines while still giving full control over transformation logic. For a CSE role, the ability to demo this end-to-end flow — from raw API to clean, business-ready data — in under an hour is the real value proposition.

The biggest learning: Nexla's nexset concept (treating any data shape as a typed, shareable dataset) is a fundamentally cleaner abstraction than traditional pipeline tools. It makes debugging, monitoring, and handoff to downstream consumers much simpler.

📊 Success Metrics
Metric	Target	Achieved
Pipeline executes without errors	✅	✅ 1,908 records fetched
100% of delivered rows = open state	✅	✅ Verified in CSV sample
No blank critical fields	✅	✅ All 6 fields populated
No external custom code in Nexla	✅	✅ Native Flink SQL only
Dashboard live on public URL	✅	✅ Deployed on Vercel
👤 Author
Pritam Patra

GitHub: @pritamapatra

Assessment: Nexla CSE Take-Home — Option A (Nexla Express Application)

Submitted: June 14, 2026

Built with ❤️ for the Nexla Customer Success Engineer assessment