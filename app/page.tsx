"use client";

import { useUserContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";
import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import Topbar from "@/components/shared/Topbar";
import PostCard from "@/components/shared/PostCard";
import { useGetRecentPosts } from "@/lib/react-query/queriesAndMutation";
import { Button } from "@/components/ui/button";

export default function RootPage() {
  const { isAuthenticated, isLoading } = useUserContext();
  const { data: posts, isPending: isPostLoading } = useGetRecentPosts();

  if (isLoading) {
    return (
      <div className="flex-center w-full h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <LeftSidebar />
      <div className="flex-1 md:ml-[80px] lg:ml-[300px] transition-all w-full">
        <Topbar />
        <section className="flex flex-1 md:h-screen min-h-[100vh] w-full pb-20 md:pb-0">
          <div className="flex flex-1 justify-center">
            <div className="w-full max-w-5xl">
              <div className="home-container px-0 md:px-0 lg:px-0">
                <div className="home-posts">
                  <h2 className="h3-bold md:h2-bold text-left w-full">
                    Home Feed
                  </h2>

                  {isPostLoading && !posts ? (
                    <Loader />
                  ) : (
                    <>
                      <ul className="flex flex-col flex-1 gap-9 w-full items-center px-2 sm:px-0">
                        {(isAuthenticated
                          ? posts?.documents
                          : posts?.documents?.slice(0, 3)
                        )?.map((post: any) => (
                          <li
                            key={post.$id || post.id}
                            className="w-full flex justify-center max-w-full"
                          >
                            <PostCard post={post} />
                          </li>
                        ))}
                      </ul>
                      {!isAuthenticated &&
                        posts?.documents &&
                        posts.documents.length > 3 && (
                          <div className="flex-center flex-col gap-4 mt-8 p-6 border border-dark-4 rounded-lg bg-dark-2 mx-auto max-w-md">
                            <p className="text-light-1 base-medium text-center">
                              Sign in to see more posts
                            </p>
                            <Button
                              onClick={() =>
                                (window.location.href = "/sign-in")
                              }
                              className="bg-white text-black hover:bg-gray-300"
                            >
                              Sign In
                            </Button>
                          </div>
                        )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        <Bottombar />
      </div>
    </div>
  );
}
