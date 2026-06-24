"use client";

import Link from "next/link";
import { timeAgo } from "@/lib/time-utils";
import type { DiscussionPost, UserVote } from "@/lib/discussion-types";
import type { VoteDirection } from "@/lib/vote-helpers";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { PostActionsMenu } from "./post-actions-menu";
import { useRouter } from "next/navigation";
import { CommentIcon } from "@/components/icons/comment-icon";

const CATEGORY_META: Record<string, { slug: string; bg: string; fg: string }> =
  {
    Chung: { slug: "chung", bg: "bg-sky-100", fg: "text-sky-600" },
    "Kỹ thuật": {
      slug: "ky-thuat",
      bg: "bg-violet-100",
      fg: "text-violet-600",
    },
    "Hỏi & Đáp": { slug: "hoi-dap", bg: "bg-amber-100", fg: "text-amber-600" },
    "Giới thiệu": {
      slug: "gioi-thieu",
      bg: "bg-green-100",
      fg: "text-green-600",
    },
    "Sản phẩm": { slug: "san-pham", bg: "bg-rose-100", fg: "text-rose-600" },
    "Kinh nghiệm": {
      slug: "kinh-nghiem",
      bg: "bg-teal-100",
      fg: "text-teal-600",
    },
    "Hoạt động": {
      slug: "hoat-dong",
      bg: "bg-orange-100",
      fg: "text-orange-600",
    },
  };

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

async function getIdToken() {
  const { auth } = await import("@/lib/firebase-client");
  return auth.currentUser?.getIdToken() ?? null;
}

interface PostCardProps {
  post: DiscussionPost;
  userVote?: UserVote;
  onArchived?: () => void;
}

export function PostCard({
  post,
  userVote: initialUserVote = null,
  onArchived,
}: PostCardProps) {
  const { requireAuth } = useAuth();
  const [userVote, setUserVote] = useState<UserVote>(initialUserVote);
  const [voteCount, setVoteCount] = useState(post.upvoteCount);
  const [loading, setLoading] = useState(false);
 const router = useRouter();
  useEffect(() => {
    setUserVote(initialUserVote);
  }, [initialUserVote]);
  useEffect(() => {
    setVoteCount(post.upvoteCount);
  }, [post.upvoteCount]);

  function handleVote(e: React.MouseEvent, direction: VoteDirection) {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(() => doVote(direction));
  }

  async function doVote(direction: VoteDirection) {
    if (loading) return;
    setLoading(true);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/discussions/${post.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ direction }),
      });
      const data = await res.json();
      if (res.ok) {
        setUserVote(data.vote ?? null);
        setVoteCount(data.score);
      }
    } finally {
      setLoading(false);
    }
  }

  const meta = CATEGORY_META[post.category] ?? {
    slug: "chung",
    bg: "bg-sky-100",
    fg: "text-sky-600",
  };
  const plainDesc = post.description ? stripHtml(post.description) : "";
  const isPending = post.status === "pending";

  return (
    <div className="group relative cursor-pointer rounded-xl bg-white px-4 py-3 my-1 transition-colors duration-150 hover:bg-[#f6f7f8]"
     onClick={() => router.push(`/discussions/${post.id}`)} >
      <div className="relative flex flex-col gap-2" >
        {/* ── Credit bar ── */}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-gray-500">
          <div className="flex flex-1 flex-wrap items-center gap-x-1.5 gap-y-1 min-w-0">
            {/* Category chip */}
            <span
              className={cn(
                "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
                meta.bg,
                meta.fg,
              )}
            >
              {meta.slug[0].toUpperCase()}
            </span>
            <span className={cn("font-semibold text-gray-800")}>
              p/{meta.slug}
            </span>
            {isPending && (
              <span className="flex-shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                Chờ duyệt
              </span>
            )}
            <span className="text-gray-400">•</span>
            <span>đăng bởi</span>

            {/* Author avatar */}
            {post.photoURL && !post.isAnonymous ? (
              <img
                src={post.photoURL}
                alt={post.author}
                className="h-4 w-4 flex-shrink-0 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-[8px] font-bold text-primary">
                {post.isAnonymous ? "?" : (post.authorInitials?.[0] ?? "?")}
              </span>
            )}

            <span className="max-w-[160px] truncate font-medium text-gray-700 sm:max-w-none">
              {post.isAnonymous ? "Ẩn danh" : post.author}
            </span>
            <span className="text-gray-400">•</span>
            <time className="flex-shrink-0 text-gray-500">
              {timeAgo(post.status === 'approved' && post.moderatedAt ? post.moderatedAt : post.createdAt)}
            </time>
          </div>
          <PostActionsMenu
            postId={post.id}
            creatorUid={post.uid}
            initialSaved={post.isSaved}
            onArchived={onArchived}
            className="relative z-20 flex-shrink-0"
          />
        </div>

        {/* ── Title ── */}
        <h2 className="text-base font-semibold leading-snug text-gray-900 group-hover:text-gray-700">
          {post.title}
        </h2>

        {/* ── Description ── */}
        {plainDesc && (
          <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
            {plainDesc}
          </p>
        )}

        {/* ── Action bar ── hidden for pending posts */}
        {!isPending && (
          <div className="relative z-10 flex items-center gap-2 pt-1">
            {/* Vote group pill */}
            <div className="flex items-center overflow-hidden rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700">
              <button
                onClick={(e) => handleVote(e, "up")}
                disabled={loading}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 transition-colors disabled:opacity-50 hover:bg-gray-50",
                  userVote === "up" && "text-primary",
                )}
              >
                <svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg">
                  {userVote === "up" ? (
                    <path d="M10 19a3.966 3.966 0 01-3.96-3.962V10.98H2.838a1.731 1.731 0 01-1.605-1.073 1.734 1.734 0 01.377-1.895L9.364.254a.925.925 0 011.272 0l7.754 7.759c.498.499.646 1.242.376 1.894-.27.652-.9 1.073-1.605 1.073h-3.202v4.058A3.965 3.965 0 019.999 19H10z" />
                  ) : (
                    <path d="M10 19a3.966 3.966 0 01-3.96-3.962V10.98H2.838a1.731 1.731 0 01-1.605-1.073 1.734 1.734 0 01.377-1.895L9.364.254a.925.925 0 011.272 0l7.754 7.759c.498.499.646 1.242.376 1.894-.27.652-.9 1.073-1.605 1.073h-3.202v4.058A3.965 3.965 0 019.999 19H10zM2.989 9.179H7.84v5.731c0 1.13.81 2.163 1.934 2.278a2.163 2.163 0 002.386-2.15V9.179h4.851L10 2.163 2.989 9.179z" />
                  )}
                </svg>
              </button>
              <span className={cn("px-1 tabular-nums", userVote === "up" ? "text-primary" : userVote === "down" ? "text-red-500" : "text-gray-700")}>
                {voteCount}
              </span>
              <button
                onClick={(e) => handleVote(e, "down")}
                disabled={loading}
                className={cn(
                  "flex items-center px-3 py-1.5 transition-colors disabled:opacity-50 hover:bg-gray-50",
                  userVote === "down" && "text-red-500",
                )}
              >
                <svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg">
                  {userVote === "down" ? (
                    <path d="M10 1a3.966 3.966 0 013.96 3.962V9.02h3.202c.706 0 1.335.42 1.605 1.073.27.652.122 1.396-.377 1.895l-7.754 7.759a.925.925 0 01-1.272 0l-7.754-7.76a1.734 1.734 0 01-.376-1.894c.27-.652.9-1.073 1.605-1.073h3.202V4.962A3.965 3.965 0 0110 1z" />
                  ) : (
                    <path d="M10 1a3.966 3.966 0 013.96 3.962V9.02h3.202c.706 0 1.335.42 1.605 1.073.27.652.122 1.396-.377 1.895l-7.754 7.759a.925.925 0 01-1.272 0l-7.754-7.76a1.734 1.734 0 01-.376-1.894c.27-.652.9-1.073 1.605-1.073h3.202V4.962A3.965 3.965 0 0110 1zm7.01 9.82h-4.85V5.09c0-1.13-.81-2.163-1.934-2.278a2.163 2.163 0 00-2.386 2.15v5.859H2.989l7.01 7.016 7.012-7.016z" />
                  )}
                </svg>
              </button>
            </div>

            {/* Comments pill */}
            <Link
              href={`/discussions/${post.id}#comments`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
            >
              <CommentIcon />
              <span>{post.commentCount} bình luận</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
