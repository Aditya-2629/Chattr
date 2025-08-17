import React, { useState } from 'react';
import { 
  Search, 
  MessageCircle, 
  Users, 
  Archive, 
  Settings, 
  MoreVertical,
  Plus,
  Edit3,
  Filter,
  Pin,
  Volume2,
  VolumeX,
  Check,
  CheckCheck
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { cn, formatTime, getInitials, generateGradientFromName, truncateText } from '../../lib/utils';

const WhatsAppSidebar = ({ 
  chats = [], 
  currentChatId, 
  onChatSelect, 
  onNewChat,
  currentUser,
  className = ""
}) => {
  const { theme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, groups, archived
  const [showMenu, setShowMenu] = useState(false);

  // Mock data if no chats provided
  const mockChats = [
    {
      id: 1,
      title: "Project Team",
      isGroup: true,
      participants: 5,
      lastMessage: {
        text: "Let's schedule the meeting for tomorrow",
        sender: { name: "John Doe", id: "1" },
        timestamp: new Date(Date.now() - 300000).toISOString(),
        isMe: false
      },
      unreadCount: 3,
      isPinned: true,
      isMuted: false,
      isOnline: true,
      avatar: null
    },
    {
      id: 2,
      title: "Sarah Wilson",
      isGroup: false,
      participants: 1,
      lastMessage: {
        text: "Thanks for the presentation slides! 👍",
        sender: { name: "Sarah Wilson", id: "2" },
        timestamp: new Date(Date.now() - 600000).toISOString(),
        isMe: false
      },
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      isOnline: true,
      avatar: null
    },
    {
      id: 3,
      title: "Dev Team",
      isGroup: true,
      participants: 12,
      lastMessage: {
        text: "You: Pushed the latest changes to main branch",
        sender: { name: currentUser?.name || "You", id: currentUser?.id || "me" },
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        isMe: true
      },
      unreadCount: 0,
      isPinned: false,
      isMuted: true,
      isOnline: false,
      avatar: null
    },
    {
      id: 4,
      title: "Mike Johnson",
      isGroup: false,
      participants: 1,
      lastMessage: {
        text: "Can we discuss the new requirements?",
        sender: { name: "Mike Johnson", id: "4" },
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isMe: false
      },
      unreadCount: 1,
      isPinned: false,
      isMuted: false,
      isOnline: false,
      avatar: null
    },
    {
      id: 5,
      title: "Design Team",
      isGroup: true,
      participants: 7,
      lastMessage: {
        text: "New mockups are ready for review",
        sender: { name: "Emma Davis", id: "5" },
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        isMe: false
      },
      unreadCount: 8,
      isPinned: true,
      isMuted: false,
      isOnline: true,
      avatar: null
    }
  ];

  const chatList = chats.length > 0 ? chats : mockChats;

  const filteredChats = chatList.filter(chat => {
    // Search filter
    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase();
      const matchesTitle = chat.title.toLowerCase().includes(searchTerm);
      const matchesMessage = chat.lastMessage?.text.toLowerCase().includes(searchTerm);
      if (!matchesTitle && !matchesMessage) return false;
    }

    // Type filter
    switch (filter) {
      case 'unread':
        return chat.unreadCount > 0;
      case 'groups':
        return chat.isGroup;
      case 'archived':
        return chat.isArchived;
      default:
        return !chat.isArchived;
    }
  }).sort((a, b) => {
    // Pinned chats first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Then by last message timestamp
    const aTime = new Date(a.lastMessage?.timestamp || 0);
    const bTime = new Date(b.lastMessage?.timestamp || 0);
    return bTime - aTime;
  });

  const getLastMessagePreview = (chat) => {
    if (!chat.lastMessage) return "No messages yet";
    
    const { text, sender, isMe } = chat.lastMessage;
    const senderName = isMe ? "You" : (chat.isGroup ? sender.name : "");
    const prefix = senderName ? `${senderName}: ` : "";
    
    return truncateText(`${prefix}${text}`, 35);
  };

  const renderMessageStatus = (chat) => {
    if (!chat.lastMessage?.isMe) return null;
    
    return (
      <div className="flex items-center text-base-content/60">
        {chat.lastMessage.isRead ? (
          <CheckCheck className="w-4 h-4 text-blue-500" />
        ) : (
          <Check className="w-4 h-4" />
        )}
      </div>
    );
  };

  const renderChatItem = (chat) => (
    <div
      key={chat.id}
      onClick={() => onChatSelect?.(chat)}
      className={cn(
        "flex items-center gap-3 p-3 hover:bg-base-200/50 cursor-pointer transition-colors border-r-4 border-transparent",
        {
          "bg-base-200 border-primary": currentChatId === chat.id,
          "bg-base-100": currentChatId !== chat.id
        }
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {chat.avatar ? (
          <img 
            src={chat.avatar} 
            alt={chat.title}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg bg-gradient-to-br",
            generateGradientFromName(chat.title)
          )}>
            {chat.isGroup ? (
              <Users className="w-6 h-6" />
            ) : (
              getInitials(chat.title)
            )}
          </div>
        )}
        
        {/* Online indicator for individual chats */}
        {!chat.isGroup && chat.isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-base-100"></div>
        )}
        
        {/* Muted indicator */}
        {chat.isMuted && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-base-content/80 rounded-full flex items-center justify-center">
            <VolumeX className="w-3 h-3 text-base-100" />
          </div>
        )}
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0">
            {/* Pinned indicator */}
            {chat.isPinned && (
              <Pin className="w-3 h-3 text-primary flex-shrink-0" />
            )}
            
            <h3 className={cn("font-semibold text-sm truncate", {
              "text-base-content": chat.unreadCount === 0,
              "text-base-content font-bold": chat.unreadCount > 0
            })}>
              {chat.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {renderMessageStatus(chat)}
            <span className={cn("text-xs", {
              "text-base-content/50": chat.unreadCount === 0,
              "text-primary font-semibold": chat.unreadCount > 0
            })}>
              {formatTime(chat.lastMessage?.timestamp)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className={cn("text-sm truncate flex-1", {
            "text-base-content/60": chat.unreadCount === 0,
            "text-base-content": chat.unreadCount > 0
          })}>
            {getLastMessagePreview(chat)}
          </p>

          {/* Unread count */}
          {chat.unreadCount > 0 && (
            <div className="bg-primary text-primary-content rounded-full px-2 py-1 text-xs font-semibold min-w-[20px] text-center ml-2 flex-shrink-0">
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </div>
          )}
        </div>

        {/* Group participants count */}
        {chat.isGroup && (
          <div className="flex items-center gap-1 mt-1">
            <Users className="w-3 h-3 text-base-content/40" />
            <span className="text-xs text-base-content/40">
              {chat.participants} participant{chat.participants !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn("flex flex-col h-full bg-base-100 border-r border-base-300/50", className)} data-theme={theme}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-base-300/50 bg-base-100">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Chats</h1>
          <div className="badge badge-primary badge-sm">
            {filteredChats.reduce((acc, chat) => acc + chat.unreadCount, 0)}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onNewChat}
            className="btn btn-ghost btn-sm btn-circle"
            title="New chat"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          
          <div className="dropdown dropdown-end">
            <button 
              tabIndex={0} 
              className="btn btn-ghost btn-sm btn-circle"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <ul className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-48 border border-base-300 z-50">
              <li><a><Users className="w-4 h-4" />New Group</a></li>
              <li><a><Archive className="w-4 h-4" />Archived</a></li>
              <li><a><Settings className="w-4 h-4" />Settings</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-base-300/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-sm w-full pl-10 pr-4 bg-base-200/50 border-0 focus:bg-base-100"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center p-2 border-b border-base-300/50 bg-base-50">
        <div className="tabs tabs-boxed tabs-xs bg-base-200/50 p-1">
          <button
            onClick={() => setFilter('all')}
            className={cn("tab tab-xs", {
              "tab-active": filter === 'all'
            })}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn("tab tab-xs", {
              "tab-active": filter === 'unread'
            })}
          >
            Unread
            {filteredChats.filter(c => c.unreadCount > 0).length > 0 && (
              <span className="ml-1 text-xs">
                ({filteredChats.filter(c => c.unreadCount > 0).length})
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('groups')}
            className={cn("tab tab-xs", {
              "tab-active": filter === 'groups'
            })}
          >
            Groups
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length > 0 ? (
          <div className="space-y-0">
            {filteredChats.map(renderChatItem)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-base-content/40" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No chats found</h3>
            <p className="text-base-content/60 mb-4">
              {searchQuery 
                ? `No chats match "${searchQuery}"`
                : "Start a new conversation to get chatting!"
              }
            </p>
            {!searchQuery && (
              <button
                onClick={onNewChat}
                className="btn btn-primary btn-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </button>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="p-3 border-t border-base-300/50 bg-base-200/30">
        <div className="flex items-center justify-between text-xs text-base-content/60">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Connected</span>
          </div>
          <div>
            {filteredChats.length} chat{filteredChats.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSidebar;
