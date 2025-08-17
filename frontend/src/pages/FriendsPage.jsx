import { useQuery } from "@tanstack/react-query";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import { getUserFriends } from "../lib/api";
import { SearchIcon, UsersIcon } from "lucide-react";
import BackButton from "../components/BackButton";
import { useState } from "react";

const FriendsPage = () => {
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const filteredFriends = friends.filter(friend =>
    friend.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.nativeLanguage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.learningLanguage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-br from-base-100 via-base-200/20 to-base-100 p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="container mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackButton customRedirect="/" showAlways={true} />
            <div className="w-3 h-12 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Your Friends
              </h1>
              <p className="text-base-content/60 mt-1">
                {friends.length} friend{friends.length !== 1 ? 's' : ''} in your network
              </p>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-md w-full sm:w-auto">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 size-5" />
            <input
              type="text"
              placeholder="Search friends..."
              className="input input-bordered w-full pl-12 bg-base-100/50 backdrop-blur-sm border-base-300/50 focus:border-primary/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loadingFriends ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="text-base-content/60">Loading your friends...</p>
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="text-center py-16">
            {searchTerm ? (
              <div>
                <UsersIcon className="h-20 w-20 mx-auto mb-6 text-base-content/20" />
                <h3 className="text-2xl font-bold mb-3">No friends found</h3>
                <p className="text-base-content/60 mb-6">Try adjusting your search term</p>
                <button 
                  className="btn btn-ghost hover:bg-base-300/50 active:bg-base-300/70 transition-all duration-200 hover:scale-105 active:scale-95" 
                  onClick={() => setSearchTerm("")}
                  title="Clear search filter"
                  aria-label="Clear search filter"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <NoFriendsFound />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFriends.map((friend) => (
              <div key={friend._id} className="hover-lift">
                <FriendCard friend={friend} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;

