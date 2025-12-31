"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useUserContext } from "@/context/AuthContext";
import {
  createUserAccount,
  signInAccount,
  signOutAccount,
  getCurrentUser,
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
  uploadProfileImage,
  getRecentPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getUserPosts,
  getLikedPosts,
  savePost,
  deleteSavedPost,
  getSavedPosts,
  createReview,
  updateReview,
  deleteReview,
  getPostReviews,
  getExternalReviews,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getMessagableUsers,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getInfinitePosts,
  searchPosts,
  searchExternal,
  getExternalDetails,
  deleteUserAccount,
  getAllUsersAdmin,
  deleteUserAdmin,
  deletePostAdmin,
  getReviewsByPost,
  getReviewsByExternalContent,
  getChatHistory,
  sendMessage,
  getUserConversation,
  sendUserMessage,
  getConversationPartners,
  getUnreadMessageCount,
  markConversationAsRead,
} from "@/lib/api/client";
import type {
  INewUser,
  ISignIn,
  IUpdateUser,
  INewPost,
  IUpdatePost,
  INewReview,
  IUpdateReview,
} from "@/types";
import { QUERY_KEYS } from "./queryKeys";

// ============================================================
// AUTHENTICATION MUTATIONS
// ============================================================

// useMutation - Create user account (signup)
export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });
};

// useMutation - Sign in user (prefetches GET_CURRENT_USER with returned data)
export const useSignInAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: ISignIn) => signInAccount(user),
    onSuccess: (data) => {
      // Prefetch current user query with returned data for instant access
      if (data) {
        queryClient.setQueryData([QUERY_KEYS.GET_CURRENT_USER], data);
      }
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

// useMutation - Sign out user (clears all cache on success)
export const useSignOutAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signOutAccount,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

// ============================================================
// USER QUERIES
// ============================================================

// useQuery - Get current authenticated user from session
export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

// useQuery - Get user by ID
export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_USER_BY_ID(userId),
    queryFn: () => {
      if (!userId || userId === "undefined" || userId.trim() === "") {
        throw new Error("User ID is required");
      }
      return getUserById(userId);
    },
    enabled: !!userId && userId !== "undefined" && userId.trim() !== "",
  });
};

// useQuery - Get all users (optional limit)
export const useGetUsers = (limit?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: () => getUsers(limit ? { limit } : undefined),
  });
};

// ============================================================
// USER MUTATIONS
// ============================================================

// useMutation - Update user (invalidates current user and user by ID on success)
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: IUpdateUser) => updateUser(user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [
          QUERY_KEYS.GET_USER_BY_ID,
          (data as any)?.$id || (data as any)?.id,
        ],
      });
    },
  });
};

// useMutation - Delete user (clears all cache on success)
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

// useMutation - Upload profile image (invalidates current user on success)
export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

// ============================================================
// POST QUERIES
// ============================================================

// useQuery - Get recent posts (with optional limit, skip, sortBy params)
export const useGetRecentPosts = (params?: {
  limit?: number;
  skip?: number;
  sortBy?: string;
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POSTS, params],
    queryFn: () => getRecentPosts(params),
  });
};

// useQuery - Get post by ID
export const useGetPostById = (postId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_POST_BY_ID(postId),
    queryFn: () => getPostById(postId),
    enabled: !!postId,
    retry: 1,
    retryOnMount: false,
  });
};

// useQuery - Get posts by user ID
export const useGetUserPosts = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_USER_POSTS(userId),
    queryFn: () => {
      if (!userId || userId === "undefined" || userId.trim() === "") {
        throw new Error("User ID is required");
      }
      return getUserPosts(userId);
    },
    enabled: !!userId && userId !== "undefined" && userId.trim() !== "",
  });
};

// useQuery - Get posts liked by user
export const useGetLikedPosts = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POSTS, "liked", userId],
    queryFn: () => getLikedPosts(userId),
    enabled: !!userId,
  });
};

// useInfiniteQuery - Get posts with infinite scroll pagination
export const useGetPosts = (sortBy: string = "latest") => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS, sortBy],
    queryFn: ({ pageParam }) => getInfinitePosts({ pageParam, sortBy }) as any,
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      if (lastPage && lastPage.documents.length === 0) {
        return undefined;
      }
      if (lastPage && lastPage.documents.length < 10) {
        return undefined;
      }
      return allPages.length;
    },
    initialPageParam: 0,
  });
};

// useQuery - Search posts by search term
export const useSearchPosts = (searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => searchPosts(searchTerm),
    enabled: !!searchTerm,
  });
};

// useQuery - Search external content (Unsplash, etc.)
export const useSearchExternal = (query: string, page?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_EXTERNAL, query, page],
    queryFn: () => searchExternal(query, page),
    enabled: !!query,
  });
};

// useQuery - Get external content details
export const useGetExternalDetails = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_EXTERNAL_DETAILS(id),
    queryFn: () => getExternalDetails(id),
    enabled: !!id,
  });
};

// useMutation - Delete user account (clears all cache on success)
export const useDeleteUserAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteUserAccount(userId),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

// ============================================================
// POST MUTATIONS
// ============================================================

// useMutation - Create post (invalidates GET_RECENT_POSTS on success)
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
      });
    },
  });
};

// useMutation - Update post (invalidates all post-related queries on success)
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePost,
    onSuccess: (data) => {
      const postId = (data as any)?._id || (data as any)?.$id;
      // Invalidate all post queries
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      // Invalidate specific post
      if (postId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_POST_BY_ID(postId),
        });
      }
      // Invalidate user posts if creator ID is available
      const creator = (data as any)?.creator;
      if (creator?._id || creator?.id) {
        const creatorId = creator._id || creator.id;
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_USER_POSTS(creatorId),
        });
      }
    },
  });
};

// useMutation - Delete post (invalidates GET_RECENT_POSTS on success)
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, imageId }: { postId: string; imageId?: string }) =>
      deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
      });
    },
  });
};

// useMutation - Like/unlike post (optimistically updates cache)
export const useLikePost = () => {
  const queryClient = useQueryClient();
  const { user } = useUserContext();
  return useMutation({
    mutationFn: ({
      postId,
      likesArray,
    }: {
      postId: string;
      likesArray: string[];
    }) => likePost(postId, likesArray),
    onMutate: async ({ postId, likesArray }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.GET_POST_BY_ID(postId),
      });

      // Snapshot previous value
      const previousPost = queryClient.getQueryData(
        QUERY_KEYS.GET_POST_BY_ID(postId)
      );

      // Optimistically update post likes
      queryClient.setQueryData(
        QUERY_KEYS.GET_POST_BY_ID(postId),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            likes: likesArray,
          };
        }
      );

      return { previousPost };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData(
          QUERY_KEYS.GET_POST_BY_ID(variables.postId),
          context.previousPost
        );
      }
    },
    onSuccess: (data, variables) => {
      const postId =
        (data as any)?.$id || (data as any)?.id || (data as any)?._id || variables.postId;
      
      // Invalidate to sync with server (Socket.IO will also update in real-time)
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_POST_BY_ID(postId),
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

// ============================================================
// SAVE MUTATIONS
// ============================================================

// useMutation - Save post (invalidates GET_RECENT_POSTS, GET_POSTS, and GET_CURRENT_USER on success)
export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, userId }: { postId: string; userId: string }) =>
      savePost(postId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

// useMutation - Unsave post (invalidates GET_RECENT_POSTS, GET_POSTS, and GET_CURRENT_USER on success)
export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => deleteSavedPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

// useQuery - Get saved posts for user
export const useGetSavedPosts = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_SAVED_POSTS(userId),
    queryFn: () => getSavedPosts(userId),
    enabled: !!userId,
  });
};

// ============================================================
// REVIEW QUERIES
// ============================================================

// useQuery - Get reviews for a post
export const useGetPostReviews = (postId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_POST_REVIEWS(postId),
    queryFn: () => getPostReviews(postId),
    enabled: !!postId,
  });
};

// useQuery - Get reviews by post (alias, forces refetch)
export const useGetReviewsByPost = (postId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_REVIEWS_BY_POST(postId),
    queryFn: () => getReviewsByPost(postId),
    enabled: !!postId,
    staleTime: 0,
    refetchOnMount: true,
  });
};

// useQuery - Get reviews for external content
export const useGetExternalReviews = (externalContentId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_EXTERNAL_REVIEWS(externalContentId),
    queryFn: () => getExternalReviews(externalContentId),
    enabled: !!externalContentId,
  });
};

// useQuery - Get reviews by external content (alias)
export const useGetReviewsByExternalContent = (externalContentId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_REVIEWS_BY_EXTERNAL(externalContentId),
    queryFn: () => getReviewsByExternalContent(externalContentId),
    enabled: !!externalContentId,
  });
};

// ============================================================
// REVIEW MUTATIONS
// ============================================================

// useMutation - Create review (invalidates review queries on success)
export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: (data) => {
      // Check for post (can be object or ID)
      const post = (data as any)?.post;
      const postId = typeof post === "string" ? post : post?._id || post?.id;
      const externalContentId = (data as any)?.externalContentId;

      if (postId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_REVIEWS_BY_POST(postId),
        });
      }
      if (externalContentId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_REVIEWS_BY_EXTERNAL(externalContentId),
        });
      }
    },
  });
};

// useMutation - Update review (invalidates review queries on success)
export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateReview,
    onSuccess: (data) => {
      // Check for post (can be object or ID)
      const post = (data as any)?.post;
      const postId = typeof post === "string" ? post : post?._id || post?.id;
      const externalContentId = (data as any)?.externalContentId;

      if (postId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_REVIEWS_BY_POST(postId),
        });
      }
      if (externalContentId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_REVIEWS_BY_EXTERNAL(externalContentId),
        });
      }
    },
  });
};

// useMutation - Delete review (invalidates review queries on success)
export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_REVIEWS_BY_POST],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_REVIEWS_BY_EXTERNAL],
      });
    },
  });
};

// ============================================================
// FOLLOW QUERIES
// ============================================================

// useQuery - Get followers of a user
export const useGetFollowers = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_FOLLOWERS(userId),
    queryFn: () => {
      if (!userId || userId === "undefined" || userId.trim() === "") {
        throw new Error("User ID is required");
      }
      return getFollowers(userId);
    },
    enabled: !!userId && userId !== "undefined" && userId.trim() !== "",
  });
};

// useQuery - Get users that a user is following
export const useGetFollowing = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_FOLLOWING(userId),
    queryFn: () => {
      if (!userId || userId === "undefined" || userId.trim() === "") {
        throw new Error("User ID is required");
      }
      return getFollowing(userId);
    },
    enabled: !!userId && userId !== "undefined" && userId.trim() !== "",
  });
};

// useQuery - Get users who can be messaged (mutual follow relationship)
export const useGetMessagableUsers = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_MESSAGABLE_USERS(userId),
    queryFn: () => {
      if (!userId || userId === "undefined" || userId.trim() === "") {
        throw new Error("User ID is required");
      }
      return getMessagableUsers(userId);
    },
    enabled: !!userId && userId !== "undefined" && userId.trim() !== "",
  });
};

// ============================================================
// FOLLOW MUTATIONS
// ============================================================

// useMutation - Follow user (optimistically updates cache)
export const useFollowUser = () => {
  const queryClient = useQueryClient();
  const { user } = useUserContext();
  return useMutation({
    mutationFn: (followingId: string) => followUser(followingId),
    onMutate: async (followingId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.GET_FOLLOWERS(followingId),
      });
      await queryClient.cancelQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWING],
      });

      // Snapshot previous values
      const previousFollowers = queryClient.getQueryData(
        QUERY_KEYS.GET_FOLLOWERS(followingId)
      );
      const previousFollowing = queryClient.getQueryData([
        QUERY_KEYS.GET_FOLLOWING,
      ]);

      const currentUserId = user?.id || user?._id || user?.$id;
      if (!currentUserId) return { previousFollowers, previousFollowing };

      // Optimistically update followers list of the user being followed
      queryClient.setQueryData(
        QUERY_KEYS.GET_FOLLOWERS(followingId),
        (old: any) => {
          if (!old) return old;

          // Handle both array and object with documents property
          if (Array.isArray(old)) {
            const alreadyFollowing = old.some(
              (f: any) =>
                (f._id || f.$id || f.id) === currentUserId
            );
            if (!alreadyFollowing) {
              return [
                ...old,
                { _id: currentUserId, id: currentUserId, $id: currentUserId },
              ];
            }
          } else {
            const followers = old.documents || [];
            const alreadyFollowing = followers.some(
              (f: any) =>
                (f._id || f.$id || f.id) === currentUserId
            );
            if (!alreadyFollowing) {
              return {
                ...old,
                documents: [
                  ...followers,
                  { _id: currentUserId, id: currentUserId, $id: currentUserId },
                ],
              };
            }
          }
          return old;
        }
      );

      // Optimistically update following list of current user
      queryClient.setQueryData(
        QUERY_KEYS.GET_FOLLOWING(currentUserId),
        (old: any) => {
          if (!old) return old;

          // Get the user being followed from cache
          const followedUser = queryClient.getQueryData(
            QUERY_KEYS.GET_USER_BY_ID(followingId)
          ) as any;

          if (Array.isArray(old)) {
            const alreadyFollowing = old.some(
              (f: any) =>
                (f._id || f.$id || f.id) === followingId
            );
            if (!alreadyFollowing) {
              return [
                ...old,
                followedUser || { _id: followingId, id: followingId, $id: followingId },
              ];
            }
          } else {
            const following = old.documents || [];
            const alreadyFollowing = following.some(
              (f: any) =>
                (f._id || f.$id || f.id) === followingId
            );
            if (!alreadyFollowing) {
              return {
                ...old,
                documents: [
                  ...following,
                  followedUser || { _id: followingId, id: followingId, $id: followingId },
                ],
              };
            }
          }
          return old;
        }
      );

      return { previousFollowers, previousFollowing };
    },
    onError: (err, followingId, context) => {
      const currentUserId = user?.id || user?._id || user?.$id;
      
      // Rollback on error
      if (context?.previousFollowers) {
        queryClient.setQueryData(
          QUERY_KEYS.GET_FOLLOWERS(followingId),
          context.previousFollowers
        );
      }
      if (context?.previousFollowing && currentUserId) {
        queryClient.setQueryData(
          QUERY_KEYS.GET_FOLLOWING(currentUserId),
          context.previousFollowing
        );
      }
    },
    onSuccess: (data, followingId) => {
      const currentUserId = user?.id || user?._id || user?.$id;
      
      // Invalidate to sync with server
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_FOLLOWERS(followingId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_FOLLOWING(followingId),
      });
      if (currentUserId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_FOLLOWING(currentUserId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_FOLLOWERS(currentUserId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_MESSAGABLE_USERS(currentUserId),
      });
      }
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_USER_BY_ID(followingId),
      });
      if (currentUserId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_USER_BY_ID(currentUserId),
        });
      }
    },
  });
};

// useMutation - Unfollow user (optimistically updates cache)
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  const { user } = useUserContext();
  return useMutation({
    mutationFn: (followingId: string) => unfollowUser(followingId),
    onMutate: async (followingId: string) => {
      const currentUserId = user?.id || user?._id || user?.$id;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.GET_FOLLOWERS(followingId),
      });
      if (currentUserId) {
      await queryClient.cancelQueries({
          queryKey: QUERY_KEYS.GET_FOLLOWING(currentUserId),
      });
      }

      // Snapshot previous values
      const previousFollowers = queryClient.getQueryData(
        QUERY_KEYS.GET_FOLLOWERS(followingId)
      );
      const previousFollowing = currentUserId
        ? queryClient.getQueryData(
            QUERY_KEYS.GET_FOLLOWING(currentUserId)
          )
        : null;
      if (!currentUserId) return { previousFollowers, previousFollowing };

      // Optimistically update followers list of the user being unfollowed
      queryClient.setQueryData(
        QUERY_KEYS.GET_FOLLOWERS(followingId),
        (old: any) => {
          if (!old) return old;

          // Handle both array and object with documents property
          if (Array.isArray(old)) {
            return old.filter(
              (f: any) =>
                (f._id || f.$id || f.id) !== currentUserId
            );
          } else {
            const followers = old.documents || [];
            return {
              ...old,
              documents: followers.filter(
                (f: any) =>
                  (f._id || f.$id || f.id) !== currentUserId
              ),
            };
          }
        }
      );

      // Optimistically update following list of current user
      queryClient.setQueryData(
        QUERY_KEYS.GET_FOLLOWING(currentUserId),
        (old: any) => {
          if (!old) return old;

          if (Array.isArray(old)) {
            return old.filter(
              (f: any) =>
                (f._id || f.$id || f.id) !== followingId
            );
          } else {
            const following = old.documents || [];
            return {
              ...old,
              documents: following.filter(
                (f: any) =>
                  (f._id || f.$id || f.id) !== followingId
              ),
            };
          }
        }
      );

      return { previousFollowers, previousFollowing };
    },
    onError: (err, followingId, context) => {
      const currentUserId = user?.id || user?._id || user?.$id;
      
      // Rollback on error
      if (context?.previousFollowers) {
        queryClient.setQueryData(
          QUERY_KEYS.GET_FOLLOWERS(followingId),
          context.previousFollowers
        );
      }
      if (context?.previousFollowing && currentUserId) {
        queryClient.setQueryData(
          QUERY_KEYS.GET_FOLLOWING(currentUserId),
          context.previousFollowing
        );
      }
    },
    onSuccess: (data, followingId) => {
      const currentUserId = user?.id || user?._id || user?.$id;
      
      // Invalidate to sync with server
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_FOLLOWERS(followingId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_FOLLOWING(followingId),
      });
      if (currentUserId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_FOLLOWING(currentUserId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_FOLLOWERS(currentUserId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_MESSAGABLE_USERS(currentUserId),
      });
      }
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_USER_BY_ID(followingId),
      });
      if (currentUserId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_USER_BY_ID(currentUserId),
        });
      }
    },
  });
};

// ============================================================
// NOTIFICATION QUERIES
// ============================================================

// useQuery - Get user's notifications (polls every 5 seconds, shows cached data immediately)
export const useGetNotifications = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_NOTIFICATIONS],
    queryFn: getNotifications,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    refetchOnMount: false, // Don't refetch on mount if we have cached data
    staleTime: 3000, // Consider data fresh for 3 seconds
    placeholderData: (previousData) => previousData, // Show cached data while refetching
  });
};

// useQuery - Get unread notification count (polls every 5 seconds, shows cached data immediately)
export const useGetUnreadNotificationCount = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_UNREAD_NOTIFICATION_COUNT],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    refetchOnMount: false, // Don't refetch on mount if we have cached data
    staleTime: 3000, // Consider data fresh for 3 seconds
    placeholderData: (previousData) => previousData, // Show cached data while refetching
  });
};

// ============================================================
// NOTIFICATION MUTATIONS
// ============================================================

// useMutation - Mark notification as read (optimistically updates cache)
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(notificationId),
    onMutate: async (notificationId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: [QUERY_KEYS.GET_NOTIFICATIONS],
      });

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueryData([
        QUERY_KEYS.GET_NOTIFICATIONS,
      ]);

      // Optimistically update only the clicked notification
      queryClient.setQueryData(
        [QUERY_KEYS.GET_NOTIFICATIONS],
        (old: any) => {
          if (!old) return old;
          const documents = old.documents || old || [];
          return {
            ...old,
            documents: documents.map((notif: any) =>
              (notif._id || notif.id) === notificationId
                ? { ...notif, read: true }
                : notif
            ),
          };
        }
      );

      return { previousNotifications };
    },
    onError: (err, notificationId, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          [QUERY_KEYS.GET_NOTIFICATIONS],
          context.previousNotifications
        );
      }
    },
    onSuccess: () => {
      // Invalidate to sync with server
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_NOTIFICATIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_UNREAD_NOTIFICATION_COUNT],
      });
    },
  });
};

// useMutation - Mark all notifications as read (optimistically updates cache)
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      // Optimistically mark all notifications as read
      queryClient.setQueryData(
        [QUERY_KEYS.GET_NOTIFICATIONS],
        (old: any) => {
          if (!old || !old.documents) return old;
          return {
            ...old,
            documents: old.documents.map((n: any) => ({
              ...n,
              read: true,
            })),
          };
        }
      );

      // Optimistically set unread count to 0
      queryClient.setQueryData(
        [QUERY_KEYS.GET_UNREAD_NOTIFICATION_COUNT],
        0
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_NOTIFICATIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_UNREAD_NOTIFICATION_COUNT],
      });
    },
  });
};

// useMutation - Delete notification (optimistically updates cache)
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onMutate: async (notificationId: string) => {
      // Snapshot previous notification to check if it was unread
      const previousNotifications = queryClient.getQueryData(
        [QUERY_KEYS.GET_NOTIFICATIONS]
      ) as any;
      const deletedNotification = previousNotifications?.documents?.find(
        (n: any) => (n._id || n.id) === notificationId
      );
      const wasUnread = deletedNotification && !deletedNotification.read;

      // Optimistically remove notification
      queryClient.setQueryData(
        [QUERY_KEYS.GET_NOTIFICATIONS],
        (old: any) => {
          if (!old || !old.documents) return old;
          return {
            ...old,
            documents: old.documents.filter(
              (n: any) => (n._id || n.id) !== notificationId
            ),
          };
        }
      );

      // Optimistically decrement unread count if notification was unread
      if (wasUnread) {
        queryClient.setQueryData(
          [QUERY_KEYS.GET_UNREAD_NOTIFICATION_COUNT],
          (old: any) => {
            const currentCount = typeof old === "number" ? old : old?.count || 0;
            return Math.max(0, currentCount - 1);
          }
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_NOTIFICATIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_UNREAD_NOTIFICATION_COUNT],
      });
    },
  });
};

// ============================================================
// ADMIN
// ============================================================

export const useGetAllUsersAdmin = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS, "admin"],
    queryFn: getAllUsersAdmin,
  });
};

export const useDeleteUserAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteUserAdmin(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USERS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useDeletePostAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, imageId }: { postId: string; imageId?: string }) =>
      deletePostAdmin(postId, imageId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      // Invalidate specific post
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_POST_BY_ID(variables.postId),
      });
      // Invalidate all user posts queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] === QUERY_KEYS.GET_USER_POSTS("")[0];
        },
      });
    },
  });
};

// ============================================================
// MESSAGES / CONVERSATIONS
// ============================================================

// useQuery - Get AI chat history
export const useGetChatHistory = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CHAT_HISTORY],
    queryFn: getChatHistory,
  });
};

// useMutation - Send message to AI
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendMessage(content),
    onSuccess: (data) => {
      // Update chat history with new messages
      queryClient.setQueryData(
        [QUERY_KEYS.GET_CHAT_HISTORY],
        (old: any) => {
          const messages = old?.messages || [];
          return {
            messages: [
              ...messages,
              data.userMessage,
              data.assistantMessage,
            ],
          };
        }
      );
    },
  });
};

// useQuery - Get user-to-user conversation
export const useGetUserConversation = (userId: string | null) => {
  return useQuery({
    queryKey: userId ? QUERY_KEYS.GET_USER_CONVERSATION(userId) : ["skip"],
    queryFn: () => {
      if (!userId) throw new Error("User ID is required");
      return getUserConversation(userId);
    },
    enabled: !!userId,
  });
};

// useMutation - Send user-to-user message
export const useSendUserMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useUserContext();
  return useMutation({
    mutationFn: async (data: { receiverId: string; content: string }) => {
      // Always use REST API for persistence
      return sendUserMessage(data);
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.GET_USER_CONVERSATION(variables.receiverId),
      });

      // Snapshot previous value
      const previousConversation = queryClient.getQueryData(
        QUERY_KEYS.GET_USER_CONVERSATION(variables.receiverId)
      );

      // Optimistically add message immediately
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
          senderId: user?.id,
        receiverId: variables.receiverId,
        content: variables.content,
        createdAt: new Date().toISOString(),
        read: false,
      };

      queryClient.setQueryData(
        QUERY_KEYS.GET_USER_CONVERSATION(variables.receiverId),
        (old: any) => {
          const messages = old?.messages || [];
          return {
            ...old,
            messages: [...messages, optimisticMessage],
          };
        }
      );

      // Update conversation partners list optimistically
      queryClient.setQueryData(
        [QUERY_KEYS.GET_CONVERSATION_PARTNERS],
        (old: any) => {
          if (!old || !old.partners) return old;
          
          const partners = [...old.partners];
          const partnerIndex = partners.findIndex(
            (p: any) => p.partnerId === variables.receiverId
          );

          const updatedPartner = {
            partnerId: variables.receiverId,
            lastMessageTime: optimisticMessage.createdAt,
            lastMessageContent: optimisticMessage.content,
            lastMessageSenderId: user?.id,
            unreadCount: partners[partnerIndex]?.unreadCount || 0,
          };

          // Remove old partner if exists and add updated one at the top
          const filteredPartners = partnerIndex >= 0 
            ? partners.filter((p: any) => p.partnerId !== variables.receiverId)
            : partners;
          
          return {
            ...old,
            partners: [updatedPartner, ...filteredPartners],
          };
        }
      );

      return { previousConversation };
    },
    onSuccess: (message, variables) => {
      // Replace optimistic message with real one from server
      queryClient.setQueryData(
        QUERY_KEYS.GET_USER_CONVERSATION(variables.receiverId),
        (old: any) => {
          const messages = old?.messages || [];
          const filteredMessages = messages.filter(
            (m: any) => !m._id?.startsWith("temp-")
          );
          // Check if message already exists (avoid duplicates from WebSocket)
          const exists = filteredMessages.some((m: any) => m._id === message._id);
          if (exists) {
            return { ...old, messages: filteredMessages };
          }
          return {
            ...old,
            messages: [...filteredMessages, message],
          };
        }
      );
      // WebSocket will handle conversation partners list update
    },
    onError: (err, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousConversation) {
        queryClient.setQueryData(
          QUERY_KEYS.GET_USER_CONVERSATION(variables.receiverId),
          context.previousConversation
        );
      }
    },
  });
};

// useQuery - Get conversation partners
export const useGetConversationPartners = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CONVERSATION_PARTNERS],
    queryFn: getConversationPartners,
    staleTime: 0, // Always consider data stale to allow optimistic updates to show immediately
    refetchOnMount: false, // Don't refetch on mount if we have cached data
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
};

// useQuery - Get unread message count
export const useGetUnreadMessageCount = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_UNREAD_MESSAGE_COUNT],
    queryFn: getUnreadMessageCount,
    staleTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// useMutation - Mark conversation as read
export const useMarkConversationAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useUserContext();
  return useMutation({
    mutationFn: async (userId: string) => {
      // Emit via WebSocket for real-time notification (only on client)
      if (typeof window !== "undefined") {
        const { getSocket } = await import("@/lib/api/socket");
        const socket = getSocket(user?.id);
        
        if (socket?.connected) {
          socket.emit("mark-read", {
            userId: user?.id,
            partnerId: userId,
          });
        }
      }
      
      // Still call REST API for persistence
      return markConversationAsRead(userId);
    },
    onSuccess: (_, userId) => {
      // Optimistically update conversation partners to set unread count to 0
      queryClient.setQueryData(
        [QUERY_KEYS.GET_CONVERSATION_PARTNERS],
        (old: any) => {
          if (!old || !old.partners) return old;
          
          const partners = old.partners.map((p: any) =>
            p.partnerId === userId ? { ...p, unreadCount: 0 } : p
          );

          // Count number of conversations with unread messages (not total messages)
          const conversationsWithUnread = partners.filter(
            (p: any) => (p.unreadCount || 0) > 0
          ).length;

          // Optimistically update unread count immediately
          queryClient.setQueryData(
            [QUERY_KEYS.GET_UNREAD_MESSAGE_COUNT],
            conversationsWithUnread
          );

          // Return new object with new array reference to ensure React Query detects the change
          return {
            ...old,
            partners: [...partners], // Create new array reference
          };
        }
      );

      // Invalidate conversation to refresh read status
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_USER_CONVERSATION(userId),
      });
    },
  });
};
