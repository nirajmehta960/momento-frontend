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
import { SigninValidation } from "@/lib/validation";
import { z } from "zod";
import Loader from "@/components/shared/Loader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useSignInAccount } from "@/lib/react-query/queriesAndMutation";
import { useUserContext } from "@/context/AuthContext";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

const SigninForm = () => {
  const { toast } = useToast();
  const { checkAuthUser, setUser } = useUserContext();
  const router = useRouter();

  const { mutateAsync: signInAccount, isPending: isSigningIn } =
    useSignInAccount();

  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof SigninValidation>) {
    try {
      const session = await signInAccount({
        email: values.email,
        password: values.password,
      });

      if (!session) {
        toast({
          title: "Sign-In failed",
          description:
            "Invalid credentials. Please check your email/username and password.",
          variant: "destructive",
        });
        return;
      }

      // Use returned user data directly to update context immediately
      const userData = {
        ...session,
        id: (session as any)._id || (session as any).$id || (session as any).id,
        _id: (session as any)._id || (session as any).$id || (session as any).id,
        $id: (session as any)._id || (session as any).$id || (session as any).id,
      };
      setUser(userData);
      form.reset();
      // Navigate immediately without waiting for checkAuthUser
      router.push("/");
      // Verify in background without blocking navigation
      checkAuthUser().catch(() => {
        // Silent fail - user already navigated
      });
    } catch (error: any) {
      // Handle axios error response
      let errorMessage = "Invalid email/username or password. Please try again.";
      
      if (error?.response) {
        // Server responded with error status
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          error.message ||
          errorMessage;
      } else if (error?.message) {
        // Network error or other error
        errorMessage = error.message;
      }

      toast({
        title: "Sign-In failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="w-full bg-dark-3 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Form {...form}>
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
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
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Log In to account.
            </h1>
            <p className="text-muted-foreground">
              Welcome Back! enter your account details
            </p>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-2">
                    <FormLabel htmlFor="email" className="text-foreground">
                      Email or Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="text"
                        placeholder="Enter email or username"
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
            <Button
              type="submit"
              disabled={isSigningIn}
              className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium"
            >
              {isSigningIn ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign-In"
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="text-foreground font-medium underline hover:no-underline"
            >
              Create an account
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default SigninForm;
