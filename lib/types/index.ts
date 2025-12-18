// ============================================================
// USER TYPES
// ============================================================

export interface IUser {
  _id: string;
  id?: string;
  name: string;
  username: string;
  email?: string;
  imageUrl?: string;
  imageId?: string;
  bio?: string;
  role: "USER" | "ADMIN";
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface INewUser {
  name: string;
  username: string;
  email: string;
  password: string;
  role?: "USER" | "ADMIN";
}

export interface ISignIn {
  email: string;
  password: string;
}

export interface IUpdateUser {
  name?: string;
  username?: string;
  email?: string;
  bio?: string;
  password?: string;
  imageUrl?: string;
  imageId?: string;
  imageData?: string;
  imageMimeType?: string;
}

export interface IUploadImageResponse {
  imageUrl: string;
  imageId: string;
  imageData: string;
  imageMimeType: string;
}

// ============================================================
// POST TYPES
// ============================================================

export interface IPost {
  _id: string;
  $id?: string;
  creator: IUser;
  caption: string;
  imageUrl: string;
  imageId: string;
  location?: string;
  tags?: string[];
  likes: string[];
  saves: string[];
  createdAt: string;
  $createdAt?: string;
  updatedAt?: string;
}

export interface INewPost {
  userId: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string;
}

export interface IUpdatePost {
  postId: string;
  caption?: string;
  file?: File[];
  location?: string;
  tags?: string;
  imageId?: string;
  imageUrl?: string;
}

// ============================================================
// REVIEW TYPES
// ============================================================

export interface IReview {
  _id: string;
  $id?: string;
  creator: IUser;
  postId?: string;
  externalContentId?: string;
  rating: number;
  comment: string;
  createdAt: string;
  $createdAt?: string;
  updatedAt?: string;
}

export interface INewReview {
  postId?: string;
  externalContentId?: string;
  rating: number;
  comment: string;
}

export interface IUpdateReview {
  reviewId: string;
  rating?: number;
  comment?: string;
}

// ============================================================
// FOLLOW TYPES
// ============================================================

export interface IFollow {
  _id: string;
  follower: IUser;
  following: IUser;
  createdAt: string;
}

// ============================================================
// SAVE TYPES
// ============================================================

export interface ISave {
  _id: string;
  user: IUser;
  post: IPost;
  createdAt: string;
}

// ============================================================
// NOTIFICATION TYPES
// ============================================================

export interface INotification {
  _id: string;
  user: string; // userId
  type: "like" | "follow" | "review";
  fromUser: IUser;
  postId?: string;
  reviewId?: string;
  read: boolean;
  createdAt: string;
}

// ============================================================
// NAVIGATION TYPES
// ============================================================

export interface INavLink {
  imgURL: string;
  route: string;
  label: string;
}

// ============================================================
// EXTERNAL API TYPES
// ============================================================

export interface IExternalContent {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  description?: string;
  alt_description?: string;
  user: {
    name: string;
    username: string;
  };
  created_at: string;
  likes: number;
}
