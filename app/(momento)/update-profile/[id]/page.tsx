"use client";

import { useEffect } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";

import { useUserContext } from "@/context/AuthContext";
import { ProfileValidation } from "@/lib/validation";
import {
  useGetUserById,
  useUpdateUser,
} from "@/lib/react-query/queriesAndMutation";
import { uploadProfileImage } from "@/lib/api/client";
import Loader from "@/components/shared/Loader";
import ProfileUploader from "./ProfileUploader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
const UpdateProfile = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { id } = useParams();
  const userId = Array.isArray(id) ? id[0] : id || "";
  const {
    user,
    setUser,
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useUserContext();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [isAuthenticated, isAuthLoading, router]);
  const form = useForm<z.infer<typeof ProfileValidation>>({
    resolver: zodResolver(ProfileValidation),
    defaultValues: {
      file: [],
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio || "",
      password: "",
    },
  });

  const { data: currentUser } = useGetUserById(userId);
  const { mutateAsync: updateUser, isPending: isLoadingUpdate } =
    useUpdateUser();

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  const handleUpdate = async (value: z.infer<typeof ProfileValidation>) => {
    if (isAuthenticated) {
      let imageUrl = (currentUser as any).imageUrl;
      let imageId = (currentUser as any).imageId;
      let imageData = (currentUser as any).imageData;
      let imageMimeType = (currentUser as any).imageMimeType;

      if (value.file && value.file.length > 0) {
        try {
          const uploadResult = await uploadProfileImage(value.file[0]);
          imageUrl = uploadResult.imageUrl;
          imageId = uploadResult.imageId;
          imageData = uploadResult.imageData;
          imageMimeType = uploadResult.imageMimeType;
        } catch (error) {
          toast({
            title: "Failed to upload image. Please try again.",
          });
          return;
        }
      }

      const updatePayload: any = {
        userId: (currentUser as any).$id || (currentUser as any).id || userId,
        name: value.name,
        bio: value.bio,
        file: value.file,
      };

      if (value.password && value.password.trim() !== "") {
        updatePayload.password = value.password;
      }

      if (imageUrl) updatePayload.imageUrl = imageUrl;
      if (imageId) updatePayload.imageId = imageId;
      if (imageData) updatePayload.imageData = imageData;
      if (imageMimeType) updatePayload.imageMimeType = imageMimeType;

      const updatedUser = await updateUser(updatePayload);

      if (!updatedUser) {
        toast({
          title: `Update user failed. Please try again.`,
        });
        return;
      }

      setUser({
        ...user,
        name: (updatedUser as any)?.name,
        bio: (updatedUser as any)?.bio,
        imageUrl: (updatedUser as any)?.imageUrl,
      });
      return router.push(`/profile/${userId}`);
    } else {
      toast({
        title: `Please login to update your profile.`,
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Profile</h2>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="flex flex-col gap-7 w-full mt-4 max-w-5xl"
          >
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem className="flex">
                  <FormControl>
                    <ProfileUploader
                      fieldChange={field.onChange}
                      mediaUrl={(currentUser as any).imageUrl}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input !bg-dark-4"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Username</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input !bg-dark-4"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      className="shad-textarea custom-scrollbar !bg-dark-4"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">
                    New Password (leave blank to keep current password)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      className="shad-input !bg-dark-4"
                      placeholder="Enter new password (min 8 characters)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <div className="flex gap-4 items-center justify-end">
              <Button
                type="button"
                className="h-10 px-4 text-sm hover:scale-110 transition hover:bg-dark-4 hover:text-white"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-dark-4 hover:bg-white hover:text-black transition text-white"
                disabled={isLoadingUpdate}
              >
                {isLoadingUpdate ? <Loader /> : "Update Profile"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdateProfile;
