"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useUserContext } from "@/context/AuthContext";
import {
  useCreateReview,
  useUpdateReview,
} from "@/lib/react-query/queriesAndMutation";
import { useToast } from "../ui/use-toast";
import Loader from "./Loader";

type ReviewFormProps = {
  postId?: string;
  externalContentId?: string;
  editingReview?: any;
  onCancel?: () => void;
  onSuccess?: () => void;
};

const ReviewForm = ({
  postId,
  externalContentId,
  editingReview,
  onCancel,
  onSuccess,
}: ReviewFormProps) => {
  const { isAuthenticated, user } = useUserContext();
  const { toast } = useToast();
  const [review, setReview] = useState(editingReview?.review || "");
  const [rating, setRating] = useState(editingReview?.rating || 0);

  useEffect(() => {
    if (editingReview) {
      setReview(editingReview.review || "");
      setRating(editingReview.rating || 0);
    } else {
      setReview("");
      setRating(0);
    }
  }, [editingReview]);

  const { mutate: createReview, isPending: isCreating } = useCreateReview();
  const { mutate: updateReview, isPending: isUpdating } = useUpdateReview();

  if (!isAuthenticated) {
    return (
      <div className="p-4 border border-dark-4 rounded-lg bg-dark-2 text-center">
        <p className="text-light-3 mb-2">Sign in to leave a review</p>
        <Button
          onClick={() => (window.location.href = "/sign-in")}
          className="bg-white text-black hover:bg-gray-300"
        >
          Sign In
        </Button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!review.trim()) {
      toast({
        title: "Review required",
        description: "Please enter a review.",
      });
      return;
    }

    if (editingReview) {
      updateReview(
        {
          reviewId: editingReview._id || editingReview.id || "",
          comment: review.trim(),
          rating: rating || undefined,
        },
        {
          onSuccess: () => {
            toast({
              title: "Review updated",
              description: "Your review has been updated successfully.",
            });
            setReview("");
            setRating(0);
            onSuccess?.();
          },
          onError: () => {
            toast({
              title: "Failed to update review",
              description: "An error occurred. Please try again.",
            });
          },
        }
      );
    } else {
      createReview(
        {
          postId,
          externalContentId,
          review: review.trim(),
          rating: rating || undefined,
        },
        {
          onSuccess: () => {
            toast({
              title: "Review posted",
              description: "Your review has been posted successfully.",
            });
            setReview("");
            setRating(0);
            onSuccess?.();
          },
          onError: () => {
            toast({
              title: "Failed to post review",
              description: "An error occurred. Please try again.",
            });
          },
        }
      );
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl transition ${
              star <= rating
                ? "text-yellow-400"
                : "text-gray-500 hover:text-yellow-300"
            }`}
          >
            ★
          </button>
        ))}
        {rating > 0 && (
          <span className="small-regular text-light-3 ml-2">({rating}/5)</span>
        )}
      </div>
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border border-dark-4 rounded-lg bg-dark-2"
    >
      <div className="mb-3">
        <label className="small-medium text-light-1 mb-2 block">
          {editingReview ? "Edit Review" : "Write a Review"}
        </label>
        {renderStarRating()}
        <Textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your thoughts..."
          className="min-h-[100px] bg-dark-3 border-dark-4 text-white"
          disabled={isCreating || isUpdating}
        />
      </div>
      <div className="flex gap-2 justify-end">
        {editingReview && onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isCreating || isUpdating}
            className="hover:bg-dark-4"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isCreating || isUpdating || !review.trim()}
          className="bg-white text-black hover:bg-gray-300"
        >
          {isCreating || isUpdating ? (
            <div className="flex-center gap-2">
              <Loader />
              {editingReview ? "Updating..." : "Posting..."}
            </div>
          ) : editingReview ? (
            "Update Review"
          ) : (
            "Post Review"
          )}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
