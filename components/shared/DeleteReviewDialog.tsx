"use client";

import { Button } from "../ui/button";

type DeleteReviewDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

const DeleteReviewDialog = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteReviewDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-2 rounded-lg p-6 w-full max-w-md mx-4 border border-dark-4">
        <h2 className="text-xl font-bold text-white mb-2">Delete Review</h2>
        <p className="text-light-2 mb-4">
          Are you sure you want to delete this review? This action cannot be
          undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="bg-dark-3 hover:bg-dark-1 text-light-1 border border-dark-4"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-[#0095F6] hover:bg-[#0066CC] text-white"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteReviewDialog;
