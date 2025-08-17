import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Info,
  Users,
  ArrowLeft,
  Paperclip,
  Smile,
  Mic,
  Send,
  Image,
  X,
  Settings,
  Bell,
  Shield,
  Archive,
  Trash2,
  Pin,
  Heart,
  Star,
  Reply,
  Forward,
  Download,
  Eye,
  EyeOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { cn, formatMessageTime, getInitials, generateGradientFromName, generateChatWallpaper, isOnline } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import EmojiPicker from './EmojiPicker';

const WhatsAppChatLayout = ({ 
  chatData, 
  currentUser,
  onSendMessage,
  onBackClick,
  isGroupChat = false,
  className = ""
}) => {
  const { theme } = useThemeStore();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [searchMessage, setSearchMessage] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recordingInterval = useRef(null);
  
  const mockMessages = [
    {
      id: 1,
      text: "Hey everyone! Welcome to our group chat 🎉",
      sender: { id: 1, name: "John Doe", avatar: null, isOnline: true },
      timestamp: new Date(Date.now() - 60000).toISOString(),
      isMe: false,
      reactions: [{ emoji: "👍", users: ["user1", "user2"], count: 2 }],
      replyTo: null
    },
    {
      id: 2,
      text: "Thanks for adding me! Excited to be here 😊",
      sender: { id: 2, name: "Jane Smith", avatar: null, isOnline: true },
      timestamp: new Date(Date.now() - 30000).toISOString(),
      isMe: true,
      reactions: [],
      replyTo: null
    },
    {
      id: 3,
      text: "Let's plan our upcoming project meeting",
      sender: { id: 3, name: "Mike Johnson", avatar: null, isOnline: false },
      timestamp: new Date(Date.now() - 10000).toISOString(),
      isMe: false,
      reactions: [{ emoji: "💯", users: ["user2"], count: 1 }],
      replyTo: 1
    },
  ];

  const messages = chatData?.messages || mockMessages;
  const chatTitle = chatData?.title || (isGroupChat ? "Project Team" : "John Doe");
  const participantCount = chatData?.participantCount || 5;
  const isOnlineStatus = chatData?.isOnline || true;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [isRecording]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        text: message,
        sender: currentUser,
        timestamp: new Date().toISOString(),
        isMe: true,
        reactions: [],
        replyTo: null
      };
      
      onSendMessage?.(newMessage);
      setMessage('');
      setIsTyping(false);
      textareaRef.current?.focus();
      toast.success('Message sent!');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVoiceRecording = async () => {
    try {
      if (!isRecording) {
        setIsRecording(true);
        toast.success('🎤 Recording started');
      } else {
        setIsRecording(false);
        toast.success('📤 Voice message sent');
      }
    } catch (error) {
      toast.error('Failed to record voice message');
    }
  };

  const renderMessage = (msg, index) => {
    const isConsecutive = index > 0 && messages[index - 1].sender.id === msg.sender.id;
    const showAvatar = !msg.isMe && (!isConsecutive || isGroupChat);
    
    return (
      <div key={msg.id} className={cn("flex gap-2 mb-1", {
        "flex-row-reverse": msg.isMe,
        "mt-4": !isConsecutive && isGroupChat
      })}>
        {showAvatar && (
          <div className="flex-shrink-0">
            {msg.sender.avatar ? (
              <img 
                src={msg.sender.avatar} 
                alt={msg.sender.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-gradient-to-br",
                generateGradientFromName(msg.sender.name)
              )}>
                {getInitials(msg.sender.name)}
              </div>
            )}
          </div>
        )}
        
        <div className={cn("max-w-[70%] lg:max-w-[60%]", {
          "ml-10": !msg.isMe && !showAvatar && isGroupChat
        })}>
          {/* Reply reference */}
          {msg.replyTo && (
            <div className={cn("text-xs mb-1 p-2 rounded-lg bg-base-200/50 border-l-2", {
              "border-primary": msg.isMe,
              "border-secondary": !msg.isMe
            })}>
              <span className="opacity-70">Replying to:</span>
              <p className="truncate">{messages.find(m => m.id === msg.replyTo)?.text}</p>
            </div>
          )}
          
          {/* Sender name for group chats */}
          {isGroupChat && !msg.isMe && showAvatar && (
            <p className="text-xs font-medium text-primary mb-1">{msg.sender.name}</p>
          )}
          
          {/* Message bubble */}
          <div className={cn(
            "relative px-3 py-2 rounded-2xl shadow-sm",
            {
              "bg-primary text-primary-content rounded-br-md": msg.isMe,
              "bg-base-200 text-base-content rounded-bl-md": !msg.isMe,
              "rounded-tl-md": msg.isMe && isConsecutive,
              "rounded-tr-md": !msg.isMe && isConsecutive
            }
          )}>
            {/* Message text */}
            <p className="text-sm leading-relaxed break-words">{msg.text}</p>
            
            {/* Message timestamp and status */}
            <div className={cn("flex items-center gap-1 mt-1 text-xs", {
              "text-primary-content/70 justify-end": msg.isMe,
              "text-base-content/60": !msg.isMe
            })}>
              <span>{formatMessageTime(msg.timestamp)}</span>
              {msg.isMe && (
                <div className="flex">
                  <Check className="w-3 h-3" />
                  <Check className="w-3 h-3 -ml-1" />
                </div>
              )}
            </div>
            
            {/* Message reactions */}
            {msg.reactions?.length > 0 && (
              <div className="absolute -bottom-2 right-2 flex gap-1">
                {msg.reactions.map((reaction, idx) => (
                  <div key={idx} className="bg-base-100 border border-base-300 rounded-full px-1.5 py-0.5 text-xs flex items-center gap-1">
                    <span>{reaction.emoji}</span>
                    <span className="text-xs font-medium">{reaction.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Check = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className={cn("flex flex-col h-full bg-base-100", className)} data-theme={theme}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 bg-base-100 border-b border-base-300/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackClick}
            className="btn btn-ghost btn-sm btn-circle lg:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              {isGroupChat ? (
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
                  <Users className="w-5 h-5" />
                </div>
              ) : (
                <>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br",
                    generateGradientFromName(chatTitle)
                  )}>
                    {getInitials(chatTitle)}
                  </div>
                  {isOnlineStatus && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-base-100"></div>
                  )}
                </>
              )}
            </div>
            
            <div className="flex flex-col">
              <h2 className="font-semibold text-sm">{chatTitle}</h2>
              <p className="text-xs text-base-content/60">
                {isGroupChat ? `${participantCount} participants` : (isOnlineStatus ? 'Online' : 'Last seen recently')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="btn btn-ghost btn-sm btn-circle"
            title="Search messages"
          >
            <Search className="w-4 h-4" />
          </button>
          
          <button className="btn btn-ghost btn-sm btn-circle" title="Voice call">
            <Phone className="w-4 h-4" />
          </button>
          
          <button className="btn btn-ghost btn-sm btn-circle" title="Video call">
            <Video className="w-4 h-4" />
          </button>
          
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
              <MoreVertical className="w-4 h-4" />
            </button>
            <ul className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-48 border border-base-300">
              <li><a onClick={() => setShowChatInfo(true)}><Info className="w-4 h-4" />Chat Info</a></li>
              <li><a><Bell className="w-4 h-4" />Mute Notifications</a></li>
              <li><a><Archive className="w-4 h-4" />Archive Chat</a></li>
              <li><a><Trash2 className="w-4 h-4 text-error" />Delete Chat</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="p-4 bg-base-200/30 border-b border-base-300/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchMessage}
              onChange={(e) => setSearchMessage(e.target.value)}
              className="input input-sm w-full pl-10 pr-10"
            />
            <button 
              onClick={() => setShowSearch(false)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="w-4 h-4 text-base-content/40" />
            </button>
          </div>
        </div>
      )}
      
      {/* Messages Area */}
      <div className={cn(
        "flex-1 overflow-y-auto p-4 space-y-1",
        generateChatWallpaper(theme)
      )}>
        {/* Welcome message for groups */}
        {isGroupChat && (
          <div className="text-center mb-6">
            <div className="bg-primary/10 backdrop-blur-sm rounded-full p-3 w-16 h-16 mx-auto mb-2 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">{chatTitle}</h3>
            <p className="text-sm text-base-content/70">Group · {participantCount} participants</p>
          </div>
        )}
        
        {/* Messages */}
        {messages.map(renderMessage)}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>Someone is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Recording Overlay */}
      {isRecording && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-2xl shadow-2xl flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-mono text-xl font-bold text-red-500">
                {formatRecordingTime(recordingTime)}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsRecording(false)}
                className="btn btn-error btn-circle"
                title="Stop & Send"
              >
                <Send className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsRecording(false)}
                className="btn btn-ghost btn-circle"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Message Input Area */}
      <div className="p-4 bg-base-100/95 backdrop-blur-sm border-t border-base-300/50">
        {/* Attachment Menu */}
        {showAttachmentMenu && (
          <div className="mb-4 p-3 bg-base-200/50 rounded-2xl">
            <div className="grid grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-3 hover:bg-base-300/50 rounded-xl transition-colors">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-2">
                  <Image className="w-6 h-6 text-purple-500" />
                </div>
                <span className="text-xs">Photos</span>
              </button>
              <button className="flex flex-col items-center p-3 hover:bg-base-300/50 rounded-xl transition-colors">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
                  <Paperclip className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-xs">Document</span>
              </button>
              <button className="flex flex-col items-center p-3 hover:bg-base-300/50 rounded-xl transition-colors">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                  <Phone className="w-6 h-6 text-green-500" />
                </div>
                <span className="text-xs">Contact</span>
              </button>
              <button className="flex flex-col items-center p-3 hover:bg-base-300/50 rounded-xl transition-colors">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
                  <Mic className="w-6 h-6 text-red-500" />
                </div>
                <span className="text-xs">Audio</span>
              </button>
            </div>
          </div>
        )}
        
        <div className="flex items-end gap-2">
          {/* Attachment Button */}
          <button
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            className="btn btn-ghost btn-circle btn-sm"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="textarea textarea-bordered w-full resize-none min-h-[44px] max-h-[120px] pr-12 rounded-3xl"
              rows="1"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <Smile className="w-4 h-4" />
              </button>
              <EmojiPicker
                isOpen={showEmojiPicker}
                onClose={() => setShowEmojiPicker(false)}
                onEmojiSelect={(emoji) => {
                  setMessage(prev => prev + emoji);
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          </div>
          
          {/* Send/Voice Button */}
          {message.trim() ? (
            <button
              onClick={handleSendMessage}
              className="btn btn-primary btn-circle btn-sm"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleVoiceRecording}
              className="btn btn-ghost btn-circle btn-sm"
              title="Voice message"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Input hints */}
        <div className="flex items-center justify-between mt-2 px-2">
          <p className="text-xs text-base-content/50">
            Press Enter to send, Shift+Enter for new line
          </p>
          <div className="text-xs text-base-content/40">
            {message.length}/1000
          </div>
        </div>
      </div>
      
      {/* Chat Info Sidebar */}
      {showChatInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:relative lg:bg-transparent lg:backdrop-blur-none">
          <div className="absolute right-0 top-0 w-full lg:w-80 h-full bg-base-100 shadow-xl overflow-y-auto">
            <div className="p-4 border-b border-base-300">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Chat Info</h3>
                <button 
                  onClick={() => setShowChatInfo(false)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Chat Details */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                  {isGroupChat ? <Users className="w-10 h-10" /> : getInitials(chatTitle)}
                </div>
                <h2 className="font-semibold text-lg">{chatTitle}</h2>
                <p className="text-sm text-base-content/60">
                  {isGroupChat ? `Group · ${participantCount} participants` : 'Last seen recently'}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button className="flex flex-col items-center p-3 hover:bg-base-200 rounded-xl">
                  <Phone className="w-6 h-6 text-green-500 mb-2" />
                  <span className="text-xs">Audio</span>
                </button>
                <button className="flex flex-col items-center p-3 hover:bg-base-200 rounded-xl">
                  <Video className="w-6 h-6 text-blue-500 mb-2" />
                  <span className="text-xs">Video</span>
                </button>
                <button className="flex flex-col items-center p-3 hover:bg-base-200 rounded-xl">
                  <Search className="w-6 h-6 text-primary mb-2" />
                  <span className="text-xs">Search</span>
                </button>
              </div>
              
              {/* Settings */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Settings</h4>
                <div className="menu menu-compact">
                  <li><a><Bell className="w-4 h-4" />Mute notifications</a></li>
                  <li><a><Shield className="w-4 h-4" />Block contact</a></li>
                  <li><a><Archive className="w-4 h-4" />Archive chat</a></li>
                  <li><a className="text-error"><Trash2 className="w-4 h-4" />Delete chat</a></li>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppChatLayout;
