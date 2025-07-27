import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  Window,
} from "stream-chat-react";
import {
  ArrowLeft,
  Users,
  Settings,
  UserPlus,
  Phone,
  Video,
} from "lucide-react";
import { axiosInstance } from "../lib/axios";
import useAuthUser from "../hooks/useAuthUser";
import { toast } from "react-hot-toast";
// import "";

const GroupChatPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();

  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    if (authUser && groupId) {
      initializeChat();
    }
  }, [authUser, groupId]);

  const initializeChat = async () => {
    try {
      setLoading(true);

      // Get group details
      const groupResponse = await axiosInstance.get(`/groups/${groupId}`);
      const groupData = groupResponse.data.group;
      setGroup(groupData);

      // Get Stream token
      const tokenResponse = await axiosInstance.get("/chat/token");
      const { token } = tokenResponse.data;

      // Initialize Stream Chat client
      const chatClient = StreamChat.getInstance(
        import.meta.env.VITE_STREAM_API_KEY
      );

      // Connect user
      await chatClient.connectUser(
        {
          id: authUser.id,
          name: authUser.fullName,
          image: authUser.profilePic,
        },
        token
      );

      // Get channel
      const chatChannel = chatClient.channel(
        "messaging",
        groupData.streamChannelId
      );
      await chatChannel.watch();

      setClient(chatClient);
      setChannel(chatChannel);
    } catch (error) {
      console.error("Error initializing chat:", error);
      toast.error("Failed to load group chat");
      navigate("/groups");
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate("/groups");
  };

  const handleMembersClick = () => {
    setShowMembers(!showMembers);
  };

  const handleSettingsClick = () => {
    navigate(`/groups/${groupId}/settings`);
  };

  const handleAddMembersClick = () => {
    navigate(`/groups/${groupId}/add-members`);
  };

  const handleStartCall = (isVideo = false) => {
    // Navigate to call page with group members
    const callType = isVideo ? "video" : "audio";
    navigate(`/call/${groupId}?type=${callType}&group=true`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!client || !channel || !group) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-600 mb-4">Failed to load group chat</p>
        <button
          onClick={handleBackClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isAdmin = group.admin._id === authUser.id;

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Custom Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBackClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center space-x-3">
            {group.groupPic ? (
              <img
                src={group.groupPic}
                alt={group.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="text-blue-600" size={20} />
              </div>
            )}
            <div>
              <h1 className="font-semibold text-gray-900">{group.name}</h1>
              <p className="text-sm text-gray-500">
                {group.members.length} members
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleStartCall(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Start voice call"
          >
            <Phone size={20} />
          </button>

          <button
            onClick={() => handleStartCall(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Start video call"
          >
            <Video size={20} />
          </button>

          <button
            onClick={handleMembersClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="View members"
          >
            <Users size={20} />
          </button>

          {isAdmin && (
            <button
              onClick={handleAddMembersClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Add members"
            >
              <UserPlus size={20} />
            </button>
          )}

          <button
            onClick={handleSettingsClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Group settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex">
        <div className={`flex-1 ${showMembers ? "mr-80" : ""}`}>
          <Chat client={client} theme="str-chat__theme-light">
            <Channel channel={channel}>
              <Window>
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
          </Chat>
        </div>

        {/* Members Sidebar */}
        {showMembers && (
          <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Members</h3>
              <button
                onClick={() => setShowMembers(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-2">
              {group.members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg"
                >
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {member.user.profilePic ? (
                      <img
                        src={member.user.profilePic}
                        alt={member.user.fullName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-700">
                        {member.user.fullName?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {member.user.fullName}
                      {member.user._id === authUser.id && " (You)"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {member.role === "admin" ? "Admin" : "Member"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupChatPage;
