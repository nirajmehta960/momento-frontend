"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Users,
  User,
  Shield,
  EyeOff,
  Eye,
  FileText,
  Star,
  Search,
  Settings,
  Lock,
  LogIn,
  UserPlus,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Feature {
  icon: React.ElementType;
  title: string;
  items: string[];
  highlight?: boolean;
}

const FeatureCard = ({ feature }: { feature: Feature }) => {
  const Icon = feature.icon;

  return (
    <div
      className={`p-4 rounded-lg border-l-2 ${
        feature.highlight
          ? "bg-accent/10 border-l-accent"
          : "bg-secondary/30 border-l-accent/50"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon
          className={`h-4 w-4 ${
            feature.highlight ? "text-accent" : "text-accent/70"
          }`}
        />
        <h4 className="font-medium text-foreground">{feature.title}</h4>
      </div>
      {feature.items.length > 0 && (
        <ul className="space-y-1 ml-6">
          {feature.items.map((item, index) => (
            <li key={index} className="text-sm text-muted-foreground list-disc">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const AboutPage = () => {
  const router = useRouter();

  const regularUserFeatures: Feature[] = [
    {
      icon: FileText,
      title: "Content Management:",
      items: [
        "Create, edit, and delete own posts",
        "Upload images with captions, tags, and location",
        "Like and unlike posts",
        "Save and unsave posts",
      ],
    },
    {
      icon: UserPlus,
      title: "Social Features:",
      items: [
        "Follow and unfollow other users",
        "View followers and following lists",
        "View and manage notifications",
      ],
    },
    {
      icon: Star,
      title: "Reviews & Engagement:",
      items: [
        "Create reviews for posts and external content",
        "Edit and delete own reviews",
        "Rate content with star ratings (1-5 stars)",
      ],
    },
    {
      icon: User,
      title: "Profile & Account:",
      items: [
        "Update profile information (name, username, bio, image)",
        "View own saved posts collection",
        "View own liked posts collection",
        "Delete own account",
      ],
    },
    {
      icon: Search,
      title: "Content Access:",
      items: [
        "Full home feed with all posts",
        "View all posts on any profile",
        "Search local posts and external content (Unsplash)",
        "View external content details",
      ],
    },
  ];

  const adminFeatures: Feature[] = [
    {
      icon: Check,
      title: "All Regular User Capabilities PLUS:",
      items: [],
      highlight: true,
    },
    {
      icon: Settings,
      title: "Admin Dashboard Access:",
      items: [
        "View all registered users in the system",
        "View all posts created by any user",
        "Delete any user account (except own account)",
        "Delete any post for content moderation",
        "See user roles (USER/ADMIN) in dashboard",
        "Access admin-only navigation and features",
      ],
    },
  ];

  const anonymousFeatures: Feature[] = [
    {
      icon: Eye,
      title: "Limited Content Access:",
      items: [
        "View home feed (limited to 3 posts with sign-in prompt)",
        "View public profiles (limited to 2 posts per profile)",
        "Browse all users page to see community members",
        'Explore page with limited "Popular today" posts (3 posts)',
        "Search local posts (only within visible 3 posts)",
        "Search external content (Unsplash photos)",
        "View external content details",
        "View reviews on external content",
      ],
    },
    {
      icon: Lock,
      title: "Restricted Actions:",
      items: [
        "Cannot create, edit, or delete posts",
        "Cannot like or save posts",
        "Cannot follow or unfollow users",
        "Cannot view followers/following lists (redirects to sign-in)",
        "Cannot view notifications",
        "Cannot update profile",
        "Cannot create reviews",
      ],
    },
    {
      icon: LogIn,
      title: "Account Access:",
      items: [
        "Can sign up to create a new account",
        "Can sign in to existing account",
        "Can view About page and Privacy Policy",
      ],
    },
  ];

  return (
    <div className="common-container">
      <div className="max-w-4xl w-full mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 p-4 text-foreground hover:text-muted-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        {/* Main Card */}
        <div className="bg-dark-4 rounded-lg p-6 md:p-8 border border-border mb-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Users className="h-8 w-8 text-accent" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              About Momento
            </h1>
          </div>

          {/* User Types */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-6">
              User Types
            </h2>

            {/* Regular Users */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground">
                  Regular Users
                </h3>
              </div>
              <div className="space-y-3">
                {regularUserFeatures.map((feature, index) => (
                  <FeatureCard key={index} feature={feature} />
                ))}
              </div>
            </div>

            {/* Admin Users */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground">
                  Admin Users
                </h3>
              </div>
              <div className="space-y-3">
                {adminFeatures.map((feature, index) => (
                  <FeatureCard key={index} feature={feature} />
                ))}
              </div>
            </div>

            {/* Anonymous Users */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <EyeOff className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground">
                  Anonymous Users
                </h3>
              </div>
              <div className="space-y-3">
                {anonymousFeatures.map((feature, index) => (
                  <FeatureCard key={index} feature={feature} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
