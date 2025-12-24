"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";

import LikedPosts from "@/app/(momento)/profile/[id]/LikedPosts";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetUserById,
  useGetUserPosts,
  useSignOutAccount,
  useDeleteUserAccount,
  useFollowUser,
  useUnfollowUser,
  useGetFollowers,
  useGetFollowing,
} from "@/lib/react-query/queriesAndMutation";
import Loader from "@/components/shared/Loader";
import GridPostList from "@/components/shared/GridPostList";
import DeleteAccountDialog from "@/components/shared/DeleteAccountDialog";
import FollowersFollowingDialog from "@/components/shared/FollowersFollowingDialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Oops from "@/components/shared/Oops";
import { useToast } from "@/components/ui/use-toast";
import { Grid3x3, Heart, Edit, Trash2 } from "lucide-react";

interface StabBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({
  value,
  label,
  onClick,
}: StabBlockProps & { onClick?: () => void }) => (
  <div
    className={`flex items-center gap-1 ${
      onClick ? "cursor-pointer hover:opacity-80 transition" : ""
    }`}
    onClick={onClick}
  >
    <span className="font-semibold text-white">{value}</span>
    <span className="text-white ml-1">{label}</span>
  </div>
);

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

const Profile = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useUserContext();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);

  const { mutate: signOutMutation, isSuccess } = useSignOutAccount();
  const { signOut } = useUserContext();
  const { mutateAsync: deleteAccount, isPending: isDeleting } =
    useDeleteUserAccount();

  useEffect(() => {
    if (isSuccess) {
      signOut().then(() => {
        router.push("/sign-in");
      });
    }
  }, [isSuccess, router, signOut]);

  const userId = Array.isArray(id) ? id[0] : id || "";
  // Ensure userId is valid before making API calls
  const validUserId = userId && userId !== "undefined" && userId.trim() !== "" ? userId : "";
  const { data: currentUser } = useGetUserById(validUserId);
  const { data: userPosts } = useGetUserPosts(validUserId);
  const { data: followers = [], isLoading: isLoadingFollowers } =
    useGetFollowers(validUserId);
  const { data: following = [], isLoading: isLoadingFollowing } =
    useGetFollowing(validUserId);
  const { mutate: followUser, isPending: isFollowing } = useFollowUser();
  const { mutate: unfollowUser, isPending: isUnfollowing } = useUnfollowUser();

  const isFollowingUser =
    isAuthenticated &&
    Array.isArray(followers) &&
    followers.some(
      (f: any) =>
        (f._id || f.$id || f.id) === (user.id || user._id || user.$id)
    );

  const handleDeleteAccount = async () => {
    try {
      if (!validUserId) {
        toast({
          title: "Error",
          description: "Invalid user ID",
        });
        return;
      }
      await deleteAccount(validUserId);
      toast({
        title: "Account deleted successfully",
        description: "Your account has been permanently deleted.",
      });
      await signOut();
      router.push("/sign-in");
    } catch (error) {
      toast({
        title: "Failed to delete account",
        description:
          "An error occurred while deleting your account. Please try again.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleFollow = () => {
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }
    if (!validUserId) {
      toast({
        title: "Error",
        description: "Invalid user ID",
      });
      return;
    }
    followUser(validUserId, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "You are now following this user.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Failed to follow",
          description:
            error?.response?.data?.message ||
            "Failed to follow user. Please try again.",
        });
      },
    });
  };

  const handleUnfollow = () => {
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }
    if (!validUserId) {
      toast({
        title: "Error",
        description: "Invalid user ID",
      });
      return;
    }
    unfollowUser(validUserId, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "You have unfollowed this user.",
        });
      },
      onError: () => {
        toast({
          title: "Failed to unfollow",
          description: "Failed to unfollow user. Please try again.",
        });
      },
    });
  };

  if (!currentUser)
    return (
      <div className="flex-center w-full h-screen">
        <Loader />
      </div>
    );

  const posts =
    (userPosts as any)?.documents ||
    (Array.isArray(userPosts) ? userPosts : []);
  
  // Normalize IDs for comparison
  const currentUserId = (currentUser as any)?._id || (currentUser as any)?.$id || (currentUser as any)?.id;
  const loggedInUserId = user?.id || user?._id || user?.$id;
  
  const isOwnProfile =
    isAuthenticated &&
    currentUserId &&
    loggedInUserId &&
    currentUserId === loggedInUserId;
  
  const limitedPosts = isAuthenticated ? posts : posts.slice(0, 2);

  const handleFollowersClick = () => {
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }
    setFollowersDialogOpen(true);
  };

  const handleFollowingClick = () => {
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }
    setFollowingDialogOpen(true);
  };

  return (
    <>
      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
      />
      <div className="profile-container">
        <div className="max-w-4xl mx-auto px-4 py-8 w-full">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-8">
            {/* Avatar */}
            <div className="flex justify-center md:justify-start">
              <div className="w-[150px] h-[150px] rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                <img
                  src={
                    (currentUser as any).imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {/* Name and Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold text-white mb-1">
                    {(currentUser as any).name}
                  </h1>
                  <p className="text-slate-400">
                    @{(currentUser as any).username}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!isOwnProfile && (
                    <>
                      {isAuthenticated ? (
                        <>
                          <Button
                            onClick={
                              isFollowingUser ? handleUnfollow : handleFollow
                            }
                            disabled={isFollowing || isUnfollowing}
                            variant="outline"
                            size="sm"
                            className="gap-2 bg-transparent text-light-1 border border-light-1 hover:bg-primary-500 hover:border-primary-500 hover:text-white transition"
                          >
                            {isFollowingUser ? "Unfollow" : "Follow"}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => router.push("/sign-in")}
                            variant="outline"
                            size="sm"
                            className="gap-2 bg-transparent text-light-1 border border-light-1 hover:bg-primary-500 hover:border-primary-500 hover:text-white transition"
                          >
                            Follow
                          </Button>
                        </>
                      )}
                    </>
                  )}

                  {isOwnProfile && (
                    <>
                      <Link
                        href={`/update-profile/${
                          (currentUser as any).$id ||
                          (currentUser as any).id ||
                          validUserId
                        }`}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 bg-transparent text-light-1 border border-light-1 hover:bg-primary-500 hover:border-primary-500 hover:text-white transition"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Profile
                        </Button>
                      </Link>
                      <Button
                        onClick={() => setIsDeleteDialogOpen(true)}
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent text-light-1 border border-light-1 hover:bg-primary-500 hover:border-primary-500 hover:text-white transition"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mb-6">
                <StatBlock value={posts.length} label="Posts" />
                <StatBlock
                  value={Array.isArray(followers) ? followers.length : 0}
                  label="Followers"
                  onClick={handleFollowersClick}
                />
                <StatBlock
                  value={Array.isArray(following) ? following.length : 0}
                  label="Following"
                  onClick={handleFollowingClick}
                />
              </div>

              {/* Bio */}
              {(currentUser as any).bio && (
                <p className="text-white">{(currentUser as any).bio}</p>
              )}
            </div>
          </div>

          {/* Tabs */}
          {isOwnProfile && validUserId && (
            <div className="w-full border-t border-dark-4">
              <div className="flex justify-center">
                <Link
                  href={`/profile/${validUserId}`}
                  className={`flex items-center gap-2 px-6 py-3 border-t-2 transition-colors ${
                    pathname === `/profile/${validUserId}`
                      ? "border-white text-white"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <Grid3x3 className="h-4 w-4" />
                  Posts
                </Link>
                <Link
                  href={`/profile/${validUserId}/liked-posts`}
                  className={`flex items-center gap-2 px-6 py-3 border-t-2 transition-colors ${
                    pathname === `/profile/${validUserId}/liked-posts`
                      ? "border-white text-white"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  Liked Posts
                </Link>
              </div>
            </div>
          )}

          {/* Posts Grid */}
          <div className="mt-6">
            {pathname === `/profile/${validUserId}/liked-posts` ? (
              isOwnProfile ? (
                <LikedPosts />
              ) : null
            ) : (
              <>
                {limitedPosts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1">
                    {limitedPosts.map((post: any) => (
                      <Link
                        key={post.$id || post.id}
                        href={`/posts/${post.$id || post.id}`}
                        className="relative aspect-square group cursor-pointer overflow-hidden"
                      >
                        <img
                          src={
                            post.imageUrl ||
                            "/assets/icons/profile-placeholder.svg"
                          }
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
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    No posts yet
                  </div>
                )}
                {!isAuthenticated && posts.length > 2 && (
                  <div className="flex-center flex-col gap-4 mt-8 p-6 border border-dark-4 rounded-lg bg-dark-2">
                    <p className="text-light-1 base-medium">
                      Sign in to see more posts
                    </p>
                    <Button
                      onClick={() => router.push("/sign-in")}
                      className="bg-white text-black hover:bg-gray-300"
                    >
                      Sign In
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <FollowersFollowingDialog
        isOpen={followersDialogOpen}
        onClose={() => setFollowersDialogOpen(false)}
        type="followers"
        users={Array.isArray(followers) ? followers : []}
        isLoading={isLoadingFollowers}
      />
      <FollowersFollowingDialog
        isOpen={followingDialogOpen}
        onClose={() => setFollowingDialogOpen(false)}
        type="following"
        users={Array.isArray(following) ? following : []}
        isLoading={isLoadingFollowing}
      />
    </>
  );
};

export default Profile;
