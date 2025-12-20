"use client";

import { useGetCurrentUser } from "@/lib/react-query/queriesAndMutation";
import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { useUserContext } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/react-query/queryKeys";

const Saved = () => {
  const { data: currentUser } = useGetCurrentUser();
  const { isAuthenticated, isLoading } = useUserContext();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    }
  }, [isAuthenticated, isLoading, queryClient]);

  const savePosts =
    (currentUser as any)?.save
      ?.filter(
        (savePost: any) =>
          savePost?.post &&
          (savePost.post._id || savePost.post.$id || savePost.post.id)
      )
      ?.map((savePost: any) => ({
        ...savePost.post,
        $id: savePost.post._id || savePost.post.$id || savePost.post.id,
        id: savePost.post._id || savePost.post.$id || savePost.post.id,
        creator: savePost.post?.creator || {
          imageUrl: (currentUser as any).imageUrl,
          name: (currentUser as any).name,
          username: (currentUser as any).username,
          id: (currentUser as any).id,
          $id: (currentUser as any).id,
          _id: (currentUser as any).id,
        },
      }))
      .reverse() || [];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full max-w-5xl">
        <img
          src="/assets/icons/save.svg"
          width={36}
          height={36}
          alt="edit"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
      </div>

      {!currentUser ? (
        <Loader />
      ) : (
        <ul className="w-full flex justify-center max-w-5xl gap-9">
          {savePosts.length === 0 ? (
            <p className="text-slate-400">No available posts</p>
          ) : (
            <GridPostList posts={savePosts} showStats={false} />
          )}
        </ul>
      )}
    </div>
  );
};

export default Saved;
