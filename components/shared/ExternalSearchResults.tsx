import Link from "next/link";
import Loader from "./Loader";
import { Heart } from "lucide-react";

type ExternalSearchResultsProps = {
  isSearchFetching: boolean;
  searchedPhotos?: any;
};

const ExternalSearchResults = ({
  isSearchFetching,
  searchedPhotos,
}: ExternalSearchResultsProps) => {
  if (isSearchFetching) {
    return <Loader />;
  }

  if (
    searchedPhotos &&
    searchedPhotos.documents &&
    searchedPhotos.documents.length > 0
  ) {
    return (
      <ul className="grid-container p-10 max-md:p-5">
        {searchedPhotos.documents.map((photo: any) => (
          <li
            key={photo.id || photo.$id}
            className="relative w-full aspect-square"
          >
            <Link
              href={`/details/${photo.id || photo.$id}`}
              className="grid-post_link h-full"
            >
              <img
                src={
                  photo.imageUrl ||
                  photo.thumbnailUrl ||
                  "/assets/icons/profile-placeholder.svg"
                }
                alt={photo.description || "Photo"}
                className="h-full w-full object-cover"
              />
            </Link>

            <div className="grid-post_user">
              <div className="flex items-center justify-start gap-2 flex-1">
                {photo.user?.imageUrl && (
                  <img
                    src={photo.user.imageUrl}
                    alt={photo.user.name || "Photographer"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                )}
                <p className="line-clamp-1">
                  {photo.user?.name || "Unknown Photographer"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-white" />
                <p className="small-medium text-white">{photo.likes || 0}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p className="text-light-4 mt-10 text-center w-full">No Results Found</p>
  );
};

export default ExternalSearchResults;
