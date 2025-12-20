"use client";

import PostForm from "@/components/forms/PostForm";
import { useUserContext } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const CreatePost = () => {
  const { isAuthenticated, isLoading } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="common-container-create">
        <div className="max-w-5xl flex-start gap-2 justify-start w-full">
          <img
            src="/assets/icons/add-post.svg"
            alt="add"
            width={28}
            height={28}
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Create Post</h2>
        </div>

        <PostForm action="Create" />
      </div>
    </div>
  );
};

export default CreatePost;
