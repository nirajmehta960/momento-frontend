"use client";

import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import Loader from "./Loader";
import { useState } from "react";

type ReviewListProps = {
  postId?: string;
  externalContentId?: string;
  reviews?: any[];
  isLoading?: boolean;
};

const ReviewList = ({
  postId,
  externalContentId,
  reviews = [],
  isLoading = false,
}: ReviewListProps) => {
  const [editingReview, setEditingReview] = useState<any>(null);

  return (
    <div className="w-full">
      <h3 className="h3-bold md:h2-bold text-light-1 mb-4">
        Reviews ({isLoading ? "..." : reviews.length})
      </h3>

      <ReviewForm
        postId={postId}
        externalContentId={externalContentId}
        editingReview={editingReview}
        onCancel={() => setEditingReview(null)}
        onSuccess={() => setEditingReview(null)}
      />

      <div className="mt-6">
        {isLoading ? (
          <div className="flex-center py-8">
            <Loader />
          </div>
        ) : reviews.length > 0 ? (
          <div className="border border-dark-4 rounded-lg bg-dark-2 divide-y divide-dark-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id || review.id}
                review={review}
                onEdit={setEditingReview}
              />
            ))}
          </div>
        ) : (
          <p className="text-light-3 text-center py-8">
            No reviews yet. Be the first to review!
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewList;
