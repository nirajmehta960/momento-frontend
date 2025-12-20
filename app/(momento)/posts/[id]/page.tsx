"use client";

import { useState } from "react";
import Loader from "@/components/shared/Loader";
import PostStats from "@/components/shared/PostStats";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import {
  useDeletePost,
  useGetPostById,
  useGetReviewsByPost,
} from "@/lib/react-query/queriesAndMutation";
import ReviewList from "@/components/shared/ReviewList";
import DeletePostDialog from "@/components/shared/DeletePostDialog";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

const PostDetails = () => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { id } = useParams();
  const postId = Array.isArray(id) ? id[0] : id || "";
  const { data: post, isPending, isError, error } = useGetPostById(postId);
  const { data: reviewsData, isLoading: isLoadingReviews } =
    useGetReviewsByPost(postId);
  const reviews =
    (reviewsData as any)?.documents ||
    (Array.isArray(reviewsData) ? reviewsData : []);

  const { user, isAuthenticated } = useUserContext();

  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();

  const handleDeleteClick = () => {
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (postId && post && (post as any).imageId) {
      deletePost(
        { postId: postId, imageId: (post as any).imageId },
        {
          onSuccess: () => {
            router.push("/");
          },
        }
      );
    }
  };

  if (isError) {
    return (
      <div className="post_details-container">
        <div className="post_details-card">
          <div className="flex-center flex-col gap-4 p-10">
            <p className="text-light-1 text-center">
              {(error as any)?.response?.data?.message || "Post not found"}
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              Go Back Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="post_details-container">
      {isPending ? (
        <Loader />
      ) : !post ? (
        <div className="post_details-card">
          <div className="flex-center flex-col gap-4 p-10">
            <p className="text-light-1 text-center">Post not found</p>
            <Button onClick={() => router.push("/")} variant="outline">
              Go Back Home
            </Button>
          </div>
        </div>
      ) : (
        <div className="post_details-card ">
          <div className="post_details-img-wrapper">
            <img
              src={(post as any)?.imageUrl}
              alt="creator"
              className="post_details-img"
            />
          </div>
          <div className="post_details-info">
            <div className="flex-between w-full ">
              <Link
                href={`/profile/${
                  (post as any)?.creator?.$id || (post as any)?.creator?.id
                }`}
                className="flex items-center gap-3"
              >
                <img
                  src={
                    (post as any)?.creator?.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="post"
                  className="rounded-full w-8 h-8 lg:w-12 lg:h-12 object-contain"
                />

                <div className="flex flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {(post as any)?.creator?.name}
                  </p>
                  <div className="flex items-center flex-wrap gap-2 text-slate-400">
                    <p className="subtle-semibold lg:small-regular">
                      {timeAgo(
                        (post as any)?.$createdAt || (post as any)?.createdAt
                      )}
                      ,
                    </p>
                    <p className="subtle-semibold lg:small-regular">
                      {(post as any)?.location}
                    </p>
                  </div>
                </div>
              </Link>

              {isAuthenticated &&
                user.id ===
                  ((post as any)?.creator?.$id ||
                    (post as any)?.creator?.id) && (
                  <div className="flex-center gap-3">
                    <Link
                      href={`/update-post/${
                        (post as any)?.$id || (post as any)?.id
                      }`}
                    >
                      <img
                        src="/assets/icons/edit.svg"
                        alt=""
                        width={18}
                        height={18}
                      />
                    </Link>
                    <Button
                      onClick={handleDeleteClick}
                      variant={`ghost`}
                      className="ghost_details-delete_btn"
                    >
                      <img
                        src="/assets/icons/delete.svg"
                        alt="delete"
                        width={20}
                        height={20}
                      />
                    </Button>
                  </div>
                )}
            </div>

            <hr className="border w-full border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{(post as any)?.caption}</p>
              {(post as any)?.tags?.length > 0 && (
                <ul className="flex flex-wrap gap-1 mt-2">
                  {(post as any)?.tags?.map((tag: string, idx: number) => (
                    <li key={`${tag}-${idx}`} className="text-light-3">
                      {tag ? `#${tag}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="w-full">
              <PostStats post={post as any} userId={user?.id || ""} />
            </div>

            <div className="w-full mt-6 pt-6 border-t border-dark-4/80">
              <ReviewList
                postId={postId}
                reviews={reviews}
                isLoading={isLoadingReviews}
              />
            </div>
          </div>
        </div>
      )}
      <DeletePostDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default PostDetails;
