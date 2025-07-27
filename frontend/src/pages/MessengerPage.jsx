import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getUserFriends, getStreamToken } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  MessageCircleIcon,
  PhoneIcon,
  SearchIcon,
  VideoIcon,
  HomeIcon,
  UsersIcon,
  BellIcon,
  MoreVerticalIcon,
} from "lucide-react";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const MessengerPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { authUser } = useAuthUser();

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  const filteredFriends = friends.filter((friend) =>
    friend.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser || !targetUserId) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();
        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });
      toast.success("Video call link sent successfully!");
    }
  };

  const handleFriendClick = (friendId) => {
    navigate(`/messenger/${friendId}`);
  };

  const selectedFriend = friends.find((f) => f._id === targetUserId);
  const [showFriendsList, setShowFriendsList] = useState(!targetUserId);
  const [isMobile, setIsMobile] = useState(false);

  // Better mobile detection with resize listener
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-base-100 via-base-200/20 to-base-100 ">
      {/* Quick Navigation Bar - Desktop Only */}
      {!isMobile && (
        <div className="hidden lg:flex w-16 bg-base-200/80 backdrop-blur-md border-r border-base-300 flex-col items-center py-4 space-y-4 flex-shrink-0">
          <button
            className="btn btn-ghost btn-circle tooltip tooltip-right"
            data-tip="Home"
            onClick={() => navigate("/")}
          >
            <HomeIcon className="h-5 w-5" />
          </button>
          <button
            className="btn btn-ghost btn-circle tooltip tooltip-right"
            data-tip="Friends"
            onClick={() => navigate("/friends")}
          >
            <UsersIcon className="h-5 w-5" />
          </button>
          <button
            className="btn btn-primary btn-circle tooltip tooltip-right"
            data-tip="Messages"
          >
            <MessageCircleIcon className="h-5 w-5" />
          </button>
          <button
            className="btn btn-ghost btn-circle tooltip tooltip-right"
            data-tip="Notifications"
            onClick={() => navigate("/notifications")}
          >
            <BellIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Friends List - Enhanced Design */}
      <div
        className={`${
          isMobile
            ? `fixed inset-0 z-50 bg-base-100 transform transition-all duration-300 ease-in-out ${
                showFriendsList || !targetUserId
                  ? "translate-x-0"
                  : "-translate-x-full"
              }`
            : "w-80 flex-shrink-0"
        } bg-base-200/90 backdrop-blur-md border-r border-base-300/50 flex flex-col h-screen md:relative shadow-lg`}
      >
        {/* Enhanced Header */}
        <div className="p-4 border-b border-base-300/50 bg-gradient-to-r from-base-200/80 to-base-300/40 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-primary rounded-full"></div>
            </div>
            {isMobile && targetUserId && (
              <button
                className="btn btn-ghost btn-circle btn-sm hover:bg-base-300/50 transition-all"
                onClick={() => {
                  setShowFriendsList(false);
                  navigate(-1);
                }}
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex gap-2 mb-3 mt-1">
            <div className=" h-8 bg-primary rounded-full">
              <button
                className="btn btn-ghost btn-circle btn-sm hover:bg-base-300/50 transition-all"
                onClick={() => {
                  navigate("/");
                }}
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Messages
            </h2>
          </div>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 size-4" />

            <input
              type="text"
              placeholder="Search friends..."
              className="input input-bordered w-full pl-10 input-sm bg-base-100/50 backdrop-blur-sm border-base-300/50 focus:border-primary/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Enhanced Friends List */}
        <div className="flex-1 overflow-y-auto messages-scrollbar min-h-0">
          {loadingFriends ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <p className="text-base-content/60">Loading friends...</p>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="p-6 text-center text-base-content/70">
              <MessageCircleIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "No friends found" : "No friends available"}
              </h3>
              <p className="text-sm opacity-60">
                {searchTerm
                  ? "Try a different search term"
                  : "Add some friends to start chatting"}
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {filteredFriends.map((friend) => (
                <div
                  key={friend._id}
                  className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden ${
                    targetUserId === friend._id
                      ? "bg-gradient-to-r from-primary/15 to-primary/5 ring-2 ring-primary/30 shadow-lg"
                      : "hover:bg-base-300/60 hover:shadow-md active:scale-98"
                  }`}
                  onClick={() => {
                    handleFriendClick(friend._id);
                    if (isMobile) setShowFriendsList(false);
                  }}
                >
                  {/* Active indicator */}
                  {targetUserId === friend._id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>
                  )}

                  <div className="avatar">
                    <div
                      className={`w-14 rounded-full ring-2 transition-all duration-300 ${
                        targetUserId === friend._id
                          ? "ring-primary/50"
                          : "ring-base-300/50 group-hover:ring-primary/30"
                      }`}
                    >
                      <img src={friend.profilePic} alt={friend.fullName} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-base-content text-base">
                      {friend.fullName}
                    </p>
                    <p className="text-sm text-base-content/60 truncate flex items-center gap-1">
                      {friend.isOnline ? (
                        <>
                          <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
                          <span className="text-success">Online</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-base-content/30 rounded-full"></span>
                          <span className="text-base-content/50">Offline</span>
                        </>
                      )}
                      <span className="text-base-content/40">•</span>
                      <span>
                        {friend.nativeLanguage} → {friend.learningLanguage}
                      </span>
                    </p>
                  </div>

                  {/* New message indicator */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-xs text-base-content/40">2m</div>
                    {Math.random() > 0.7 && (
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Chat Area */}
      <div
        className={`flex-1 flex flex-col h-screen min-w-0 ${
          isMobile && showFriendsList && targetUserId ? "hidden" : ""
        }`}
      >
        {!targetUserId ? (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-base-100 to-base-200/30 p-8">
            <div className="text-center max-w-lg">
              <div className="mb-8">
                <MessageCircleIcon className="size-24 text-primary/30 mx-auto mb-6" />
                <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Welcome to Chattr
                </h3>
                <p className="text-base-content/70 mb-8 text-lg leading-relaxed">
                  Select a friend from your list to start a conversation and
                  practice languages together
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  className="btn btn-primary btn-lg gap-2 md:hidden"
                  onClick={() => setShowFriendsList(true)}
                >
                  <MessageCircleIcon className="h-5 w-5" />
                  Browse Friends
                </button>
                <button
                  className="btn btn-outline btn-lg gap-2"
                  onClick={() => navigate("/friends")}
                >
                  <UsersIcon className="h-5 w-5" />
                  Find New Friends
                </button>
              </div>
            </div>
          </div>
        ) : loading || !chatClient || !channel ? (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-base-100 to-base-200/30">
            <ChatLoader />
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full">
            {/* Fixed Chat Header - Instagram Style */}
            <div className="sticky top-0 z-40 bg-gradient-to-r from-base-200/95 to-base-300/95 backdrop-blur-md border-b border-base-300/50 shadow-sm">
              <div className="flex items-center justify-between p-3 md:p-4">
                <div className="flex items-center gap-3">
                  {/* Enhanced Back button for all devices */}
                  <button
                    className="btn btn-ghost btn-circle btn-sm hover:bg-base-300/50 transition-all border border-base-300/30 bg-base-100/30"
                    onClick={() => {
                      navigate("/messenger");
                      setShowFriendsList(true);
                    }}
                    title="Back to messages"
                  >
                    <ArrowLeftIcon className="h-5 w-5 text-base-content" />
                  </button>

                  <div className="avatar">
                    <div className="w-10 md:w-12 rounded-full ring-2 ring-primary/30 shadow-sm">
                      <img
                        src={selectedFriend?.profilePic}
                        alt={selectedFriend?.fullName}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-base md:text-lg">
                      {selectedFriend?.fullName}
                    </h3>
                    <p className="text-xs md:text-sm flex items-center gap-1">
                      {selectedFriend?.isOnline ? (
                        <>
                          <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
                          <span className="text-success">Active now</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-base-content/30 rounded-full"></span>
                          <span className="text-base-content/50">
                            Last seen recently
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    className="btn btn-ghost btn-circle btn-sm hover:bg-base-300/50 transition-all tooltip"
                    data-tip="Voice Call"
                  >
                    <PhoneIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="btn btn-ghost btn-circle btn-sm hover:bg-base-300/50 transition-all tooltip"
                    data-tip="Video Call"
                    onClick={handleVideoCall}
                  >
                    <VideoIcon className="h-4 w-4" />
                  </button>
                  <div className="dropdown dropdown-end">
                    <div
                      tabIndex={0}
                      role="button"
                      className="btn btn-ghost btn-circle btn-sm hover:bg-base-300/50 transition-all"
                    >
                      <MoreVerticalIcon className="h-4 w-4" />
                    </div>
                    <ul
                      tabIndex={0}
                      className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52"
                    >
                      <li>
                        <a onClick={() => navigate(`/friends`)}>View Profile</a>
                      </li>
                      <li>
                        <a>Clear Chat</a>
                      </li>
                      <li>
                        <a className="text-error">Block User</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Messages Area - Instagram Style */}
            <div
              className="flex-1 bg-gradient-to-b from-base-100 via-base-200/10 to-base-200/30 overflow-hidden"
              style={{ width: "100%" }}
            >
              <Chat client={chatClient}>
                <Channel channel={channel}>
                  <div
                    className="h-full flex flex-col"
                    style={{ width: "100%", maxWidth: "100%" }}
                  >
                    <div
                      className="flex-1 overflow-y-auto min-h-0"
                      style={{ width: "100%" }}
                    >
                      <MessageList />
                    </div>
                    <div
                      className="flex-shrink-0 bg-base-100/95 backdrop-blur-md border-t border-base-300/50 p-2"
                      style={{ width: "100%" }}
                    >
                      <MessageInput focus />
                    </div>
                  </div>
                </Channel>
              </Chat>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessengerPage;
