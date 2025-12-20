"use client";

import {
  useGetAllUsersAdmin,
  useDeleteUserAdmin,
  useDeletePostAdmin,
} from "@/lib/react-query/queriesAndMutation";
import { useGetRecentPosts } from "@/lib/react-query/queriesAndMutation";
import { useUserContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import PostCard from "@/components/shared/PostCard";
import UserCard from "@/components/shared/UserCard";
import { Trash2, Users, FileText, Shield } from "lucide-react";
import DeleteAccountDialog from "@/components/shared/DeleteAccountDialog";

const AdminDashboard = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useUserContext();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"users" | "posts">("users");
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<{
    postId: string;
    imageId?: string;
  } | null>(null);

  const { data: allUsers, isLoading: isLoadingUsers } = useGetAllUsersAdmin();
  const { data: allPosts, isPending: isLoadingPosts } = useGetRecentPosts();
  const posts =
    (allPosts as any)?.documents || (Array.isArray(allPosts) ? allPosts : []);
  const { mutate: deleteUser, isPending: isDeletingUser } =
    useDeleteUserAdmin();
  const { mutate: deletePost, isPending: isDeletingPost } =
    useDeletePostAdmin();

  useEffect(() => {
    if (!isAuthLoading && (!isAuthenticated || user.role !== "ADMIN")) {
      router.replace("/");
    }
  }, [isAuthenticated, isAuthLoading, user.role, router]);

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;

    deleteUser(userToDelete, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "User account deleted successfully.",
        });
        setUserToDelete(null);
      },
      onError: (error: any) => {
        toast({
          title: "Failed to delete user",
          description:
            error?.response?.data?.message ||
            "An error occurred. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const handleDeletePost = (postId: string, imageId?: string) => {
    setPostToDelete({ postId, imageId });
  };

  const confirmDeletePost = () => {
    if (!postToDelete) return;

    deletePost(postToDelete, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Post deleted successfully.",
        });
        setPostToDelete(null);
      },
      onError: (error: any) => {
        toast({
          title: "Failed to delete post",
          description:
            error?.response?.data?.message ||
            "An error occurred. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  if (!isAuthenticated || user.role !== "ADMIN") {
    return null;
  }

  const users = allUsers || [];
  return (
    <div className="admin-container">
      <div className="flex-between w-full max-w-5xl mb-6">
        <div className="flex gap-2 items-center">
          <Shield className="w-9 h-9 text-yellow-500" />
          <h2 className="h3-bold md:h2-bold text-left">Admin Dashboard</h2>
        </div>
      </div>

      <div className="flex gap-2 mb-6 w-full max-w-5xl">
        <Button
          onClick={() => setActiveTab("users")}
          className={`flex-1 ${
            activeTab === "users"
              ? "bg-white text-black hover:bg-gray-300"
              : "bg-dark-4 text-light-1 hover:bg-gray-800"
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          All Users ({users.length})
        </Button>
        <Button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 ${
            activeTab === "posts"
              ? "bg-white text-black hover:bg-gray-300"
              : "bg-dark-4 text-light-1 hover:bg-gray-800"
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          All Posts ({posts.length})
        </Button>
      </div>

      {activeTab === "users" && (
        <div className="w-full max-w-5xl">
          {isLoadingUsers ? (
            <div className="flex-center w-full py-10">
              <Loader />
            </div>
          ) : users.length === 0 ? (
            <p className="text-light-3 text-center py-10">No users found</p>
          ) : (
            <div className="user-grid">
              {users.map((userItem: any) => (
                <div key={userItem._id || userItem.id} className="relative">
                  <UserCard user={userItem} />
                  {userItem._id !== user.id && (
                    <Button
                      onClick={() =>
                        handleDeleteUser(userItem._id || userItem.id)
                      }
                      variant="ghost"
                      className="absolute top-2 right-2 p-2 hover:bg-red-500/20 rounded-full"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                  {userItem.role && (
                    <span
                      className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold ${
                        userItem.role === "ADMIN"
                          ? "bg-yellow-500 text-black"
                          : "bg-gray-500 text-white"
                      }`}
                    >
                      {userItem.role}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "posts" && (
        <div className="w-full max-w-5xl">
          {isLoadingPosts ? (
            <div className="flex-center w-full py-10">
              <Loader />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-light-3 text-center py-10">No posts found</p>
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full 2xl:px-10 lg:px-6 md:px-5 sm:px-2">
              {posts.map((post: any) => (
                <li
                  key={post.$id || post.id}
                  className="relative flex justify-center w-full"
                >
                  <div className="relative w-full flex justify-center">
                    <PostCard
                      post={post}
                      adminActions={
                        <Button
                          onClick={() =>
                            handleDeletePost(post.$id || post.id, post.imageId)
                          }
                          variant="ghost"
                          className="p-2 hover:bg-red-500/20 rounded-full"
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <DeleteAccountDialog
        isOpen={userToDelete !== null}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDeleteUser}
        isLoading={isDeletingUser}
        title="Delete User Account"
        description="Are you sure you want to delete this user account? This action cannot be undone."
      />

      <DeleteAccountDialog
        isOpen={postToDelete !== null}
        onClose={() => setPostToDelete(null)}
        onConfirm={confirmDeletePost}
        isLoading={isDeletingPost}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        buttonText="Delete Post"
      />
    </div>
  );
};

export default AdminDashboard;
