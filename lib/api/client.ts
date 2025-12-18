import axios from "axios";
import type {
  INewUser,
  ISignIn,
  IUser,
  IUpdateUser,
  IPost,
  INewPost,
  IUpdatePost,
  IReview,
  INewReview,
  IUpdateReview,
  IFollow,
  ISave,
  INotification,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Required for session cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// AUTHENTICATION
// ============================================================

// Create user account (sign up)
export const createUserAccount = async (user: INewUser): Promise<IUser> => {
  const response = await apiClient.post<IUser>("/users/signup", user);
  return response.data;
};

// Sign in user
export const signInAccount = async (user: ISignIn): Promise<IUser> => {
  const response = await apiClient.post<IUser>("/users/signin", user);
  return response.data;
};

// Sign out user
export const signOutAccount = async (): Promise<void> => {
  await apiClient.post("/users/signout");
};

// Get current authenticated user
export const getCurrentUser = async (): Promise<IUser | null> => {
  const response = await apiClient.post<IUser | null>("/users/profile");
  return response.data;
};

// ============================================================
// USERS
// ============================================================

// Get user by ID
export const getUserById = async (userId: string): Promise<IUser> => {
  const response = await apiClient.get<IUser>(`/users/${userId}`);
  return response.data;
};

// Get all users (with optional filters)
export const getUsers = async (params?: {
  role?: string;
  name?: string;
}): Promise<IUser[]> => {
  const response = await apiClient.get<IUser[]>("/users", { params });
  return response.data;
};

// Update user
export const updateUser = async (
  userId: string,
  user: IUpdateUser
): Promise<IUser> => {
  const response = await apiClient.put<IUser>(`/users/${userId}`, user);
  return response.data;
};

// Delete user
export const deleteUser = async (
  userId: string
): Promise<{ deleted: boolean }> => {
  const response = await apiClient.delete<{ deleted: boolean }>(
    `/users/${userId}`
  );
  return response.data;
};

// Upload profile image
export interface IUploadImageResponse {
  imageUrl: string;
  imageId: string;
  imageData: string;
  imageMimeType: string;
}

export const uploadProfileImage = async (
  file: File
): Promise<IUploadImageResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post<IUploadImageResponse>(
    "/users/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// ============================================================
// POSTS
// ============================================================

export interface IPostsResponse {
  documents: IPost[];
}

export interface IUploadImageResponse {
  imageUrl: string;
  imageId: string;
  imageData: string;
  imageMimeType: string;
}

// Get recent posts
export const getRecentPosts = async (params?: {
  limit?: number;
  skip?: number;
  sortBy?: string;
}): Promise<IPostsResponse> => {
  const response = await apiClient.get<IPostsResponse>("/posts", { params });
  return response.data;
};

// Get post by ID
export const getPostById = async (postId: string): Promise<IPost> => {
  const response = await apiClient.get<IPost>(`/posts/${postId}`);
  return response.data;
};

// Create post
export const createPost = async (post: INewPost): Promise<IPost> => {
  const formData = new FormData();
  formData.append("file", post.file[0]);
  formData.append("caption", post.caption);
  if (post.location) formData.append("location", post.location);
  if (post.tags) formData.append("tags", post.tags);

  const response = await apiClient.post<IPost>("/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Update post
export const updatePost = async (post: IUpdatePost): Promise<IPost> => {
  const formData = new FormData();
  if (post.file && post.file[0]) {
    formData.append("file", post.file[0]);
  }
  if (post.caption) formData.append("caption", post.caption);
  if (post.location) formData.append("location", post.location);
  if (post.tags) formData.append("tags", post.tags);

  const response = await apiClient.put<IPost>(
    `/posts/${post.postId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Delete post
export const deletePost = async (
  postId: string
): Promise<{ deleted: boolean }> => {
  const response = await apiClient.delete<{ deleted: boolean }>(
    `/posts/${postId}`
  );
  return response.data;
};

// Like/unlike post
export const likePost = async (postId: string): Promise<IPost> => {
  const response = await apiClient.put<IPost>(`/posts/${postId}/like`);
  return response.data;
};

// Get user posts
export const getUserPosts = async (userId: string): Promise<IPost[]> => {
  const response = await apiClient.get<IPost[]>(`/posts/user/${userId}`);
  return response.data;
};

// Get liked posts
export const getLikedPosts = async (userId: string): Promise<IPost[]> => {
  const response = await apiClient.get<IPost[]>(`/posts/user/${userId}/liked`);
  return response.data;
};

// ============================================================
// SAVES
// ============================================================

// Save post
export const savePost = async (postId: string): Promise<ISave> => {
  const response = await apiClient.post<ISave>(`/saves`, { postId });
  return response.data;
};

// Unsave post
export const unsavePost = async (
  saveId: string
): Promise<{ deleted: boolean }> => {
  const response = await apiClient.delete<{ deleted: boolean }>(
    `/saves/${saveId}`
  );
  return response.data;
};

// Get saved posts for user
export const getSavedPosts = async (userId: string): Promise<ISave[]> => {
  const response = await apiClient.get<ISave[]>(`/saves/user/${userId}`);
  return response.data;
};

// ============================================================
// REVIEWS
// ============================================================

// Create review
export const createReview = async (review: INewReview): Promise<IReview> => {
  const response = await apiClient.post<IReview>("/reviews", review);
  return response.data;
};

// Update review
export const updateReview = async (review: IUpdateReview): Promise<IReview> => {
  const response = await apiClient.put<IReview>(
    `/reviews/${review.reviewId}`,
    review
  );
  return response.data;
};

// Delete review
export const deleteReview = async (
  reviewId: string
): Promise<{ deleted: boolean }> => {
  const response = await apiClient.delete<{ deleted: boolean }>(
    `/reviews/${reviewId}`
  );
  return response.data;
};

// Get reviews for post
export const getPostReviews = async (postId: string): Promise<IReview[]> => {
  const response = await apiClient.get<IReview[]>(`/reviews/post/${postId}`);
  return response.data;
};

// Get reviews for external content
export const getExternalReviews = async (
  externalContentId: string
): Promise<IReview[]> => {
  const response = await apiClient.get<IReview[]>(
    `/reviews/external/${externalContentId}`
  );
  return response.data;
};

// ============================================================
// FOLLOWS
// ============================================================

// Follow user
export const followUser = async (userId: string): Promise<IFollow> => {
  const response = await apiClient.post<IFollow>(`/follows`, {
    following: userId,
  });
  return response.data;
};

// Unfollow user
export const unfollowUser = async (
  followId: string
): Promise<{ deleted: boolean }> => {
  const response = await apiClient.delete<{ deleted: boolean }>(
    `/follows/${followId}`
  );
  return response.data;
};

// Get followers
export const getFollowers = async (userId: string): Promise<IFollow[]> => {
  const response = await apiClient.get<IFollow[]>(
    `/follows/followers/${userId}`
  );
  return response.data;
};

// Get following
export const getFollowing = async (userId: string): Promise<IFollow[]> => {
  const response = await apiClient.get<IFollow[]>(
    `/follows/following/${userId}`
  );
  return response.data;
};

// ============================================================
// NOTIFICATIONS
// ============================================================

// Get notifications
export const getNotifications = async (): Promise<INotification[]> => {
  const response = await apiClient.get<INotification[]>("/notifications");
  return response.data;
};

// Get unread notification count
export const getUnreadNotificationCount = async (): Promise<number> => {
  const response = await apiClient.get<number | { count: number }>(
    "/notifications/unread"
  );
  // Handle both response formats
  if (typeof response.data === "number") {
    return response.data;
  }
  return response.data.count;
};

// Mark notification as read
export const markNotificationAsRead = async (
  notificationId: string
): Promise<INotification> => {
  const response = await apiClient.put<INotification>(
    `/notifications/${notificationId}/read`
  );
  return response.data;
};
