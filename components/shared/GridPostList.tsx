import { useUserContext } from "@/context/AuthContext";
import Link from "next/link";
import PostStats from "./PostStats";

type GridPostListProps = {
  posts: any[];
  showUser?: boolean;
  showStats?: boolean;
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
}: GridPostListProps) => {
  const { user } = useUserContext();

  return (
    <ul className="grid-container p-10 max-md:p-5">
      {posts.map((post) => (
        <li key={post.$id || post.id} className="relative w-full aspect-square">
          <Link
            href={`/posts/${post.$id || post.id}`}
            className="grid-post_link h-full"
          >
            <img
              src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="post"
              className="h-full w-full object-cover"
            />
          </Link>

          <div className="grid-post_user">
            {showUser && (
              <div className="flex items-center justify-start gap-2 flex-1">
                <img
                  src={
                    post.creator?.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <p className="line-clamp-1">
                  {post.creator?.name || "Unknown"}
                </p>
              </div>
            )}
            {showStats && user && (
              <PostStats post={post} userId={user.id || user._id || user.$id || ""} />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default GridPostList;
