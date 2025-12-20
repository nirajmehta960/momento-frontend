"use client";

import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import SearchResults from "@/components/shared/SearchResults";
import ExternalSearchResults from "@/components/shared/ExternalSearchResults";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import {
  useGetPosts,
  useSearchPosts,
  useSearchExternal,
} from "@/lib/react-query/queriesAndMutation";
import { useEffect, useState, Suspense, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useSearchParams, useRouter } from "next/navigation";
import { useUserContext } from "@/context/AuthContext";

type SearchType = "local" | "external";
type SortOption = "latest" | "oldest" | "mostLiked" | "mostReviewed";

const ExploreContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ref, InView] = useInView();
  const { isAuthenticated } = useUserContext();
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "latest"
  );
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const { data: posts, fetchNextPage, hasNextPage } = useGetPosts(sortBy);

  const [searchValue, setsearchValue] = useState(searchParams.get("q") || "");
  const [searchType, setSearchType] = useState<SearchType>(
    (searchParams.get("type") as SearchType) || "local"
  );

  const debouncedValue = useDebounce(searchValue, 500);
  const { data: searchedPosts, isFetching: isSearchFetching } =
    useSearchPosts(debouncedValue);
  const { data: searchedPhotos, isFetching: isExternalSearchFetching } =
    useSearchExternal(debouncedValue, 1);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchValue) {
      params.set("q", searchValue);
    }
    if (searchType !== "local") {
      params.set("type", searchType);
    }
    const newUrl = params.toString()
      ? `/explore?${params.toString()}`
      : "/explore";
    router.replace(newUrl, { scroll: false });
  }, [searchValue, searchType, router]);

  useEffect(() => {
    if (InView && !searchValue && hasNextPage && searchType === "local") {
      fetchNextPage();
    }
  }, [InView, searchValue, hasNextPage, fetchNextPage, searchType]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target as Node)
      ) {
        setShowFilterMenu(false);
      }
    };

    if (showFilterMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterMenu]);

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
    setShowFilterMenu(false);
    const params = new URLSearchParams(searchParams.toString());
    if (option !== "latest") {
      params.set("sort", option);
    } else {
      params.delete("sort");
    }
    router.replace(`/explore?${params.toString()}`, { scroll: false });
  };

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case "latest":
        return "Latest";
      case "oldest":
        return "Oldest";
      case "mostLiked":
        return "Most Liked";
      case "mostReviewed":
        return "Most Reviewed";
      default:
        return "Latest";
    }
  };

  if (!posts) {
    return (
      <div className="flex-center w-full h-screen">
        <Loader />
      </div>
    );
  }

  const shouldShowSearchResults = searchValue !== "";
  const shouldShowPosts =
    !shouldShowSearchResults &&
    posts.pages.every((item) => item?.documents.length === 0);

  const firstPagePosts = posts.pages[0]?.documents || [];
  const availablePostsForAnonymous = firstPagePosts.slice(0, 3);
  const availablePostIds = availablePostsForAnonymous.map(
    (post: any) => post._id || post.$id || post.id
  );

  return (
    <div className="explore-container">
      <div className="explore-inner_container">
        <h2 className="h3-bold md:h2-bold w-full">Search</h2>
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-2">
          <img
            src="/assets/icons/search.svg"
            alt="search"
            width={24}
            height={24}
          />
          <Input
            type="text"
            placeholder="Search posts or photos..."
            className="explore-search"
            value={searchValue}
            onChange={(e) => {
              setsearchValue(e.target.value);
            }}
          />
        </div>
      </div>

      {shouldShowSearchResults && (
        <div className="flex gap-2 mt-4 mb-4">
          <button
            onClick={() => {
              setSearchType("local");
            }}
            className={`px-4 py-2 rounded-lg transition ${
              searchType === "local"
                ? "bg-white text-black"
                : "bg-dark-4 text-light-2 hover:bg-gray-800"
            }`}
          >
            <p className="small-medium md:base-medium">Local Posts</p>
          </button>
          <button
            onClick={() => {
              setSearchType("external");
            }}
            className={`px-4 py-2 rounded-lg transition ${
              searchType === "external"
                ? "bg-white text-black"
                : "bg-dark-4 text-light-2 hover:bg-gray-800"
            }`}
          >
            <p className="small-medium md:base-medium">External Photos</p>
          </button>
        </div>
      )}

      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className="body-bold md:h3-bold">
          {shouldShowSearchResults
            ? searchType === "local"
              ? "Search Results - Posts"
              : "Search Results - Photos"
            : "Popular today"}
        </h3>

        {!shouldShowSearchResults && (
          <div className="relative" ref={filterMenuRef}>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer hover:bg-dark-4 transition"
            >
              <p className="small-medium md:base-medium text-light-2">
                {getSortLabel(sortBy)}
              </p>
              <img
                src="/assets/icons/filter.svg"
                width={20}
                height={20}
                alt="filter"
              />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-dark-2 border border-dark-4 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => handleSortChange("latest")}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-dark-3 transition ${
                    sortBy === "latest"
                      ? "text-white bg-dark-3"
                      : "text-light-2"
                  }`}
                >
                  Latest
                </button>
                <button
                  onClick={() => handleSortChange("oldest")}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-dark-3 transition ${
                    sortBy === "oldest"
                      ? "text-white bg-dark-3"
                      : "text-light-2"
                  }`}
                >
                  Oldest
                </button>
                <button
                  onClick={() => handleSortChange("mostLiked")}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-dark-3 transition ${
                    sortBy === "mostLiked"
                      ? "text-white bg-dark-3"
                      : "text-light-2"
                  }`}
                >
                  Most Liked
                </button>
                <button
                  onClick={() => handleSortChange("mostReviewed")}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-dark-3 transition ${
                    sortBy === "mostReviewed"
                      ? "text-white bg-dark-3"
                      : "text-light-2"
                  }`}
                >
                  Most Reviewed
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {shouldShowSearchResults ? (
          searchType === "local" ? (
            <SearchResults
              isSearchFetching={isSearchFetching}
              searchedPosts={searchedPosts}
              isAuthenticated={isAuthenticated}
              availablePostIds={availablePostIds}
            />
          ) : (
            <ExternalSearchResults
              isSearchFetching={isExternalSearchFetching}
              searchedPhotos={searchedPhotos}
            />
          )
        ) : shouldShowPosts ? (
          <p className="text-light-1 mt-10 text-center w-full">End of Posts</p>
        ) : (
          <>
            <GridPostList
              posts={
                isAuthenticated
                  ? posts.pages.flatMap((item) => item.documents || [])
                  : firstPagePosts.slice(0, 3)
              }
            />
            {!isAuthenticated && firstPagePosts.length > 3 && (
              <div className="flex-center flex-col gap-4 mt-8 p-6 border border-dark-4 rounded-lg bg-dark-2 w-full max-w-md mx-auto">
                <p className="text-light-1 base-medium text-center">
                  Sign in to see more posts
                </p>
                <button
                  onClick={() => router.push("/sign-in")}
                  className="bg-white text-black hover:bg-gray-300 px-6 py-2 rounded-lg font-semibold transition"
                >
                  Sign In
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {hasNextPage && !searchValue && searchType === "local" && (
        <div ref={ref} className="mt-5">
          <Loader />
        </div>
      )}
    </div>
  );
};

const Explore = () => {
  return (
    <Suspense
      fallback={
        <div className="flex-center w-full h-screen">
          <Loader />
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
};

export default Explore;
