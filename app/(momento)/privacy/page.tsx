"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  Database,
  Mail,
  User,
  FileText,
  Users,
  CheckCircle,
  Globe,
} from "lucide-react";

interface PrivacySection {
  icon: React.ElementType;
  title: string;
  content?: string;
  items?: Array<{
    icon?: React.ElementType;
    title?: string;
    items: string[];
  }>;
}

const PrivacySectionCard = ({ section }: { section: PrivacySection }) => {
  const Icon = section.icon;

  return (
    <div className="bg-secondary/50 rounded-lg p-4 md:p-5 border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        {section.title}
      </h2>

      {section.content && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {section.content}
        </p>
      )}

      {section.items && (
        <div className="space-y-3">
          {section.items.map((item, index) => {
            const ItemIcon = item.icon;
            return (
              <div
                key={index}
                className="bg-secondary/30 rounded-md p-3 border-l-2 border-accent/50"
              >
                {item.title && ItemIcon && (
                  <div className="flex items-center gap-2 mb-2">
                    <ItemIcon className="h-4 w-4 text-accent/70 flex-shrink-0" />
                    <h3 className="text-base font-medium text-foreground">
                      {item.title}
                    </h3>
                  </div>
                )}
                <ul className="space-y-1 ml-6">
                  {item.items.map((listItem, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="text-sm text-muted-foreground list-disc"
                    >
                      {listItem}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const PrivacyPolicy = () => {
  const router = useRouter();

  const privacySections: PrivacySection[] = [
    {
      icon: Eye,
      title: "Introduction",
      content:
        "Welcome to Momento. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our social media platform.",
    },
    {
      icon: Database,
      title: "Information We Collect",
      items: [
        {
          icon: User,
          title: "Account Information",
          items: [
            "Name and username",
            "Email address",
            "Profile picture",
            "Bio/description",
          ],
        },
        {
          icon: FileText,
          title: "Content You Create",
          items: [
            "Posts and images you upload",
            "Reviews and comments",
            "Likes and saved posts",
          ],
        },
        {
          icon: Users,
          title: "Social Connections",
          items: ["Users you follow", "Users who follow you"],
        },
      ],
    },
    {
      icon: Lock,
      title: "How We Protect Your Data",
      content:
        "We implement security measures to protect your personal information:",
      items: [
        {
          items: [
            "Passwords are encrypted using industry-standard hashing (bcrypt)",
            "Private information (like email) is hidden from other users viewing your profile",
            "Secure session management for authenticated users",
            "Only you can edit or delete your own content",
          ],
        },
      ],
    },
    {
      icon: CheckCircle,
      title: "Your Rights",
      content: "You have the right to:",
      items: [
        {
          items: [
            "Access your personal data through your profile",
            "Update your profile information at any time",
            "Delete your account and all associated data",
            "Control who sees your content through privacy settings",
          ],
        },
      ],
    },
    {
      icon: Globe,
      title: "Third-Party Services",
      content:
        "Momento integrates with Unsplash API to provide external photo search functionality. When you search for external photos, your search queries are sent to Unsplash. Please review Unsplash's privacy policy for information about how they handle data.",
    },
    {
      icon: Mail,
      title: "Contact Us",
      content:
        "If you have any questions about this Privacy Policy, please contact us through the platform.",
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
            <Shield className="h-8 w-8 text-accent" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Privacy Policy
            </h1>
          </div>

          <p className="text-sm text-muted-foreground mb-8">
            Last updated: December 06, 2025
          </p>

          {/* Privacy Sections */}
          <div className="space-y-6">
            {privacySections.map((section, index) => (
              <PrivacySectionCard key={index} section={section} />
            ))}
          </div>
        </div>

        {/* Return to Home Button */}
        <div className="text-center">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
