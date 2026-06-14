"use client";

import { useState } from "react";
import { PRDigestSummary } from "@/types/github";
import { cn } from "@/lib/utils";
import { Send, Check, AlertCircle, Loader } from "lucide-react";

interface DeliverButtonProps {
  summary: PRDigestSummary;
}

type DeliverState = "idle" | "loading" | "success" | "error";

export default function DeliverButton({ summary }: DeliverButtonProps) {
  const [state, setState] = useState<DeliverState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDeliver() {
    if (state === "loading") return;

    setState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Delivery failed.");
      }

      setState("success");

      setTimeout(() => setState("idle"), 3000);
    } catch (error: unknown) {
      const err = error as { message?: string };
      setErrorMessage(err.message || "Something went wrong.");
      setState("error");

      setTimeout(() => {
        setState("idle");
        setErrorMessage("");
      }, 4000);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={handleDeliver}
        disabled={state === "loading" || state === "success"}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
          state === "idle" &&
            "bg-zinc-900 text-white hover:bg-zinc-700 active:bg-zinc-800 active:scale-95",
          state === "loading" &&
            "bg-zinc-200 text-zinc-400 cursor-not-allowed",
          state === "success" &&
            "bg-emerald-50 text-emerald-600 cursor-default",
          state === "error" &&
            "bg-red-50 text-red-500 hover:bg-red-100 active:scale-95"
        )}
      >
        {state === "idle" && (
          <>
            <Send size={14} strokeWidth={1.75} />
            Send to Slack
          </>
        )}
        {state === "loading" && (
          <>
            <Loader size={14} strokeWidth={1.75} className="animate-spin" />
            Sending...
          </>
        )}
        {state === "success" && (
          <>
            <Check size={14} strokeWidth={2} />
            Sent to Slack
          </>
        )}
        {state === "error" && (
          <>
            <AlertCircle size={14} strokeWidth={1.75} />
            Retry
          </>
        )}
      </button>

      {state === "error" && errorMessage && (
        <span className="text-xs text-red-400 max-w-xs text-right leading-snug">
          {errorMessage}
        </span>
      )}

      {state === "success" && (
        <span className="text-xs text-emerald-500 text-right">
          Digest delivered successfully
        </span>
      )}
    </div>
  );
}