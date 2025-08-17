import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import {
  CheckCircleIcon,
  MapPinIcon,
  UserPlusIcon,
  UsersIcon,
  MessageCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { capitialize } from "../lib/utils";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  return (
    <div className="bg-base-100 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Your Friends
            </h1>
            <p className="text-base-content/70 mt-1">Connect and practice languages together</p>
          </div>
          <Link to="/notifications" className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all">
            <UsersIcon className="size-4" />
            Friend Requests
          </Link>
        </div>

        {/* Friends Section */}
        {loadingFriends ? (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <span className="loading loading-spinner loading-lg text-primary" />
              <p className="text-base-content/60">Loading your friends...</p>
            </div>
          </div>
        ) : friends.length === 0 ? (
          <div className="animate-fade-in">
            <NoFriendsFound />
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {friends.map((friend, index) => (
                <div 
                  key={friend._id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <FriendCard friend={friend} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WhatsApp-Style Interface Showcase */}
        <div className="animate-fade-in">
          <div className="card bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 shadow-xl">
            <div className="card-body p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                    Experience Our New <span className="text-primary">WhatsApp-Style</span> Chat
                  </h2>
                  <p className="text-base-content/70 text-lg mb-6 leading-relaxed">
                    Enjoy a modern, intuitive messaging experience with beautiful themes, 
                    real-time messaging, file sharing, and group chat functionality - all in a 
                    familiar WhatsApp-like interface.
                  </p>
                  <div className="flex flex-wrap gap-3 mb-6 justify-center lg:justify-start">
                    <div className="badge badge-primary gap-2">
                      <MessageCircle className="w-3 h-3" />
                      Real-time Messaging
                    </div>
                    <div className="badge badge-secondary gap-2">
                      <UsersIcon className="w-3 h-3" />
                      Group Chats
                    </div>
                    <div className="badge badge-accent gap-2">
                      <Sparkles className="w-3 h-3" />
                      Multiple Themes
                    </div>
                  </div>
                  <Link 
                    to="/whatsapp" 
                    className="btn btn-primary btn-lg gap-3 shadow-lg hover:shadow-xl transition-all"
                  >
                    Try WhatsApp Interface
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
                
                <div className="flex-shrink-0">
                  <div className="mockup-phone border-primary">
                    <div className="camera"></div>
                    <div className="display">
                      <div className="artboard artboard-demo phone-1 bg-gradient-to-b from-base-100 to-base-200">
                        <div className="p-4 space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-base-100 rounded-lg shadow-sm">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              JD
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm">John Doe</h3>
                              <p className="text-xs text-base-content/60 truncate">Hey! Ready for our language session?</p>
                            </div>
                            <div className="text-xs text-primary font-semibold">2m</div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-base-100 rounded-lg shadow-sm">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white">
                              <UsersIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm">Study Group</h3>
                              <p className="text-xs text-base-content/60 truncate">Alice: Thanks for the grammar tips! 👍</p>
                            </div>
                            <div className="bg-primary text-primary-content rounded-full px-1.5 py-0.5 text-xs font-semibold min-w-[16px] text-center">
                              3
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-base-100 rounded-lg shadow-sm opacity-60">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              SM
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm">Sarah Miller</h3>
                              <p className="text-xs text-base-content/60 truncate">See you tomorrow for practice!</p>
                            </div>
                            <div className="text-xs text-base-content/50">1h</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider divider-primary">
          <span className="text-primary font-semibold">Discover More</span>
        </div>

        <section className="animate-fade-in">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Meet New Learners
                </h2>
                <p className="text-base-content/70 mt-1">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">
                No recommendations available
              </h3>
              <p className="text-base-content opacity-70">
                Check back later for new language partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300 h-full"
                  >
                    <div className="card-body p-5 space-y-4 flex flex-col justify-between h-full">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full">
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">
                            {user.fullName}
                          </h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && (
                        <p className="text-sm opacity-70">{user.bio}</p>
                      )}

                      <button
                        className={`btn w-full mt-2 ${
                          hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                        }`}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
