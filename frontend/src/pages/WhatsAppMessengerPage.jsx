import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Sparkles } from 'lucide-react';
import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useThemeStore } from '../store/useThemeStore';
import { cn } from '../lib/utils';
import WhatsAppSidebar from '../components/chat/WhatsAppSidebar';
import WhatsAppChatLayout from '../components/chat/WhatsAppChatLayout';
import { getUserFriends, getStreamToken, getUserGroups } from '../lib/api';
import useAuthUser from '../hooks/useAuthUser';
import { StreamChat } from 'stream-chat';
import {
  Channel,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from 'stream-chat-react';
import toast from 'react-hot-toast';
import ChatLoader from '../components/ChatLoader';
import 'stream-chat-react/dist/css/v2/index.css';
import '../styles/stream-chat-custom.css';
import '../styles/whatsapp-dark-theme.css';
import '../styles/video-call-message.css';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const WhatsAppMessengerPage = () => {
  const { theme } = useThemeStore();
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  
  const [currentChatId, setCurrentChatId] = useState(targetUserId);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Get current user data
  const currentUser = {
    id: authUser?._id,
    name: authUser?.fullName,
    avatar: authUser?.profilePic,
    email: authUser?.email
  };

  // Fetch friends data
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ['friends'],
    queryFn: getUserFriends,
  });

  // Get Stream token
  const { data: tokenData } = useQuery({
    queryKey: ['streamToken'],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  // Get user groups
  const { data: groupsData = {}, isLoading: loadingGroups } = useQuery({
    queryKey: ['userGroups'],
    queryFn: getUserGroups,
    enabled: !!authUser,
  });

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setShowSidebar(!mobile || !currentChatId);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [currentChatId]);

  // Initialize Stream Chat when user and token are available
  useEffect(() => {
    const initStreamChat = async () => {
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
        
        setChatClient(client);
      } catch (error) {
        console.error('Error initializing Stream Chat:', error);
        toast.error('Could not connect to chat. Please try again.');
      }
    };

    initStreamChat();
  }, [tokenData, authUser]);

  // Setup chat when targetUserId changes
  useEffect(() => {
    const setupChat = async () => {
      if (!targetUserId) {
        setChannel(null);
        setSelectedChat(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        // Check if it's a group chat
        const groups = groupsData?.groups || [];
        const selectedGroup = groups.find(g => g._id === targetUserId);
        if (selectedGroup) {
          const groupChatData = {
            id: selectedGroup._id,
            title: selectedGroup.name,
            avatar: selectedGroup.avatar || null,
            isGroup: true,
            participants: selectedGroup.members ? selectedGroup.members.length : 0,
            isOnline: true
          };
          setSelectedChat(groupChatData);
          
          // Setup Stream Chat channel for group chats
          if (chatClient && authUser) {
            const channelId = `group-${selectedGroup._id}`;
            const memberIds = selectedGroup.members?.map(member => member._id || member) || [authUser._id];
            
            const currChannel = chatClient.channel('messaging', channelId, {
              name: selectedGroup.name,
              members: memberIds,
              created_by_id: authUser._id,
            });
            
            await currChannel.watch();
            setChannel(currChannel);
          }
          setLoading(false);
          return;
        }
        
        // Check if it's a friend chat
        const selectedFriend = friends.find(f => f._id === targetUserId);
        if (selectedFriend) {
          const chatData = {
            id: selectedFriend._id,
            title: selectedFriend.fullName,
            avatar: selectedFriend.profilePic,
            isGroup: false,
            isOnline: selectedFriend.isOnline,
            participants: 1
          };
          setSelectedChat(chatData);
          
          // Setup Stream Chat channel for individual chats
          if (chatClient && authUser) {
            const channelId = [authUser._id, targetUserId].sort().join('-');
            const currChannel = chatClient.channel('messaging', channelId, {
              members: [authUser._id, targetUserId],
            });
            
            await currChannel.watch();
            setChannel(currChannel);
          }
        }
      } catch (error) {
        console.error('Error setting up chat:', error);
        toast.error('Could not connect to chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    setupChat();
  }, [targetUserId, authUser, friends, chatClient, groupsData]);

  // Convert groups to WhatsApp chat format
  const groups = groupsData?.groups || [];
  const groupChats = groups.map(group => ({
    id: group._id,
    title: group.name,
    avatar: group.avatar || null,
    isGroup: true,
    participants: group.members ? group.members.length : 0,
    lastMessage: {
      text: 'Group conversation',
      sender: { name: 'Group', id: 'group' },
      timestamp: group.updatedAt || new Date().toISOString(),
      isMe: false
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isOnline: true
  }));

  // Convert friends to WhatsApp chat format
  const friendChats = friends.map(friend => ({
    id: friend._id,
    title: friend.fullName,
    avatar: friend.profilePic,
    isGroup: false,
    participants: 1,
    lastMessage: {
      text: 'Start a conversation...',
      sender: { name: friend.fullName, id: friend._id },
      timestamp: new Date().toISOString(),
      isMe: false
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isOnline: friend.isOnline || false
  }));

  // Combine groups and friends
  const chatsData = [...groupChats, ...friendChats];

  const handleChatSelect = (chat) => {
    // Navigate to the chat with the user ID
    navigate(`/messenger/${chat.id}`);
  };

  const handleBackToList = () => {
    setCurrentChatId(null);
    setSelectedChat(null);
    setShowSidebar(true);
    navigate('/messenger');
  };

  const handleSendMessage = (message) => {
    // Stream Chat handles sending via MessageInput component
    console.log('Message sent via Stream Chat:', message);
  };

  const handleNewChat = () => {
    // Navigate to friends page to start a new chat
    navigate('/friends');
  };

  const handleVideoCall = async () => {
    if (!channel || !selectedChat) {
      toast.error('Cannot start video call. Please try again.');
      return;
    }

    try {
      // Generate unique call ID
      const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const callUrl = `${window.location.origin}/call/${callId}`;
      
      // Create animated video call message
      const videoCallMessage = {
        text: '', // Empty text as we'll use custom attachment
        attachments: [{
          type: 'video_call',
          title: 'Video Call Started',
          title_link: callUrl,
          text: `${authUser?.fullName} started a video call`,
          color: '#00C851',
          fields: [
            {
              title: 'Status',
              value: 'Waiting for participants...',
              short: true
            },
            {
              title: 'Started by',
              value: authUser?.fullName || 'You',
              short: true
            }
          ],
          actions: [
            {
              name: 'join_call',
              text: '🎥 Join Video Call',
              type: 'button',
              value: callUrl,
              style: 'primary'
            }
          ],
          footer: 'Video Call',
          footer_icon: '🎥',
          ts: Date.now() / 1000
        }]
      };

      // Send the video call message
      await channel.sendMessage(videoCallMessage);
      
      // Show success toast
      toast.success('📹 Video call link sent!', {
        duration: 3000,
        icon: '🎥',
      });
      
      // Navigate to call page
      setTimeout(() => {
        window.open(callUrl, '_blank');
      }, 1000);
      
    } catch (error) {
      console.error('Error starting video call:', error);
      toast.error('Failed to start video call. Please try again.');
    }
  };

  const renderWelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-br from-base-100 to-base-200">
      <div className="max-w-md mx-auto">
        {/* Logo/Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-primary via-secondary to-accent rounded-full flex items-center justify-center mb-4 mx-auto shadow-2xl">
            <MessageSquare className="w-16 h-16 text-white" strokeWidth={1.5} />
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {/* Welcome Text */}
        <h1 className="text-3xl lg:text-4xl font-bold text-base-content mb-4">
          Welcome to <span className="text-primary">Strimify</span>
          <span className="text-secondary"> Messages</span>
        </h1>
        
        <p className="text-lg text-base-content/70 mb-8 leading-relaxed">
          Connect with your friends and practice languages together.
          Select a friend from the sidebar to start a conversation.
        </p>
        
        {/* Features */}
        <div className="grid gap-4 text-left">
          <div className="flex items-center gap-3 p-3 bg-base-100/50 backdrop-blur-sm rounded-xl">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Real-time Messaging</h3>
              <p className="text-xs text-base-content/60">Instant message delivery and read receipts</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-base-100/50 backdrop-blur-sm rounded-xl">
            <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Group Chats</h3>
              <p className="text-xs text-base-content/60">Collaborate with multiple team members</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-base-100/50 backdrop-blur-sm rounded-xl">
            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Theme Support</h3>
              <p className="text-xs text-base-content/60">Multiple beautiful themes to choose from</p>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="mt-8 p-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl border border-base-300/50">
          <p className="text-sm text-base-content/60 mb-3">
            {loadingFriends ? 'Loading your friends...' : 
             friends.length > 0 ? 'Select a friend from the sidebar to start chatting' : 
             'Add some friends to start conversations'}
          </p>
          <button 
            onClick={handleNewChat}
            className="btn btn-primary btn-sm"
          >
            <Users className="w-4 h-4 mr-2" />
            {friends.length > 0 ? 'Find More Friends' : 'Find Friends'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("h-screen flex overflow-hidden bg-base-100")} data-theme={theme}>
      {/* Sidebar - Chat List */}
      <div className={cn("w-full lg:w-80 xl:w-96 flex-shrink-0 transition-transform duration-300 ease-in-out", {
        "translate-x-0": showSidebar,
        "-translate-x-full lg:translate-x-0": !showSidebar
      })}>
        <WhatsAppSidebar
          chats={chatsData}
          currentChatId={currentChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          currentUser={currentUser}
          className="h-full"
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {targetUserId && selectedChat ? (
          loading || !chatClient || (!channel && !selectedChat.isGroup) ? (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-base-100 to-base-200/30">
              <ChatLoader />
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full">
              {/* WhatsApp Style Chat Header */}
              <div className="sticky top-0 z-40 bg-gradient-to-r from-base-200/95 to-base-300/95 backdrop-blur-md border-b border-base-300/50 shadow-sm">
                <div className="flex items-center justify-between p-3 md:p-4">
                  <div className="flex items-center gap-3">
                    <button
                      className="btn btn-ghost btn-circle btn-sm hover:bg-base-300/50 transition-all border border-base-300/30 bg-base-100/30 lg:hidden"
                      onClick={handleBackToList}
                      title="Back to messages"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                    
                    <div className="avatar">
                      <div className="w-10 md:w-12 rounded-full ring-2 ring-primary/30 shadow-sm">
                        {selectedChat.avatar ? (
                          <img src={selectedChat.avatar} alt={selectedChat.title} />
                        ) : selectedChat.isGroup ? (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                            <Users className="w-6 h-6" />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                            {selectedChat.title.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-base md:text-lg">
                        {selectedChat.title}
                      </h3>
                      <p className="text-xs md:text-sm flex items-center gap-1">
                        {selectedChat.isGroup ? (
                          <span className="text-base-content/60">{selectedChat.participants} participants</span>
                        ) : selectedChat.isOnline ? (
                          <>
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-green-600">Active now</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            <span className="text-gray-500">Last seen recently</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-1">
                    <button className="btn btn-ghost btn-sm btn-circle" title="Voice call">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    </button>
                    <button 
                      className="btn btn-ghost btn-sm btn-circle" 
                      title="Video call"
                      onClick={handleVideoCall}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </button>
                    <div className="dropdown dropdown-end">
                      <button tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                        </svg>
                      </button>
                      <ul className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-48 border border-base-300">
                        <li><a>Chat Info</a></li>
                        <li><a>Mute Notifications</a></li>
                        <li><a>Archive Chat</a></li>
                        <li><a className="text-error">Delete Chat</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stream Chat Messages with WhatsApp Styling */}
              <div className="flex-1 bg-gradient-to-b from-base-100 via-base-200/10 to-base-200/30 overflow-hidden whatsapp-chat-container">
                {/* Both individual and group chats use Stream Chat with WhatsApp styling */}
                <Chat client={chatClient}>
                  <Channel channel={channel}>
                    <Window>
                      <MessageList />
                      <MessageInput />
                    </Window>
                    <Thread />
                  </Channel>
                </Chat>
              </div>
            </div>
          )
        ) : (
          renderWelcomeScreen()
        )}
      </div>


      {/* Mobile Overlay */}
      {isMobile && currentChatId && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={handleBackToList}
        />
      )}

      {/* Responsive Styles */}
      <style jsx global>{`
        @media (max-width: 1023px) {
          .chat-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            z-index: 50;
            transform: translateX(${showSidebar ? '0' : '-100%'});
            transition: transform 0.3s ease-in-out;
          }
        }

        /* Custom scrollbar for better aesthetics */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--bc) / 0.2);
          border-radius: 2px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--bc) / 0.3);
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }

        /* Theme-specific enhancements */
        [data-theme="dark"] .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        [data-theme="light"] .glass-effect {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        /* WhatsApp-like message bubbles animation */
        .message-bubble {
          animation: messageAppear 0.3s ease-out;
        }

        @keyframes messageAppear {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Typing indicator animation */
        .typing-dot {
          animation: typing 1.5s ease-in-out infinite;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
};

export default WhatsAppMessengerPage;
