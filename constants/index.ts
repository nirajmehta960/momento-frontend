import {
  Home,
  Compass,
  Users,
  Bookmark,
  PlusSquare,
  Bell,
  Camera,
  MessageCircle,
} from "lucide-react";

export const sidebarLinks = [
  {
    imgURL: "/assets/icons/home.svg",
    route: "/",
    label: "Home",
    icon: Home,
  },
  {
    imgURL: "/assets/icons/search.svg",
    route: "/explore",
    label: "Explore",
    icon: Compass,
  },
  {
    imgURL: "/assets/icons/people.svg",
    route: "/all-users",
    label: "All Users",
    icon: Users,
  },
  {
    imgURL: "/assets/icons/chat.svg",
    route: "/messages",
    label: "Messages",
    icon: MessageCircle,
  },
  {
    imgURL: "/assets/icons/bell.svg",
    route: "/notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    imgURL: "/assets/icons/bookmark.svg",
    route: "/saved",
    label: "Saved",
    icon: Bookmark,
  },
  {
    imgURL: "/assets/icons/gallery-add.svg",
    route: "/create-post",
    label: "Create Post",
    icon: PlusSquare,
  },
];

export const bottombarLinks = [
  {
    imgURL: "/assets/icons/home.svg",
    route: "/",
    label: "Home",
  },
  {
    imgURL: "/assets/icons/search.svg",
    route: "/explore",
    label: "Explore",
  },
  {
    imgURL: "/assets/icons/chat.svg",
    route: "/messages",
    label: "Messages",
  },
  {
    imgURL: "/assets/icons/bell.svg",
    route: "/notifications",
    label: "Notifications",
  },
  {
    imgURL: "/assets/icons/bookmark.svg",
    route: "/saved",
    label: "Saved",
  },
];

export const INITIAL_USER = {
  _id: "",
  id: "",
  name: "",
  username: "",
  email: "",
  imageUrl: "",
  imageId: "",
  bio: "",
  role: "USER" as const,
  createdAt: "",
  updatedAt: "",
  lastLogin: "",
};
