import Link from "next/link";
import { useUserContext } from "@/context/AuthContext";
import { Camera, LogOut, Menu, User, Info, Shield } from "lucide-react";
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutation";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

const Topbar = () => {
  const { user, isAuthenticated, signOut } = useUserContext();
  const { mutate: signOutMutation, isSuccess } = useSignOutAccount();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSuccess) {
      signOut().then(() => {
        router.push("/sign-in");
      });
    }
  }, [isSuccess, router, signOut]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleLogout = () => {
    setShowProfileMenu(false);
    signOutMutation();
  };

  return (
    <section className="topbar">
      <div className="flex-between py-4 px-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="p-2 border border-white rounded-lg flex-shrink-0">
            <Camera className="h-8 w-8 text-white" />
          </div>
          <div className="hidden md:flex flex-col justify-center">
            <span className="text-3xl font-bold text-white tracking-tight leading-tight">
              Momento
            </span>
            <span className="text-xs text-accent tracking-widest leading-tight">
              CAPTURE EVERY MOMENT
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex-center gap-3"
                >
                  <img
                    src={
                      user.imageUrl || "/assets/icons/profile-placeholder.svg"
                    }
                    alt="profile"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-dark-3 border border-dark-4 rounded-lg shadow-lg z-50 overflow-hidden">
                    <Link
                      href={`/profile/${user.id}`}
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-white hover:bg-dark-4 transition-colors"
                    >
                      <User className="h-5 w-5" strokeWidth={2} />
                      <span className="text-sm base-medium">Profile</span>
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-white hover:bg-dark-4 transition-colors border-t border-dark-4"
                      >
                        <Menu className="h-5 w-5" strokeWidth={2} />
                        <span className="text-sm base-medium">Admin</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-dark-4 transition-colors border-t border-dark-4"
                    >
                      <LogOut className="h-5 w-5" strokeWidth={2} />
                      <span className="text-sm base-medium">Logout</span>
                    </button>
                    <Link
                      href="/about"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-white hover:bg-dark-4 transition-colors border-t border-dark-4"
                    >
                      <Info className="h-5 w-5" strokeWidth={2} />
                      <span className="text-sm base-medium">About</span>
                    </Link>
                    <Link
                      href="/privacy"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 text-white hover:bg-dark-4 transition-colors border-t border-dark-4"
                    >
                      <Shield className="h-5 w-5" strokeWidth={2} />
                      <span className="text-sm base-medium">
                        Privacy Policy
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="flex items-center justify-center gap-2 px-4 py-3 text-white hover:bg-dark-4 rounded-lg transition-all duration-200 border border-dark-4"
              >
                <LogOut className="h-5 w-5" strokeWidth={2} />
                <span className="text-sm base-medium">Sign-in</span>
              </Link>
              <Link
                href="/sign-up"
                className="flex items-center justify-center gap-2 px-4 py-3 text-white hover:bg-dark-4 rounded-lg transition-all duration-200 border border-dark-4 bg-dark-4"
              >
                <LogOut className="h-5 w-5" strokeWidth={2} />
                <span className="text-sm base-medium">Sign-up</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Topbar;
