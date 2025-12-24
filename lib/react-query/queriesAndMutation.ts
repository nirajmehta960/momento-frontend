"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
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

// useMutation - Sign in user (invalidates GET_CURRENT_USER on success)
export const useSignInAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: ISignIn) => signInAccount(user),
    onSuccess: () => {
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

// useMutation - Like/unlike post (invalidates post queries and current user on success)
export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      likesArray,
    }: {
      postId: string;
      likesArray: string[];
    }) => likePost(postId, likesArray),
    onSuccess: (data) => {
      const postId =
        (data as any)?.$id || (data as any)?.id || (data as any)?._id;
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

// ============================================================
// FOLLOW MUTATIONS
// ============================================================

// useMutation - Follow user (invalidates followers, following, and user profile on success)
export const useFollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (followingId: string) => followUser(followingId),
    onSuccess: (data, followingId) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_FOLLOWERS(followingId),
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWING],
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_USER_BY_ID(followingId),
      });
    },
  });
};

// useMutation - Unfollow user (invalidates followers and following on success)
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (followingId: string) => unfollowUser(followingId),
    onSuccess: (data, followingId) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_FOLLOWERS(followingId),
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWING],
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_USER_BY_ID(followingId),
      });
    },
  });
};

// ============================================================
// NOTIFICATION QUERIES
// ============================================================

// useQuery - Get user's notifications (polls every 5 seconds)
export const useGetNotifications = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_NOTIFICATIONS],
    queryFn: getNotifications,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

// useQuery - Get unread notification count (polls every 5 seconds)
export const useGetUnreadNotificationCount = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_UNREAD_NOTIFICATION_COUNT],
    queryFn: getUnreadNotificationCount,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

// ============================================================
// NOTIFICATION MUTATIONS
// ============================================================

// useMutation - Mark notification as read (invalidates notifications and count on success)
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(notificationId),
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

// useMutation - Mark all notifications as read (invalidates notifications and count on success)
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
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

// useMutation - Delete notification (invalidates notifications and count on success)
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
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
