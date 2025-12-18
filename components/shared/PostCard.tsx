"use client";

import { useUserContext } from "@/context/AuthContext";
import { useState } from "react";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import PostStats from "./PostStats";
import Loader from "./Loader";

type PostCardProps = {
  post: any;
  adminActions?: React.ReactNode;
};

const PostCard = ({ post, adminActions }: PostCardProps) => {
  const [loading, setLoading] = useState(true);
  const [showAllTags, setShowAllTags] = useState(false);
  const dateString: string = post.$createdAt || post.createdAt;
  const timestamp: string = timeAgo(dateString);

  const { user, isAuthenticated } = useUserContext();
  if (!post.creator) return null;

  const tags = post.tags || [];
  const maxVisibleTags = 3;
  const hasMoreTags = tags.length > maxVisibleTags;
  const visibleTags = showAllTags ? tags : tags.slice(0, maxVisibleTags);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setLoading(false);
  };

  return (
    <div className="post-card">
      <div className="flex-between mb-3 sm:mb-4 md:mb-5 border-b pb-3 sm:pb-4 md:pb-5 border-dark-4">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.creator.$id || post.creator.id}`}>
            <img
              src={
                post?.creator?.imageUrl ||
                "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="rounded-full w-10 h-10 sm:w-12 sm:h-12 object-cover"
            />
          </Link>

          <div className="flex flex-col">
            <p className="small-semibold sm:base-medium lg:body-bold text-light-1">
              {post.creator.name}
            </p>
            <div className="flex-center gap-2 text-slate-500">
              <p className="tiny-medium sm:subtle-semibold lg:small-regular">
                {timestamp}
              </p>
              -
              <p className="tiny-medium sm:subtle-semibold lg:small-regular">
                {post.location}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Link
              href={`/update-post/${post.$id || post.id}`}
              className={`${
                user.id !== (post.creator.$id || post.creator.id) && "hidden"
              }`}
            >
              <img
                src="/assets/icons/edit.svg"
                alt="edit"
                width={18}
                height={18}
              />
            </Link>
          )}
          {adminActions}
        </div>
      </div>

      <Link href={`/posts/${post.$id || post.id}`}>
        <div className="relative w-full bg-dark-4 rounded-md overflow-hidden aspect-square max-h-[280px] sm:max-h-[280px] md:max-h-[360px] lg:max-h-[380px]">
          {loading && (
            <div className="absolute size-full inset-0 flex justify-center items-center">
              <Loader />
            </div>
          )}
          <img
            src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="post image"
            className={`w-full h-full object-cover ${
              loading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>

        <div className="small-medium lg:base-medium py-2 sm:py-2.5 md:py-3 border-t border-dark-4 mt-3 sm:mt-4 md:mt-5">
          <p>
            <span className="body-bold">{post.creator.username}</span> :{" "}
            <span className="font-extralight">{post.caption}</span>
          </p>
          {tags.length > 0 && (
            <div className="mt-2">
              <ul className="flex flex-wrap gap-1">
                {visibleTags.map((tag: string, idx: number) => (
                  <li key={`${tag}-${idx}`} className="text-light-4">
                    {tag ? `#${tag}` : ""}
                  </li>
                ))}
              </ul>
              {hasMoreTags && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowAllTags(!showAllTags);
                  }}
                  className="text-light-3 hover:text-light-1 text-xs mt-1"
                >
                  {showAllTags ? "show less" : "show more"}
                </button>
              )}
            </div>
          )}
        </div>
      </Link>

      <PostStats post={post} userId={user?.id || ""} />
    </div>
  );
};

export default PostCard;
