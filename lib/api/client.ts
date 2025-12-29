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

// API base URL from environment variable
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
// Ensure the URL ends with /api
const API_URL = apiBaseUrl.endsWith("/api") ? apiBaseUrl : `${apiBaseUrl}/api`;

// Axios client configured for Express-session (withCredentials sends session cookies)
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

// POST /api/users/signup - Create account and auto sign-in
export const createUserAccount = async (user: INewUser): Promise<IUser> => {
  const response = await apiClient.post<IUser>("/users/signup", user);
  return response.data;
};

// POST /api/users/signin - Sign in (supports email or username)
export const signInAccount = async (user: ISignIn): Promise<IUser> => {
  const response = await apiClient.post<IUser>("/users/signin", user);
  return response.data;
};

// POST /api/users/signout - Sign out and destroy session
export const signOutAccount = async (): Promise<void> => {
  await apiClient.post("/users/signout");
};

// POST /api/users/profile - Get current user from session (returns null if not logged in)
// Also fetches saved posts and includes them in the user object
export const getCurrentUser = async (): Promise<IUser | null> => {
  try {
    const response = await apiClient.post<IUser | null>("/users/profile");
    if (!response.data) {
      return null;
    }
    const user = response.data;

    // Fetch saved posts for the user
    try {
      const savesResponse = await apiClient.get(
        `/saves/user/${(user as any)._id || (user as any).id}`
      );
      const saves = savesResponse.data.save || savesResponse.data || [];

      return {
        ...user,
        id: (user as any)._id || (user as any).id,
        $id: (user as any)._id || (user as any).id,
        save: saves.map((save: any) => ({
          _id: save._id || save.$id || save.id,
          $id: save._id || save.$id || save.id,
          id: save._id || save.$id || save.id,
          post: save.post
            ? {
                _id: save.post._id || save.post.$id || save.post.id,
                $id: save.post._id || save.post.$id || save.post.id,
                id: save.post._id || save.post.$id || save.post.id,
                creator: save.post.creator
                  ? {
                      _id:
                        save.post.creator._id ||
                        save.post.creator.$id ||
                        save.post.creator.id,
                      $id:
                        save.post.creator._id ||
                        save.post.creator.$id ||
                        save.post.creator.id,
                      id:
                        save.post.creator._id ||
                        save.post.creator.$id ||
                        save.post.creator.id,
                      name: save.post.creator.name,
                      username: save.post.creator.username,
                      imageUrl: save.post.creator.imageUrl || "",
                    }
                  : null,
                caption: save.post.caption,
                imageUrl: save.post.imageUrl,
                imageId: save.post.imageId,
                location: save.post.location,
                tags: save.post.tags || [],
                likes: save.post.likes || [],
                $createdAt: save.post.createdAt || save.post.$createdAt,
                createdAt: save.post.createdAt || save.post.$createdAt,
              }
            : null,
        })),
      };
    } catch (savesError) {
      // If saves fetch fails, return user without saves
      return {
        ...user,
        id: (user as any)._id || (user as any).id,
        $id: (user as any)._id || (user as any).id,
        save: [],
      };
    }
  } catch (error: any) {
    throw error;
  }
};

// ============================================================
// USERS
// ============================================================

// GET /api/users/:userId - Get user by ID
export const getUserById = async (userId: string): Promise<IUser> => {
  const response = await apiClient.get<IUser>(`/users/${userId}`);
  return response.data;
};

// GET /api/users - Get all users (query params: ?role=ADMIN, ?name=searchTerm)
export const getUsers = async (params?: {
  role?: string;
  name?: string;
  limit?: number;
}) => {
  try {
    const response = await apiClient.get("/users", { params });
    const users = response.data.documents || response.data || [];
    return {
      documents: users.map((user: any) => ({
        $id: user._id || user.id,
        id: user._id || user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        imageUrl: user.imageUrl || "",
        bio: user.bio || "",
        role: user.role || "USER",
        lastLogin: user.lastLogin,
      })),
    };
  } catch (error: any) {
    throw error;
  }
};

// PUT /api/users/:userId - Update user profile
export const updateUser = async (user: IUpdateUser) => {
  try {
    const payload: any = {
      name: user.name,
      bio: user.bio,
      imageUrl: user.imageUrl,
      imageId: user.imageId,
      imageData: user.imageData,
      imageMimeType: user.imageMimeType,
    };

    if (user.password && user.password.trim() !== "") {
      payload.password = user.password;
    }

    const response = await apiClient.put(`/users/${user.userId}`, payload);
    const updatedUser = response.data;
    return {
      id: updatedUser._id || updatedUser.id,
      $id: updatedUser._id || updatedUser.id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      imageUrl: updatedUser.imageUrl || "",
      bio: updatedUser.bio || "",
    };
  } catch (error: any) {
    throw error;
  }
};

// DELETE /api/users/:userId - Delete user account
export const deleteUser = async (
  userId: string
): Promise<{ deleted: boolean }> => {
  const response = await apiClient.delete<{ deleted: boolean }>(
    `/users/${userId}`
  );
  return response.data;
};

// POST /api/users/upload - Upload profile image (FormData)
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

// GET /api/posts - Get recent posts (query params: ?limit=10&skip=0&sortBy=latest)
export const getRecentPosts = async (params?: {
  limit?: number;
  skip?: number;
  sortBy?: string;
}) => {
  try {
    const response = await apiClient.get("/posts", { params });
    const posts = response.data.documents || response.data || [];
    return {
      documents: posts.map((post: any) => ({
        $id: post._id || post.id,
        id: post._id || post.id,
        creator: {
          $id: post.creator?._id || post.creator?.id,
          id: post.creator?._id || post.creator?.id,
          name: post.creator?.name,
          username: post.creator?.username,
          imageUrl: post.creator?.imageUrl || "",
        },
        caption: post.caption,
        imageUrl: post.imageUrl,
        imageId: post.imageId,
        location: post.location,
        tags: post.tags || [],
        likes: post.likes || [],
        $createdAt: post.createdAt,
        createdAt: post.createdAt,
      })),
    };
  } catch (error: any) {
    throw error;
  }
};

// GET /api/posts - Get posts for infinite scroll pagination
export const getInfinitePosts = async ({
  pageParam = 0,
  sortBy = "latest",
}: {
  pageParam?: number;
  sortBy?: string;
}) => {
  try {
    const limit = 10;
    const skip = pageParam * limit;
    const response = await apiClient.get(
      `/posts?limit=${limit}&skip=${skip}&sortBy=${sortBy}`
    );
    const posts = response.data.documents || response.data || [];
    return {
      documents: posts.map((post: any) => ({
        $id: post._id || post.id,
        id: post._id || post.id,
        creator: {
          $id: post.creator?._id || post.creator?.id,
          id: post.creator?._id || post.creator?.id,
          name: post.creator?.name,
          username: post.creator?.username,
          imageUrl: post.creator?.imageUrl || "",
        },
        caption: post.caption,
        imageUrl: post.imageUrl,
        imageId: post.imageId,
        location: post.location,
        tags: post.tags || [],
        likes: post.likes || [],
        $createdAt: post.createdAt,
        createdAt: post.createdAt,
      })),
    };
  } catch (error: any) {
    throw error;
  }
};

// GET /api/posts/search - Search posts by caption/tags (query param: ?searchTerm=...)
export const searchPosts = async (searchTerm: string) => {
  try {
    const response = await apiClient.get(`/posts/search`, {
      params: { searchTerm },
    });
    const posts = response.data.documents || response.data || [];
    return {
      documents: posts.map((post: any) => ({
        $id: post._id || post.id,
        id: post._id || post.id,
        creator: {
          $id: post.creator?._id || post.creator?.id,
          id: post.creator?._id || post.creator?.id,
          name: post.creator?.name,
          username: post.creator?.username,
          imageUrl: post.creator?.imageUrl || "",
        },
        caption: post.caption,
        imageUrl: post.imageUrl,
        imageId: post.imageId,
        location: post.location,
        tags: post.tags || [],
        likes: post.likes || [],
        $createdAt: post.createdAt,
        createdAt: post.createdAt,
      })),
    };
  } catch (error: any) {
    throw error;
  }
};

// GET /api/posts/:postId - Get post by ID
export const getPostById = async (postId: string): Promise<IPost> => {
  try {
    const response = await apiClient.get(`/posts/${postId}`);
    const postData = response.data;

    if (!postData) {
      throw new Error("Post not found");
    }

    return {
      _id: postData._id || postData.id || postData.$id || "",
      $id: postData._id || postData.id || postData.$id,
      creator: {
        $id: postData.creator?._id || postData.creator?.id || postData.creator?.$id,
        id: postData.creator?._id || postData.creator?.id || postData.creator?.$id,
        name: postData.creator?.name || "",
        username: postData.creator?.username || "",
        imageUrl: postData.creator?.imageUrl || "",
        role: postData.creator?.role || "USER",
      },
      caption: postData.caption || "",
      imageUrl: postData.imageUrl || "",
      imageId: postData.imageId || "",
      location: postData.location || "",
      tags: postData.tags || [],
      likes: postData.likes || [],
      saves: postData.saves || [],
      $createdAt: postData.createdAt,
      createdAt: postData.createdAt,
    };
  } catch (error: any) {
    throw error;
  }
};

// POST /api/posts - Create post (FormData: file, caption, location, tags)
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

// PUT /api/posts/:postId - Update post (FormData: optional file, caption, location, tags)
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

// DELETE /api/posts/:postId - Delete post
export const deletePost = async (
  postId: string
): Promise<{ deleted: boolean }> => {
  const response = await apiClient.delete<{ deleted: boolean }>(
    `/posts/${postId}`
  );
  return response.data;
};

// PUT /api/posts/:postId/like - Like/unlike post (body: { likesArray: string[] })
export const likePost = async (postId: string, likesArray: string[]) => {
  try {
    const response = await apiClient.put(`/posts/${postId}/like`, {
      likesArray,
    });
    const postData = response.data;
    return {
      $id: postData._id || postData.id,
      id: postData._id || postData.id,
      likes: postData.likes || [],
    };
  } catch (error: any) {
    throw error;
  }
};

// GET /api/posts/user/:userId - Get all posts by user
export const getUserPosts = async (userId: string): Promise<IPost[]> => {
  const response = await apiClient.get(`/posts/user/${userId}`);
  const posts = response.data.documents || response.data || [];
  return posts.map((post: any) => ({
    $id: post._id || post.id,
    id: post._id || post.id,
    creator: {
      $id: post.creator?._id || post.creator?.id,
      id: post.creator?._id || post.creator?.id,
      name: post.creator?.name,
      username: post.creator?.username,
      imageUrl: post.creator?.imageUrl || "",
    },
    caption: post.caption,
    imageUrl: post.imageUrl,
    imageId: post.imageId,
    location: post.location,
    tags: post.tags || [],
    likes: post.likes || [],
    $createdAt: post.createdAt,
    createdAt: post.createdAt,
  }));
};

// GET /api/posts/user/:userId/liked - Get posts liked by user
export const getLikedPosts = async (userId: string) => {
  try {
    const response = await apiClient.get(`/posts/user/${userId}/liked`);
    const posts = response.data.documents || response.data || [];
    return {
      documents: posts.map((post: any) => ({
        $id: post._id || post.id,
        id: post._id || post.id,
        creator: {
          $id: post.creator?._id || post.creator?.id,
          id: post.creator?._id || post.creator?.id,
          name: post.creator?.name,
          username: post.creator?.username,
          imageUrl: post.creator?.imageUrl || "",
        },
        caption: post.caption,
        imageUrl: post.imageUrl,
        imageId: post.imageId,
        location: post.location,
        tags: post.tags || [],
        likes: post.likes || [],
        $createdAt: post.createdAt,
        createdAt: post.createdAt,
      })),
    };
  } catch (error: any) {
    throw error;
  }
};

// ============================================================
// SAVES
// ============================================================

// POST /api/saves - Save a post (body: { postId })
export const savePost = async (postId: string, userId: string) => {
  try {
    const response = await apiClient.post(`/saves`, { postId });
    return {
      $id: response.data._id || response.data.id,
      id: response.data._id || response.data.id,
      post: {
        $id: response.data.post || response.data.post?._id,
        id: response.data.post || response.data.post?._id,
      },
    };
  } catch (error: any) {
    throw error;
  }
};

// DELETE /api/saves - Unsave a post (body: { postId })
export const deleteSavedPost = async (postId: string) => {
  try {
    await apiClient.delete(`/saves`, {
      data: { postId },
    });
    return { status: "ok" };
  } catch (error: any) {
    throw error;
  }
};

// GET /api/saves/user/:userId - Get saved posts for user
export const getSavedPosts = async (userId: string): Promise<ISave[]> => {
  const response = await apiClient.get<ISave[]>(`/saves/user/${userId}`);
  return response.data;
};

// ============================================================
// REVIEWS
// ============================================================

// POST /api/reviews - Create review
export const createReview = async (review: INewReview): Promise<IReview> => {
  const response = await apiClient.post<IReview>("/reviews", review);
  // Map backend 'review' field to frontend 'comment' field for type compatibility
  return {
    ...response.data,
    comment: (response.data as any).review || response.data.comment,
    creator: (response.data as any).user || response.data.creator,
  };
};

// PUT /api/reviews/:reviewId - Update review
export const updateReview = async (review: IUpdateReview): Promise<IReview> => {
  const response = await apiClient.put<IReview>(
    `/reviews/${review.reviewId}`,
    review
  );
  // Map backend 'review' field to frontend 'comment' field for type compatibility
  return {
    ...response.data,
    comment: (response.data as any).review || response.data.comment,
    creator: (response.data as any).user || response.data.creator,
  };
};

// DELETE /api/reviews/:reviewId - Delete review
export const deleteReview = async (
  reviewId: string
): Promise<{ deleted: boolean }> => {
  const response = await apiClient.delete<{ deleted: boolean }>(
    `/reviews/${reviewId}`
  );
  return response.data;
};

// GET /api/reviews/post/:postId - Get reviews for a post
export const getPostReviews = async (postId: string): Promise<IReview[]> => {
  const response = await apiClient.get<{ documents: IReview[] }>(
    `/reviews/post/${postId}`
  );
  const reviews = response.data.documents || response.data || [];
  // Map backend 'review' field to frontend 'comment' field for type compatibility
  return reviews.map((review: any) => ({
    ...review,
    comment: review.review || review.comment,
    creator: review.user || review.creator,
  }));
};

// Alias for getPostReviews (compatibility)
export const getReviewsByPost = async (postId: string) => {
  return getPostReviews(postId);
};

// GET /api/reviews/external/:externalContentId - Get reviews for external content
export const getExternalReviews = async (
  externalContentId: string
): Promise<IReview[]> => {
  const response = await apiClient.get<{ documents: IReview[] }>(
    `/reviews/external/${externalContentId}`
  );
  const reviews = response.data.documents || response.data || [];
  // Map backend 'review' field to frontend 'comment' field for type compatibility
  return reviews.map((review: any) => ({
    ...review,
    comment: review.review || review.comment,
    creator: review.user || review.creator,
  }));
};

// Alias for getExternalReviews (compatibility)
export const getReviewsByExternalContent = async (
  externalContentId: string
) => {
  return getExternalReviews(externalContentId);
};

// ============================================================
// FOLLOWS
// ============================================================

// POST /api/follows - Follow a user (body: { followingId })
export const followUser = async (userId: string): Promise<IFollow> => {
  const response = await apiClient.post<IFollow>(`/follows`, {
    followingId: userId,
  });
  return response.data;
};

// DELETE /api/follows/:followingId - Unfollow a user
export const unfollowUser = async (
  followingId: string
): Promise<{ deleted: boolean }> => {
  const response = await apiClient.delete<{ deleted: boolean }>(
    `/follows/${followingId}`
  );
  return response.data;
};

// GET /api/follows/followers/:userId - Get followers of a user
export const getFollowers = async (userId: string): Promise<IFollow[]> => {
  const response = await apiClient.get<IFollow[]>(
    `/follows/followers/${userId}`
  );
  return response.data;
};

// GET /api/follows/following/:userId - Get users that a user is following
export const getFollowing = async (userId: string): Promise<IFollow[]> => {
  const response = await apiClient.get<IFollow[]>(
    `/follows/following/${userId}`
  );
  return response.data;
};

// GET /api/follows/messagable/:userId - Get users who can be messaged (mutual follow)
export const getMessagableUsers = async (userId: string): Promise<IUser[]> => {
  const response = await apiClient.get<IUser[]>(
    `/follows/messagable/${userId}`
  );
  return response.data;
};

// ============================================================
// NOTIFICATIONS
// ============================================================

// GET /api/notifications - Get user's notifications
export const getNotifications = async (): Promise<INotification[]> => {
  const response = await apiClient.get<INotification[]>("/notifications");
  return response.data;
};

// GET /api/notifications/unread-count - Get unread notification count
export const getUnreadNotificationCount = async (): Promise<number> => {
  const response = await apiClient.get<number | { count: number }>(
    "/notifications/unread-count"
  );
  if (typeof response.data === "number") {
    return response.data;
  }
  return response.data.count;
};

// PUT /api/notifications/:notificationId/read - Mark notification as read
export const markNotificationAsRead = async (
  notificationId: string
): Promise<INotification> => {
  const response = await apiClient.put<INotification>(
    `/notifications/${notificationId}/read`
  );
  return response.data;
};

// PUT /api/notifications/read-all - Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  const response = await apiClient.put("/notifications/read-all");
  return response.data;
};

// DELETE /api/notifications/:notificationId - Delete notification
export const deleteNotification = async (
  notificationId: string
): Promise<void> => {
  const response = await apiClient.delete(`/notifications/${notificationId}`);
  return response.data;
};

// ============================================================
// EXTERNAL API
// ============================================================

// GET /api/external/search - Search external content (query param: ?q=...&page=1)
export const searchExternal = async (query: string, page?: number) => {
  try {
    const response = await apiClient.get(`/external/search`, {
      params: { q: query, page: page || 1 },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// GET /api/external/details/:id - Get external content details
export const getExternalDetails = async (id: string) => {
  try {
    const response = await apiClient.get(`/external/details/${id}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// ============================================================
// ADMIN
// ============================================================

// DELETE /api/users/:userId - Delete user account (own account or admin)
export const deleteUserAccount = async (userId: string) => {
  try {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// GET /api/admin/users - Get all users (admin only)
export const getAllUsersAdmin = async () => {
  try {
    const response = await apiClient.get(`/admin/users`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// DELETE /api/users/:userId - Delete user (admin only)
export const deleteUserAdmin = async (userId: string) => {
  try {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// DELETE /api/posts/:postId - Delete post (admin only)
export const deletePostAdmin = async (postId: string, imageId?: string) => {
  try {
    const response = await apiClient.delete(`/posts/${postId}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// ============================================================
// MESSAGES / CONVERSATIONS
// ============================================================

// GET /api/momento-ai - Get AI chat history
export const getChatHistory = async () => {
  try {
    const response = await apiClient.get<{ messages: any[] }>("/momento-ai");
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// POST /api/momento-ai/chat - Send message to AI
export const sendMessage = async (content: string) => {
  try {
    const response = await apiClient.post<{
      userMessage: any;
      assistantMessage: any;
    }>("/momento-ai/chat", { content });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// GET /api/conversations/:userId - Get user-to-user conversation
export const getUserConversation = async (
  userId: string
): Promise<{ messages: any[] }> => {
  try {
    const response = await apiClient.get<{ messages: any[] }>(
      `/conversations/${userId}`
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// POST /api/conversations/send - Send user-to-user message
export const sendUserMessage = async (data: {
  receiverId: string;
  content: string;
}) => {
  try {
    const response = await apiClient.post("/conversations/send", data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// GET /api/conversations - Get conversation partners
export const getConversationPartners = async () => {
  try {
    const response = await apiClient.get<{ partners: any[] }>("/conversations");
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// GET /api/conversations/unread-count - Get unread message count
export const getUnreadMessageCount = async (): Promise<number> => {
  try {
    const response = await apiClient.get<{ count: number }>(
      "/conversations/unread-count"
    );
    return response.data.count;
  } catch (error: any) {
    throw error;
  }
};

// PUT /api/conversations/:userId/read - Mark conversation as read
export const markConversationAsRead = async (userId: string) => {
  try {
    const response = await apiClient.put<{ success: boolean }>(
      `/conversations/${userId}/read`
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
