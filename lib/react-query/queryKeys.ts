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
  GET_POST_BY_ID: (postId: string) => ["getPostById", postId],
  GET_USER_POSTS: (userId: string) => ["getUserPosts", userId],
  GET_FILE_PREVIEW: (fileUrl: string) => ["getFilePreview", fileUrl],

  // REVIEWS
  GET_REVIEWS: ["getReviews"],
  GET_POST_REVIEWS: (postId: string) => ["getPostReviews", postId],
  GET_EXTERNAL_REVIEWS: (externalContentId: string) => [
    "getExternalReviews",
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
  SEARCH_EXTERNAL_CONTENT: (query: string) => ["searchExternalContent", query],
  GET_EXTERNAL_CONTENT_DETAILS: (contentId: string) => [
    "getExternalContentDetails",
    contentId,
  ],
};
