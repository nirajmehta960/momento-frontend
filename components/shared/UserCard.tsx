import Link from "next/link";

import { Button } from "../ui/button";

type UserCardProps = {
  user: any;
};

const UserCard = ({ user }: UserCardProps) => {
  return (
    <div className="user-card-wrapper">
      <div className="user-card">
        <img
          src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="creator"
          className="rounded-full w-20 h-20 object-cover mb-4"
        />

        <div className="flex-center flex-col gap-2 mb-6">
          <p className="base-medium text-light-1 text-center line-clamp-1 font-bold">
            {user.name}
          </p>
          <p className="small-regular text-light-3 text-center line-clamp-1">
            @{user.username}
          </p>
        </div>

        <div className="flex-center w-full">
          <Link href={`/profile/${user.$id || user.id || user._id}`}>
            <Button
              type="button"
              size="sm"
              className="bg-dark-3 text-light-1 hover:bg-primary-500 hover:text-white transition rounded-lg px-5 py-2 font-medium"
            >
              Visit Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
