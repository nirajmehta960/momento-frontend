"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  unsavePost,
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

export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });
};

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

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
  });
};

export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_USER_BY_ID(userId),
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
};

export const useGetUsers = (params?: { role?: string; name?: string }) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS, params],
    queryFn: () => getUsers(params),
  });
};

// ============================================================
// USER MUTATIONS
// ============================================================

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, user }: { userId: string; user: IUpdateUser }) =>
      updateUser(userId, user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_USER_BY_ID(data._id),
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

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

export const useGetPostById = (postId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_POST_BY_ID(postId),
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};

export const useGetUserPosts = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_USER_POSTS(userId),
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
  });
};

export const useGetLikedPosts = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POSTS, "liked", userId],
    queryFn: () => getLikedPosts(userId),
    enabled: !!userId,
  });
};

// ============================================================
// POST MUTATIONS
// ============================================================

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_POST_BY_ID(data._id),
      });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: likePost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_POST_BY_ID(data._id),
      });
    },
  });
};

// ============================================================
// SAVE MUTATIONS
// ============================================================

export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savePost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
    },
  });
};

export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unsavePost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
    },
  });
};

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

export const useGetPostReviews = (postId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_POST_REVIEWS(postId),
    queryFn: () => getPostReviews(postId),
    enabled: !!postId,
  });
};

export const useGetExternalReviews = (externalContentId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_EXTERNAL_REVIEWS(externalContentId),
    queryFn: () => getExternalReviews(externalContentId),
    enabled: !!externalContentId,
  });
};

// ============================================================
// REVIEW MUTATIONS
// ============================================================

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: (data) => {
      if (data.postId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_POST_REVIEWS(data.postId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_POST_BY_ID(data.postId),
        });
      }
      if (data.externalContentId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_EXTERNAL_REVIEWS(data.externalContentId),
        });
      }
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateReview,
    onSuccess: (data) => {
      if (data.postId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_POST_REVIEWS(data.postId),
        });
      }
      if (data.externalContentId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_EXTERNAL_REVIEWS(data.externalContentId),
        });
      }
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_REVIEWS],
      });
    },
  });
};

// ============================================================
// FOLLOW QUERIES
// ============================================================

export const useGetFollowers = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_FOLLOWERS(userId),
    queryFn: () => getFollowers(userId),
    enabled: !!userId,
  });
};

export const useGetFollowing = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.GET_FOLLOWING(userId),
    queryFn: () => getFollowing(userId),
    enabled: !!userId,
  });
};

// ============================================================
// FOLLOW MUTATIONS
// ============================================================

export const useFollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: followUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_FOLLOWERS(data.following._id),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_FOLLOWING(data.follower._id),
      });
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unfollowUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWERS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FOLLOWING],
      });
    },
  });
};

// ============================================================
// NOTIFICATION QUERIES
// ============================================================

export const useGetNotifications = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_NOTIFICATIONS],
    queryFn: getNotifications,
  });
};

export const useGetUnreadNotificationCount = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_UNREAD_NOTIFICATION_COUNT],
    queryFn: getUnreadNotificationCount,
  });
};

// ============================================================
// NOTIFICATION MUTATIONS
// ============================================================

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationAsRead,
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
