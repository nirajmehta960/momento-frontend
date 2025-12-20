"use client";

import Loader from "@/components/shared/Loader";
import { useGetLikedPosts } from "@/lib/react-query/queriesAndMutation";
import { useUserContext } from "@/context/AuthContext";
import Link from "next/link";
import { Heart } from "lucide-react";

const getLikesArray = (postLikes: any): string[] => {
  if (!postLikes || !Array.isArray(postLikes)) return [];
  return postLikes
    .map((like: any) => {
      if (typeof like === "string") {
        return like;
      }
      if (like && typeof like === "object") {
        return like?.$id || like?.id || like;
      }
      return null;
    })
    .filter((id: any) => id != null && id !== "") as string[];
};

const LikedPosts = () => {
  const { user } = useUserContext();
  const { data: likedPosts, isLoading } = useGetLikedPosts(user.id || "");

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  const posts =
    (likedPosts as any)?.documents ||
    (Array.isArray(likedPosts) ? likedPosts : []);

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">No liked posts yet</div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post: any) => (
        <Link
          key={post.$id || post.id}
          href={`/posts/${post.$id || post.id}`}
          className="relative aspect-square group cursor-pointer overflow-hidden"
        >
          <img
            src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="Post"
            className="w-full h-full object-cover"
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="flex items-center gap-6 text-white">
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 fill-white" />
                <span className="font-semibold">
                  {getLikesArray(post.likes).length}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default LikedPosts;
