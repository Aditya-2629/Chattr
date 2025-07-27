import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import {
  Channel,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  useChannelStateContext,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { VideoIcon } from "lucide-react";

import ChatLoader from "../components/ChatLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// ✅ FIXED HEADER
const CustomHeader = ({ onVideoCall }) => {
  const { channel } = useChannelStateContext();
  const members = Object.values(channel.state.members || {});
  const otherUser = members.find(
    (m) => m.user.id !== channel.client.userID
  )?.user;

  return (
    <div className="flex items-center justify-between p-3 border-b bg-white dark:bg-gray-800">
      <div className="flex items-center gap-3">
        <img
          src={otherUser?.image}
          alt="profile"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {otherUser?.name}
          </p>
          <p className="text-xs text-gray-500">Online</p>
        </div>
      </div>
      <button
        onClick={onVideoCall}
        className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        <VideoIcon className="h-4 w-4" />
        <span className="ml-1 hidden sm:inline">Video</span>
      </button>
    </div>
  );
};

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

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

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-screen w-full bg-gray-100 dark:bg-gray-900">
      <Chat client={chatClient} theme="messaging light">
        <Channel channel={channel}>
          <div className="flex flex-col h-screen max-w-2xl mx-auto shadow-md bg-white dark:bg-gray-800">
            {/* ✅ FIXED HEADER */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b">
              <CustomHeader onVideoCall={handleVideoCall} />
            </div>

            {/* ✅ ONLY CHAT SCROLLS */}
            <div className="flex-1 overflow-y-auto">
              <MessageList />
            </div>

            <div className="border-t">
              <MessageInput focus />
            </div>

            <Thread />
          </div>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
