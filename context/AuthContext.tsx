"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, signOutAccount } from "@/lib/api/client";
import { INITIAL_USER } from "@/constants";
import { IUser } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

interface IContextType {
  user: IUser;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  checkAuthUser: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

export const INITIAL_STATE = {
  user: INITIAL_USER,
  isLoading: false,
  isAuthenticated: false,
  setUser: () => {},
  checkAuthUser: async () => false as boolean,
  signOut: async () => {},
};

const AuthContext = createContext<IContextType>(INITIAL_STATE);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();

  const checkAuthUser = async () => {
    try {
      setIsLoading(true);
      const currentAccount = await getCurrentUser();

      if (currentAccount) {
        setUser({
          ...currentAccount,
          id: (currentAccount as any)._id || (currentAccount as any).$id || (currentAccount as any).id,
          _id: (currentAccount as any)._id || (currentAccount as any).$id || (currentAccount as any).id,
          $id: (currentAccount as any)._id || (currentAccount as any).$id || (currentAccount as any).id,
        });
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      // Silently fail - user will be redirected to sign-in if needed
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await signOutAccount();
      setUser(INITIAL_USER);
      setIsAuthenticated(false);
      queryClient.clear();
    } catch (error) {
      // Silently fail - clear local state anyway
      setUser(INITIAL_USER);
      setIsAuthenticated(false);
      queryClient.clear();
    }
  };

  useEffect(() => {
    checkAuthUser();
  }, []);

  // Automatically set isAuthenticated when user data is set
  useEffect(() => {
    if (user && user.id && user.id !== INITIAL_USER.id) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [user]);

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    checkAuthUser,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useUserContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useUserContext must be used within AuthProvider");
  }
  return context;
};
