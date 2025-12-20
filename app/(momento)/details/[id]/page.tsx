"use client";

import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetExternalDetails,
  useGetReviewsByExternalContent,
} from "@/lib/react-query/queriesAndMutation";
import ReviewList from "@/components/shared/ReviewList";
import { timeAgo } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { ExternalLink, Heart, Download, ArrowLeft } from "lucide-react";

const ExternalDetails = () => {
  const router = useRouter();
  const { id } = useParams();
  const photoId = Array.isArray(id) ? id[0] : id || "";
  const { data: photo, isPending } = useGetExternalDetails(photoId);
  const { isAuthenticated } = useUserContext();
  const { data: reviewsData, isLoading: isLoadingReviews } =
    useGetReviewsByExternalContent(photoId);
  const reviews =
    (reviewsData as any)?.documents ||
    (Array.isArray(reviewsData) ? reviewsData : []);

  if (isPending) {
    return (
      <div className="flex-center w-full h-screen">
        <Loader />
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="post_details-container">
        <div className="post_details-card">
          <div className="post_details-info">
            <h2 className="h3-bold md:h2-bold text-light-1">Photo not found</h2>
            <p className="text-light-3">
              The photo you're looking for doesn't exist.
            </p>
            <Button
              onClick={() => router.push("/explore")}
              className="bg-white text-black hover:bg-gray-300 mt-4"
            >
              Go to Explore
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const photoData = photo as any;

  return (
    <div className="post_details-container">
      <Button
        onClick={() => router.back()}
        variant="ghost"
        className="mb-4 self-start flex items-center gap-2 text-light-1 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </Button>
      <div className="post_details-card">
        <div className="post_details-img-wrapper relative">
          <img
            src={photoData?.imageUrl || photoData?.fullUrl}
            alt={photoData?.description || "Photo"}
            className="post_details-img"
          />
          {photoData?.links?.html && (
            <a
              href={photoData.links.html}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-5 right-5 bg-black/50 hover:bg-black/70 rounded-full p-2 transition"
              title="View on Unsplash"
            >
              <ExternalLink className="w-5 h-5 text-white" />
            </a>
          )}
        </div>
        <div className="post_details-info">
          <div className="flex-between w-full">
            <div className="flex items-center gap-3">
              {photoData?.user?.imageUrl && (
                <img
                  src={photoData.user.imageUrl}
                  alt={photoData.user.name || "Photographer"}
                  className="rounded-full w-12 h-12 lg:w-16 lg:h-16 object-cover"
                />
              )}
              <div className="flex flex-col">
                <p className="base-medium lg:body-bold text-light-1">
                  {photoData?.user?.name || "Unknown Photographer"}
                </p>
                {photoData?.user?.username && (
                  <p className="subtle-semibold lg:small-regular text-slate-400">
                    @{photoData.user.username}
                  </p>
                )}
                {photoData?.user?.location && (
                  <p className="subtle-semibold lg:small-regular text-slate-400">
                    📍 {photoData.user.location}
                  </p>
                )}
              </div>
            </div>
            {photoData?.links?.download && (
              <a
                href={photoData.links.download}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white text-black hover:bg-gray-300 px-4 py-2 rounded-lg transition"
                title="Download photo"
              >
                <Download className="w-4 h-4" />
                <span className="small-medium">Download</span>
              </a>
            )}
          </div>

          <hr className="border w-full border-dark-4/80" />

          <div className="flex flex-col flex-1 w-full gap-4">
            {photoData?.description && (
              <div>
                <p className="small-medium lg:base-regular text-light-1">
                  {photoData.description}
                </p>
              </div>
            )}

            <div className="flex items-center gap-6 text-slate-400">
              {photoData?.likes !== undefined && (
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span className="small-medium">{photoData.likes} likes</span>
                </div>
              )}
              {photoData?.width && photoData?.height && (
                <div className="small-medium">
                  {photoData.width} × {photoData.height}
                </div>
              )}
              {photoData?.createdAt && (
                <div className="small-medium">
                  {timeAgo(photoData.createdAt)}
                </div>
              )}
            </div>

            {photoData?.tags &&
              Array.isArray(photoData.tags) &&
              photoData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {photoData.tags.map((tag: any, index: number) => (
                    <span
                      key={index}
                      className="text-light-3 small-regular bg-dark-4 px-3 py-1 rounded-full"
                    >
                      #{tag.title || tag}
                    </span>
                  ))}
                </div>
              )}

            {photoData?.exif && Object.keys(photoData.exif).length > 0 && (
              <div className="mt-4 p-4 bg-dark-4 rounded-lg">
                <h3 className="small-semibold text-light-1 mb-2">
                  Photo Details
                </h3>
                <div className="flex flex-col gap-1 text-slate-400 small-regular">
                  {photoData.exif.make && (
                    <p>
                      Camera: {photoData.exif.make} {photoData.exif.model}
                    </p>
                  )}
                  {photoData.exif.exposure_time && (
                    <p>Exposure: {photoData.exif.exposure_time}s</p>
                  )}
                  {photoData.exif.aperture && (
                    <p>Aperture: f/{photoData.exif.aperture}</p>
                  )}
                  {photoData.exif.focal_length && (
                    <p>Focal Length: {photoData.exif.focal_length}mm</p>
                  )}
                  {photoData.exif.iso && <p>ISO: {photoData.exif.iso}</p>}
                </div>
              </div>
            )}
          </div>

          <div className="w-full mt-6 pt-6 border-t border-dark-4/80">
            <ReviewList
              externalContentId={photoId}
              reviews={reviews}
              isLoading={isLoadingReviews}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalDetails;
