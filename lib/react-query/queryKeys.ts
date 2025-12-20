// ============================================================
// QUERY KEYS
// ============================================================

export const QUERY_KEYS = {
  // AUTH
  GET_CURRENT_USER: ["getCurrentUser"],

  // USERS
  GET_USERS: ["getUsers"],
  GET_USER_BY_ID: (userId: string) => ["getUserById", userId],

  // POSTS
  GET_POSTS: ["getPosts"],
  GET_INFINITE_POSTS: ["getInfinitePosts"],
  GET_RECENT_POSTS: ["getRecentPosts"],
  GET_POST_BY_ID: (postId: string) => ["getPostById", postId],
  GET_USER_POSTS: (userId: string) => ["getUserPosts", userId],
  GET_FILE_PREVIEW: (fileUrl: string) => ["getFilePreview", fileUrl],
  SEARCH_POSTS: ["searchPosts"],

  // REVIEWS
  GET_REVIEWS: ["getReviews"],
  GET_POST_REVIEWS: (postId: string) => ["getPostReviews", postId],
  GET_REVIEWS_BY_POST: (postId: string) => ["getReviewsByPost", postId],
  GET_EXTERNAL_REVIEWS: (externalContentId: string) => [
    "getExternalReviews",
    externalContentId,
  ],
  GET_REVIEWS_BY_EXTERNAL: (externalContentId: string) => [
    "getReviewsByExternal",
    externalContentId,
  ],

  // FOLLOWS
  GET_FOLLOWERS: (userId: string) => ["getFollowers", userId],
  GET_FOLLOWING: (userId: string) => ["getFollowing", userId],

  // SAVES
  GET_SAVED_POSTS: (userId: string) => ["getSavedPosts", userId],

  // NOTIFICATIONS
  GET_NOTIFICATIONS: ["getNotifications"],
  GET_UNREAD_NOTIFICATION_COUNT: ["getUnreadNotificationCount"],

  // EXTERNAL
  SEARCH_EXTERNAL: ["searchExternal"],
  GET_EXTERNAL_DETAILS: (contentId: string) => [
    "getExternalDetails",
    contentId,
  ],
};
