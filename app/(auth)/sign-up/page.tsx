"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SignupValidation } from "@/lib/validation";
import { z } from "zod";
import Loader from "@/components/shared/Loader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import {
  useCreateUserAccount,
  useSignInAccount,
} from "@/lib/react-query/queriesAndMutation";
import { useUserContext } from "@/context/AuthContext";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

const SignupForm = () => {
  const { toast } = useToast();
  const { checkAuthUser } = useUserContext();
  const router = useRouter();

  const { mutateAsync: createUserAccount, isPending: isCreatingAccount } =
    useCreateUserAccount();

  const { mutateAsync: signInAccount } = useSignInAccount();

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      role: "USER",
    },
  });

  async function onSubmit(values: z.infer<typeof SignupValidation>) {
    try {
      const newUser = await createUserAccount(values);
      if (!newUser) {
        return toast({
          title: "Sign-Up failed",
          description: "Unable to create account. Please try again.",
          variant: "destructive",
        });
      }

      const session = await signInAccount({
        email: values.email,
        password: values.password,
      });

      if (!session) {
        return toast({
          title: "Sign-In failed",
          description:
            "Account created but unable to sign in. Please try logging in.",
          variant: "destructive",
        });
      }

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
        router.push("/");
      } else {
        toast({
          title: "Sign-up failed",
          description: "Unable to verify your session. Please try logging in.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to create account. Please try again.";

      let description = errorMessage;
      if (
        errorMessage.toLowerCase().includes("email") ||
        errorMessage.toLowerCase().includes("username")
      ) {
        if (errorMessage.toLowerCase().includes("email")) {
          description =
            "This email is already registered. Please use a different email or try logging in.";
        } else if (errorMessage.toLowerCase().includes("username")) {
          description =
            "This username is already taken. Please choose a different username.";
        }
      }

      toast({
        title: "Sign-Up failed",
        description: description,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="w-full bg-dark-3 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Form {...form}>
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 border border-border rounded-lg flex-shrink-0">
              <Camera className="h-8 w-8 text-foreground" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-3xl font-bold text-foreground tracking-tight leading-tight">
                Momento
              </span>
              <span className="text-xs text-accent tracking-widest leading-tight">
                CAPTURE EVERY MOMENT
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Create a new account.
            </h1>
            <p className="text-muted-foreground">
              To use Momento enter your account details
            </p>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-2">
                    <FormLabel htmlFor="name" className="text-foreground">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-2">
                    <FormLabel htmlFor="username" className="text-foreground">
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter username"
                        className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-2">
                    <FormLabel htmlFor="email" className="text-foreground">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email"
                        className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-2">
                    <FormLabel htmlFor="password" className="text-foreground">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-2">
                    <FormLabel
                      htmlFor="accountType"
                      className="text-foreground"
                    >
                      Account Type
                    </FormLabel>
                    <FormControl>
                      <select
                        id="accountType"
                        {...field}
                        className="flex h-10 w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </FormControl>
                    <p className="text-xs text-accent">
                      Choose your account type. Admin accounts have additional
                      permissions.
                    </p>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isCreatingAccount}
              className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium"
            >
              {isCreatingAccount ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader />
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="text-center mt-4 text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-foreground font-medium underline hover:no-underline"
            >
              Log in
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default SignupForm;
