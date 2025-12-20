"use client";

import PostForm from "@/components/forms/PostForm";
import Loader from "@/components/shared/Loader";
import { useUserContext } from "@/context/AuthContext";
import { useGetPostById } from "@/lib/react-query/queriesAndMutation";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const EditPost = () => {
  const { id } = useParams();
  const postId = Array.isArray(id) ? id[0] : id || "";
  const { data: post, isPending } = useGetPostById(postId);
  const { isAuthenticated, isLoading } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isPending) return <Loader />;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="max-w-5xl flex-start gap-3 justify-start w-full">
          <img
            src="/assets/icons/add-post.svg"
            alt="add"
            width={36}
            height={36}
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Post</h2>
        </div>

        <PostForm action="Update" post={post} />
      </div>
    </div>
  );
};

export default EditPost;
