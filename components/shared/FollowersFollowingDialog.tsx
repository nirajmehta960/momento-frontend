"use client";

import { Button } from "../ui/button";
import UserCard from "./UserCard";
import Loader from "./Loader";

type FollowersFollowingDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  type: "followers" | "following";
  users?: any[];
  isLoading?: boolean;
};

const FollowersFollowingDialog = ({
  isOpen,
  onClose,
  type,
  users = [],
  isLoading = false,
}: FollowersFollowingDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-2 rounded-lg p-6 w-full max-w-md mx-4 border border-dark-4 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white capitalize">
            {type === "followers" ? "Followers" : "Following"}
          </h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="hover:bg-dark-4 text-white"
          >
            ✕
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex-center py-8">
              <Loader />
            </div>
          ) : users.length > 0 ? (
            <div className="flex flex-col gap-3">
              {users.map((user: any) => (
                <UserCard
                  key={user._id || user.id}
                  user={{
                    $id: user._id || user.id,
                    id: user._id || user.id,
                    name: user.name || "",
                    username: user.username || "",
                    imageUrl: user.imageUrl || "",
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-light-3 text-center py-8">
              No {type === "followers" ? "followers" : "following"} yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersFollowingDialog;
