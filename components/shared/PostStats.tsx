"use client";

import { useUserContext } from "@/context/AuthContext";
import {
  useDeleteSavedPost,
  useGetCurrentUser,
  useLikePost,
  useSavePost,
} from "@/lib/react-query/queriesAndMutation";
import { checkIsLiked } from "@/lib/utils";
import React, { useEffect, useState } from "react";

type PostStatsProps = {
  post?: any;
  userId: string;
};
const PostStats = ({ post, userId }: PostStatsProps) => {
  const { isAuthenticated } = useUserContext();

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

  const likesList = getLikesArray(post?.likes);
  const [likes, setLikes] = useState<string[]>(likesList);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const newLikesList = getLikesArray(post?.likes);
    setLikes(newLikesList);
  }, [post?.likes]);

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost, isPending: isSaving } = useSavePost();
  const { mutate: deleteSavedPost, isPending: isDeleting } =
    useDeleteSavedPost();

  const { data: currentUser } = useGetCurrentUser();

  const savedPostRecord = (currentUser as any)?.save?.find(
    (record: any) =>
      (record.post.$id || record.post.id) === (post?.$id || post?.id)
  );

  useEffect(() => {
    setIsSaved(savedPostRecord ? true : false);
  }, [currentUser, savedPostRecord]);

  const handleLikePost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuthenticated) {
      let newLikes = [...likes];

      const hasLiked = newLikes.includes(userId);

      if (hasLiked) {
        newLikes = newLikes.filter((id) => id !== userId);
      } else {
        newLikes.push(userId);
      }

      setLikes(newLikes);
      const postId = post?.$id || post?.id || "";
      if (postId) {
        likePost(postId, {
          onSuccess: (data) => {
            if (data?.likes) {
              setLikes(data.likes);
            }
          },
        });
      }
    } else {
      window.location.href = "/sign-in";
    }
  };

  const handleSavePost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuthenticated) {
      const postId = post?.$id || post?.id || "";
      if (!postId) return;

      if (savedPostRecord) {
        const saveId = savedPostRecord._id || savedPostRecord.$id;
        if (saveId) {
          deleteSavedPost(saveId, {
            onSuccess: () => {
              setIsSaved(false);
            },
          });
        }
      } else {
        savePost(postId, {
          onSuccess: () => {
            setIsSaved(true);
          },
        });
      }
    } else {
      window.location.href = "/sign-in";
    }
  };

  return (
    <div className="flex justify-between items-center z-20 mt-2">
      <div className="flex gap-2 mr-5">
        <img
          src={`${
            checkIsLiked(likes, userId)
              ? "/assets/icons/liked.svg"
              : "/assets/icons/like.svg"
          }`}
          alt="like"
          width={20}
          height={20}
          onClick={handleLikePost}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">{likes.length}</p>
      </div>

      <div className="flex gap-2 ">
        <img
          src={`${
            isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"
          }`}
          alt="save"
          width={20}
          height={20}
          onClick={handleSavePost}
          className="cursor-pointer"
        />
      </div>
    </div>
  );
};

export default PostStats;
