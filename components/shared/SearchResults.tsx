import GridPostList from "./GridPostList";
import Loader from "./Loader";

type SearchResultsProps = {
  isSearchFetching: boolean;
  searchedPosts?: any;
  isAuthenticated?: boolean;
  availablePostIds?: string[];
};

const SearchResults = ({
  isSearchFetching,
  searchedPosts,
  isAuthenticated = true,
  availablePostIds,
}: SearchResultsProps) => {
  if (isSearchFetching) {
    return <Loader />;
  }

  if (searchedPosts && searchedPosts.documents.length > 0) {
    let filteredPosts = searchedPosts.documents;

    if (!isAuthenticated && availablePostIds) {
      filteredPosts = searchedPosts.documents.filter((post: any) =>
        availablePostIds.includes(post._id || post.$id || post.id)
      );
    }

    if (filteredPosts.length > 0) {
      return <GridPostList posts={filteredPosts} />;
    }
  }

  return (
    <p className="text-light-4 mt-10 text-center w-full">No Results Found</p>
  );
};

export default SearchResults;
