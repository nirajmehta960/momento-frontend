"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { timeAgo } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { useDeleteReview } from "@/lib/react-query/queriesAndMutation";
import { useToast } from "../ui/use-toast";
import { useState } from "react";
import { Trash2, Edit } from "lucide-react";
import DeleteReviewDialog from "./DeleteReviewDialog";

type ReviewCardProps = {
  review: any;
  onEdit?: (review: any) => void;
};

const ReviewCard = ({ review, onEdit }: ReviewCardProps) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { mutate: deleteReview } = useDeleteReview();

  const reviewUser = review.user || {};
  const isOwnReview = user.id === (reviewUser._id || reviewUser.id);

  const handleDelete = () => {
    setIsDeleting(true);
    deleteReview(review._id || review.id, {
      onSuccess: () => {
        toast({
          title: "Review deleted",
          description: "Your review has been deleted successfully.",
        });
        setIsDeleteDialogOpen(false);
      },
      onError: () => {
        toast({
          title: "Failed to delete review",
          description: "An error occurred. Please try again.",
        });
        setIsDeleting(false);
      },
    });
  };

  const renderStars = (rating: number) => {
    if (!rating) return null;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? "text-yellow-400" : "text-gray-500"}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      <DeleteReviewDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
      <div className="flex gap-3 p-4 border-b border-dark-4 last:border-b-0">
        <Link href={`/profile/${reviewUser._id || reviewUser.id}`}>
          <img
            src={reviewUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt={reviewUser.name || "User"}
            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
          />
        </Link>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/profile/${reviewUser._id || reviewUser.id}`}
                  className="base-medium text-light-1 hover:underline"
                >
                  {reviewUser.name || "Unknown User"}
                </Link>
                {review.rating && (
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                  </div>
                )}
              </div>
              <p className="small-regular text-light-2 mb-2">
                {timeAgo(review.createdAt)}
              </p>
              <p className="small-medium lg:base-regular text-light-1 whitespace-pre-wrap">
                {review.review}
              </p>
            </div>
            {isOwnReview && (
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(review)}
                    className="h-8 w-8 p-0 hover:bg-dark-4"
                  >
                    <Edit className="w-4 h-4 text-light-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isDeleting}
                  className="h-8 w-8 p-0 hover:bg-dark-4"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewCard;
