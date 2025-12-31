"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FileUploader from "@/components/shared/FileUploader";
import { PostValidation, UpdatePostValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  useCreatePost,
  useUpdatePost,
} from "@/lib/react-query/queriesAndMutation";
import Loader from "@/components/shared/Loader";

type PostFormProps = {
  post?: any;
  action: "Create" | "Update";
};

const PostForm = ({ post, action }: PostFormProps) => {
  const { mutateAsync: createPost, isPending: isLoadingCreate } =
    useCreatePost();
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } =
    useUpdatePost();
  const { user } = useUserContext();
  const { toast } = useToast();
  const router = useRouter();

  const validationSchema = action === "Update" ? UpdatePostValidation : PostValidation;
  
  type FormData = {
    caption: string;
    file: File[];
    location?: string;
    tags?: string;
  };
  
  const form = useForm<FormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      caption: post ? post?.caption : "",
      file: [],
      location: post ? post?.location : "",
      tags: post ? post.tags.join(",") : "",
    },
  });

  async function onSubmit(values: FormData) {
    if (post && action === "Update") {
      const postId = post.$id || post.id || post._id;
      if (!postId) {
        toast({ 
          title: "Error", 
          description: "Post ID not found. Please try again." 
        });
        return;
      }

      // When updating, only send caption, location, and tags
      // Images cannot be changed
      const updatedPost = await updatePost({
        caption: values.caption,
        location: values.location,
        tags: values.tags,
        postId: postId,
        // Do not include file, imageId, or imageUrl
      });
      if (!updatedPost) {
        toast({ title: "Please try again." });
      }

      return router.push(`/posts/${postId}`);
    }

    const userId = user?.id || user?._id || user?.$id;
    if (!userId) {
      toast({
        title: "Error",
        description: "User not found. Please sign in again.",
      });
      return;
    }

    const newPost = await createPost({
      ...values,
      userId: userId,
    });

    if (!newPost) {
      toast({
        title: "Please try again.",
      });
    }

    router.push("/");
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-full max-w-5xl"
      >
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Caption</FormLabel>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar !bg-dark-4"
                  placeholder="Write your caption..."
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        {action === "Create" && (
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Add Photos</FormLabel>
                <FormControl>
                  <FileUploader
                    fieldChange={field.onChange}
                    mediaUrl={post?.imageUrl}
                  />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />
        )}
        {action === "Update" && (
          <div className="space-y-2">
            <FormLabel className="shad-form_label">Post Image</FormLabel>
            <div className="flex flex-center flex-col bg-dark-4 rounded-xl p-4">
              <div className="flex flex-1 justify-center items-center w-full p-3 lg:p-4 h-48 lg:h-64 overflow-hidden">
                <img 
                  src={post?.imageUrl} 
                  alt="Post" 
                  className="file_uploader-img max-h-full max-w-full object-contain"
                />
              </div>
              <p className="text-muted-foreground text-sm mt-2">
                Image cannot be changed when editing a post
              </p>
            </div>
          </div>
        )}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Location</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="shad-input"
                  placeholder="Enter location..."
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Add Tags (separated by comma ",")
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="shad-input"
                  placeholder="travel, photography, nature..."
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <div className="flex gap-3 items-center justify-end mt-2">
          <Button
            type="button"
            onClick={() => router.back()}
            className="h-10 px-4 text-sm hover:scale-110 transition hover:bg-dark-4 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            className="h-10 px-4 text-sm bg-dark-4 hover:bg-white hover:text-black transition text-white"
            type="submit"
            disabled={isLoadingCreate || isLoadingUpdate}
          >
            {isLoadingCreate || isLoadingUpdate ? <Loader /> : `${action}`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;
