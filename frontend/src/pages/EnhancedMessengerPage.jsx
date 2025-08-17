import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getUserFriends, getStreamToken } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import { axiosInstance } from "../lib/axios";
import {
  Channel,
  Chat,
  MessageInput,
  MessageList,
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
  PlusIcon,
  Users,
  Crown,
  Lock,
  Settings,
  LogOut,
} from "lucide-react";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import CreateGroupModal from "../components/CreateGroupModal";
import GroupInfoModal from "../components/GroupInfoModal";
import { useThemeStore } from "../store/useThemeStore";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const EnhancedMessengerPage = () => {
  const { id: targetId } = useParams(); // Can be friend ID or group ID
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, friends, groups
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const { authUser } = useAuthUser();

  // Fetch friends
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  // Fetch groups
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const response = await axiosInstance.get('/groups');
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to fetch groups');
    } finally {
      setLoadingGroups(false);
    }
  };

  // Fetch stream token
  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [showChatList, setShowChatList] = useState(!targetId);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Filter conversations
  const filteredFriends = friends.filter((friend) =>
    friend.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Combined conversations for "all" tab
  const allConversations = [
    ...filteredFriends.map(friend => ({
      ...friend,
      type: 'friend',
      displayName: friend.fullName,
      lastMessage: 'Click to start chatting',
      isOnline: friend.isOnline || Math.random() > 0.5,
      unreadCount: Math.random() > 0.8 ? Math.floor(Math.random() * 5) + 1 : 0,
    })),
    ...filteredGroups.map(group => ({
      ...group,
      type: 'group',
      displayName: group.name,
      lastMessage: group.lastActivity ? 'Recent activity' : 'No messages yet',
      isOnline: true,
      unreadCount: Math.random() > 0.7 ? Math.floor(Math.random() * 10) + 1 : 0,
    }))
  ].sort((a, b) => new Date(b.updatedAt || b.lastActivity || 0) - new Date(a.updatedAt || a.lastActivity || 0));

  // Initialize chat
  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser || !targetId) return;

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

        // Determine if it's a group or friend chat
        const actualGroupId = targetId?.startsWith('group-') ? targetId.replace('group-', '') : null;
        const isGroup = actualGroupId ? groups.find(g => g._id === actualGroupId) : null;
        let channelId, currChannel;

        if (isGroup) {
          // Group chat
          channelId = `group-${actualGroupId}`;
          currChannel = client.channel("messaging", channelId, {
            name: isGroup.name,
            members: isGroup.members.map(m => m.user._id),
            image: isGroup.groupPic,
          });
        } else {
          // Friend chat
          channelId = [authUser._id, targetId].sort().join("-");
          currChannel = client.channel("messaging", channelId, {
            members: [authUser._id, targetId],
          });
        }

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
  }, [tokenData, authUser, targetId, groups]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      channel.sendMessage({
        text: `📹 I've started a video call. Join me here: ${callUrl}`,
      });
      toast.success("Video call link sent successfully!");
    }
  };

  const handleConversationClick = (conversation) => {
    if (conversation.type === 'group') {
      navigate(`/messenger/group-${conversation._id}`);
    } else {
      navigate(`/messenger/${conversation._id}`);
    }
    if (isMobile) setShowChatList(false);
  };

  const handleGroupCreated = (newGroup) => {
    setGroups(prev => [newGroup, ...prev]);
    setShowCreateGroupModal(false);
    toast.success('✅ Group created successfully!');
  };

  const handleGroupUpdated = (updatedGroup) => {
    setGroups(prev => prev.map(g => g._id === updatedGroup._id ? updatedGroup : g));
  };

  const handleGroupDeleted = (deletedGroupId) => {
    setGroups(prev => prev.filter(g => g._id !== deletedGroupId));
    if (actualGroupId === deletedGroupId) {
      navigate('/messenger');
    }
  };

  const actualGroupId = targetId?.startsWith('group-') ? targetId.replace('group-', '') : null;
  const selectedConversation = actualGroupId
    ? groups.find(g => g._id === actualGroupId)
    : friends.find(f => f._id === targetId);

  const isGroupChat = targetId?.startsWith('group-');

  const getConversationsToShow = () => {
    switch (activeTab) {
      case 'friends':
        return filteredFriends.map(friend => ({
          ...friend,
          type: 'friend',
          displayName: friend.fullName,
          lastMessage: 'Click to start chatting',
          isOnline: friend.isOnline || Math.random() > 0.5,
          unreadCount: Math.random() > 0.8 ? Math.floor(Math.random() * 5) + 1 : 0,
        }));
      case 'groups':
        return filteredGroups.map(group => ({
          ...group,
          type: 'group',
          displayName: group.name,
          lastMessage: group.lastActivity ? 'Recent activity' : 'No messages yet',
          isOnline: true,
          unreadCount: Math.random() > 0.7 ? Math.floor(Math.random() * 10) + 1 : 0,
        }));
      default:
        return allConversations;
    }
  };

  return (
    <div className="flex h-screen bg-base-100" data-theme={theme}>
      {/* Quick Navigation Bar - Desktop Only */}
      {!isMobile && (
        <div className="hidden lg:flex w-16 bg-base-200/80 backdrop-blur-md border-r border-base-300 flex-col items-center py-4 space-y-4 flex-shrink-0">
          <button
            className="btn btn-ghost btn-circle tooltip tooltip-right hover:bg-base-300/50 transition-all"
            data-tip="Home"
            onClick={() => navigate("/")}
          >
            <HomeIcon className="h-5 w-5" />
          </button>
          <button
            className="btn btn-ghost btn-circle tooltip tooltip-right hover:bg-base-300/50 transition-all"
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
            className="btn btn-ghost btn-circle tooltip tooltip-right hover:bg-base-300/50 transition-all"
            data-tip="Notifications"
            onClick={() => navigate("/notifications")}
          >
            <BellIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Conversations List */}
      <div
        className={`${
          isMobile
            ? `fixed inset-0 z-50 bg-base-100 transform transition-all duration-300 ease-in-out ${
                showChatList || !targetId
                  ? "translate-x-0"
                  : "-translate-x-full"
              }`
            : "w-80 flex-shrink-0"
        } bg-base-200/90 backdrop-blur-md border-r border-base-300/50 flex flex-col h-screen md:relative shadow-lg`}
      >
        {/* Header */}
        <div className="p-4 border-b border-base-300/50 bg-gradient-to-r from-base-200/80 to-base-300/40 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                className="btn btn-ghost btn-circle btn-sm hover:bg-base-300/50 transition-all"
                onClick={() => navigate("/")}
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Messages
              </h2>
            </div>
            <button
              className="btn btn-primary btn-circle btn-sm hover:btn-primary-focus transition-all"
              onClick={() => setShowCreateGroupModal(true)}
              title="Create Group"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 size-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="input input-bordered w-full pl-10 input-sm bg-base-100/50 backdrop-blur-sm border-base-300/50 focus:border-primary/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-base-300/30 rounded-lg p-1">
            {[
              { key: 'all', label: 'All', icon: MessageCircleIcon },
              { key: 'friends', label: 'Friends', icon: UsersIcon },
              { key: 'groups', label: 'Groups', icon: Users },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1 ${
                  activeTab === key
                    ? 'bg-primary text-primary-content shadow-sm'
                    : 'text-base-content/70 hover:bg-base-300/50 hover:text-base-content'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {(loadingFriends || loadingGroups) ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="loading loading-spinner loading-lg text-primary"></div>
              <p className="text-base-content/60">Loading conversations...</p>
            </div>
          ) : (
            <div className="p-3 space-y-1">
              {getConversationsToShow().map((conversation) => (
                <div
                  key={`${conversation.type}-${conversation._id}`}
                  className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden ${
                    (conversation.type === 'group' ? `group-${conversation._id}` : conversation._id) === targetId
                      ? "bg-gradient-to-r from-primary/15 to-primary/5 ring-2 ring-primary/30 shadow-lg"
                      : "hover:bg-base-300/60 hover:shadow-md active:scale-98"
                  }`}
                  onClick={() => handleConversationClick(conversation)}
                >
                  {/* Active indicator */}
                  {(conversation.type === 'group' ? `group-${conversation._id}` : conversation._id) === targetId && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>
                  )}

                  {/* Avatar */}
                  <div className="avatar">
                    <div
                      className={`w-14 rounded-full ring-2 transition-all duration-300 relative ${
                        (conversation.type === 'group' ? `group-${conversation._id}` : conversation._id) === targetId
                          ? "ring-primary/50"
                          : "ring-base-300/50 group-hover:ring-primary/30"
                      }`}
                    >
                      <img 
                        src={conversation.profilePic || conversation.groupPic || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.displayName)}&background=random`} 
                        alt={conversation.displayName}
                        className="rounded-full"
                      />
                      {conversation.type === 'group' && (
                        <div className="absolute -bottom-1 -right-1 bg-base-100 rounded-full p-1">
                          <Users className="h-3 w-3 text-primary" />
                        </div>
                      )}
                      {conversation.type === 'friend' && conversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-base-100"></div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate text-base-content text-base">
                        {conversation.displayName}
                      </p>
                      {conversation.type === 'group' && (
                        <div className="flex items-center gap-1">
                          {conversation.settings?.isPrivate && (
                            <Lock className="h-3 w-3 text-base-content/50" />
                          )}
                          {conversation.admin._id === authUser._id && (
                            <Crown className="h-3 w-3 text-warning" />
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-base-content/60 truncate flex items-center gap-1">
                      {conversation.type === 'group' ? (
                        <span>{conversation.members?.length || 0} members</span>
                      ) : (
                        <>
                          {conversation.isOnline ? (
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
                            {conversation.nativeLanguage} → {conversation.learningLanguage}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Right side info */}
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-xs text-base-content/40">2m</div>
                      {conversation.unreadCount > 0 && (
                        <div className="bg-primary text-primary-content text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-2">
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </div>
                      )}
                    </div>
                    
                    {/* Quick actions for groups */}
                    {conversation.type === 'group' && (
                      <div className="dropdown dropdown-end">
                        <div 
                          tabIndex={0} 
                          role="button" 
                          className="btn btn-ghost btn-circle btn-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVerticalIcon className="h-3 w-3" />
                        </div>
                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-48 z-10">
                          <li>
                            <a onClick={(e) => {
                              e.stopPropagation();
                              // Navigate to group first, then show modal
                              navigate(`/messenger/group-${conversation._id}`);
                              setTimeout(() => setShowGroupInfoModal(true), 100);
                            }}>
                              <Users className="h-3 w-3" />
                              Group Info
                            </a>
                          </li>
                          {conversation.admin._id === authUser._id && (
                            <li>
                              <a onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/messenger/group-${conversation._id}`);
                                setTimeout(() => setShowGroupInfoModal(true), 100);
                              }}>
                                <Settings className="h-3 w-3" />
                                Manage Group
                              </a>
                            </li>
                          )}
                          <li>
                            <a className="text-warning" onClick={(e) => {
                              e.stopPropagation();
                              // Handle leave group
                            }}>
                              <LogOut className="h-3 w-3" />
                              Leave Group
                            </a>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {getConversationsToShow().length === 0 && (
                <div className="text-center py-12">
                  <MessageCircleIcon className="h-16 w-16 mx-auto mb-4 text-base-content/30" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm ? "No conversations found" : `No ${activeTab === 'all' ? 'conversations' : activeTab} yet`}
                  </h3>
                  <p className="text-base-content/60 text-sm">
                    {searchTerm 
                      ? "Try a different search term"
                      : activeTab === 'groups' 
                        ? "Create your first group to get started"
                        : "Add some friends to start chatting"
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col h-screen min-w-0 ${
          isMobile && showChatList && targetId ? "hidden" : ""
        }`}
      >
        {!targetId ? (
          // Welcome Screen
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-base-100 to-base-200/30 p-8">
            <div className="text-center max-w-lg">
              <div className="mb-8">
                <MessageCircleIcon className="size-24 text-primary/30 mx-auto mb-6" />
                <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Welcome to Chattr
                </h3>
                <p className="text-base-content/70 mb-8 text-lg leading-relaxed">
                  Select a conversation to start chatting, or create a new group to connect with multiple friends
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  className="btn btn-primary btn-lg gap-2 md:hidden"
                  onClick={() => setShowChatList(true)}
                >
                  <MessageCircleIcon className="h-5 w-5" />
                  Browse Conversations
                </button>
                <button
                  className="btn btn-outline btn-lg gap-2"
                  onClick={() => navigate("/friends")}
                >
                  <UsersIcon className="h-5 w-5" />
                  Find New Friends
                </button>
                <button
                  className="btn btn-secondary btn-lg gap-2"
                  onClick={() => setShowCreateGroupModal(true)}
                >
                  <Users className="h-5 w-5" />
                  Create Group
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
            {/* Chat Header */}
            <div className="sticky top-0 z-40 bg-gradient-to-r from-base-200/95 to-base-300/95 backdrop-blur-md border-b border-base-300/50 shadow-sm">
              <div className="flex items-center justify-between p-3 md:p-4">
                <div className="flex items-center gap-3">
                  {/* Back button */}
                  <button
                    className="btn btn-ghost btn-circle btn-sm hover:bg-base-300/50 transition-all border border-base-300/30 bg-base-100/30"
                    onClick={() => {
                      navigate("/messenger");
                      setShowChatList(true);
                    }}
                    title="Back to messages"
                  >
                    <ArrowLeftIcon className="h-5 w-5 text-base-content" />
                  </button>

                  <div className="avatar">
                    <div className="w-10 md:w-12 rounded-full ring-2 ring-primary/30 shadow-sm">
                      <img
                        src={
                          isGroupChat 
                            ? selectedConversation?.groupPic || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation?.name || 'Group')}&background=random`
                            : selectedConversation?.profilePic
                        }
                        alt={
                          isGroupChat 
                            ? selectedConversation?.name
                            : selectedConversation?.fullName
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
                      {isGroupChat 
                        ? selectedConversation?.name
                        : selectedConversation?.fullName
                      }
                      {isGroupChat && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-primary" />
                          {selectedConversation?.settings?.isPrivate && (
                            <Lock className="h-3 w-3 text-base-content/50" />
                          )}
                        </div>
                      )}
                    </h3>
                    <p className="text-xs md:text-sm flex items-center gap-1">
                      {isGroupChat ? (
                        <span className="text-base-content/60">
                          {selectedConversation?.members?.length || 0} members
                        </span>
                      ) : selectedConversation?.isOnline ? (
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

                {/* Action Buttons */}
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
                      {isGroupChat ? (
                        <>
                          <li>
                            <a onClick={() => setShowGroupInfoModal(true)}>
                              <Users className="h-4 w-4" />
                              Group Info
                            </a>
                          </li>
                          <li>
                            <a>
                              <Settings className="h-4 w-4" />
                              Group Settings
                            </a>
                          </li>
                          <li>
                            <a>Clear Chat</a>
                          </li>
                        </>
                      ) : (
                        <>
                          <li>
                            <a onClick={() => navigate(`/friends`)}>View Profile</a>
                          </li>
                          <li>
                            <a>Clear Chat</a>
                          </li>
                        </>
                      )}
                      <li>
                        <a className="text-error">
                          {isGroupChat ? 'Leave Group' : 'Block User'}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
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

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <CreateGroupModal
          onClose={() => setShowCreateGroupModal(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}

      {/* Group Info Modal */}
      {showGroupInfoModal && selectedConversation && isGroupChat && (
        <GroupInfoModal
          group={selectedConversation}
          onClose={() => setShowGroupInfoModal(false)}
          onGroupUpdated={handleGroupUpdated}
          onGroupDeleted={handleGroupDeleted}
        />
      )}
    </div>
  );
};

export default EnhancedMessengerPage;
