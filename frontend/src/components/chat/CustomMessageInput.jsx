import React, { useState, useRef, useEffect } from 'react';
import { 
  SendIcon, 
  SmileIcon, 
  PaperclipIcon, 
  MicIcon, 
  ImageIcon,
  FileIcon,
  XIcon,
  PauseIcon,
  PlayIcon
} from 'lucide-react';
import { MessageInput } from 'stream-chat-react';
import { useThemeStore } from '../../store/useThemeStore';
import { toast } from 'react-hot-toast';

const CustomMessageInput = ({ channel, isGroupChat = false, disabled = false }) => {
  const { theme } = useThemeStore();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAttachments, setShowAttachments] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const recordingInterval = useRef(null);

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

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVoiceRecording = async () => {
    if (!navigator.mediaRecorder) {
      toast.error('Voice recording not supported in this browser');
      return;
    }

    try {
      if (!isRecording) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Start recording logic here
        setIsRecording(true);
        toast.success('🎤 Recording started');
      } else {
        // Stop recording logic here
        setIsRecording(false);
        toast.success('🛑 Recording stopped');
      }
    } catch (error) {
      toast.error('Failed to access microphone');
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      // Handle file upload logic
      toast.success(`📁 ${files.length} file(s) selected`);
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      // Handle image upload logic
      toast.success(`🖼️ ${files.length} image(s) selected`);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      toast.success(`📎 ${files.length} file(s) dropped`);
    }
  };

  return (
    <div 
      className={`relative bg-base-100/95 backdrop-blur-md border-t border-base-300/50 transition-all duration-200 ${
        dragOver ? 'bg-primary/5 border-primary/50' : ''
      }`} 
      data-theme={theme}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {dragOver && (
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm flex items-center justify-center z-10 border-2 border-dashed border-primary/50 rounded-lg">
          <div className="text-center">
            <PaperclipIcon className="h-12 w-12 mx-auto mb-2 text-primary" />
            <p className="text-primary font-medium">Drop files here to upload</p>
          </div>
        </div>
      )}

      {/* Recording overlay */}
      {isRecording && (
        <div className="absolute inset-0 bg-error/10 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="flex items-center gap-4 bg-base-100 p-4 rounded-2xl shadow-lg border border-base-300">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-error rounded-full animate-pulse"></div>
              <span className="font-mono text-lg text-error font-semibold">
                {formatRecordingTime(recordingTime)}
              </span>
            </div>
            <button
              onClick={handleVoiceRecording}
              className="btn btn-error btn-circle"
            >
              <PauseIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsRecording(false)}
              className="btn btn-ghost btn-circle"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Attachment menu */}
      {showAttachments && (
        <div className="absolute bottom-full left-4 mb-2 z-20">
          <div className="bg-base-100 border border-base-300 rounded-2xl shadow-lg p-2 min-w-[200px]">
            <button
              onClick={() => imageInputRef.current?.click()}
              className="w-full flex items-center gap-3 p-3 hover:bg-base-200 rounded-xl transition-all"
            >
              <div className="bg-primary/20 p-2 rounded-lg">
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Photos & Videos</p>
                <p className="text-xs text-base-content/60">Upload images and videos</p>
              </div>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 p-3 hover:bg-base-200 rounded-xl transition-all"
            >
              <div className="bg-secondary/20 p-2 rounded-lg">
                <FileIcon className="h-5 w-5 text-secondary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Documents</p>
                <p className="text-xs text-base-content/60">Upload files and documents</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Main input container */}
      <div className="p-4">
        <div className="flex items-end gap-2">
          {/* Attachment button */}
          <button
            onClick={() => setShowAttachments(!showAttachments)}
            className="btn btn-ghost btn-circle btn-sm hover:bg-base-200/70 transition-all"
            disabled={disabled}
            title="Attachments"
          >
            <PaperclipIcon className="h-5 w-5" />
          </button>

          {/* Message input wrapper */}
          <div className="flex-1 relative">
            <div className="message-input-container">
              <MessageInput 
                focus={true}
                disabled={disabled}
                maxRows={4}
                grow={true}
                publishTypingEvent={true}
                placeholder={
                  isGroupChat 
                    ? "Type a message to the group..." 
                    : "Type a message..."
                }
              />
            </div>
            
            {/* Emoji button - positioned over the input */}
            <button
              className="absolute right-3 bottom-3 btn btn-ghost btn-circle btn-xs hover:bg-base-200/70 transition-all"
              disabled={disabled}
              title="Emojis"
            >
              <SmileIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Voice recording button */}
          <button
            onClick={handleVoiceRecording}
            className={`btn btn-circle btn-sm transition-all ${
              isRecording 
                ? 'btn-error animate-pulse' 
                : 'btn-ghost hover:bg-base-200/70'
            }`}
            disabled={disabled}
            title={isRecording ? "Stop recording" : "Voice message"}
          >
            <MicIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Input hints */}
        <div className="flex items-center justify-between mt-2 px-2">
          <p className="text-xs text-base-content/50">
            {isGroupChat ? "Message the group" : "Press Enter to send, Shift+Enter for new line"}
          </p>
          <div className="flex items-center gap-1 text-xs text-base-content/40">
            <span>💡</span>
            <span>Drag & drop files to upload</span>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileUpload}
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
      />
      
      <input
        ref={imageInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleImageUpload}
        accept="image/*,video/*"
      />

      {/* Custom styles for Stream Chat MessageInput */}
      <style jsx global>{`
        .message-input-container .str-chat__message-input {
          border: 1px solid hsl(var(--b3)) !important;
          border-radius: 24px !important;
          background: hsl(var(--b1)) !important;
          padding: 12px 50px 12px 16px !important;
          font-size: 14px !important;
          line-height: 1.4 !important;
          resize: none !important;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05) !important;
          transition: all 0.2s ease !important;
          min-height: 44px !important;
          max-height: 120px !important;
        }

        .message-input-container .str-chat__message-input:focus {
          border-color: hsl(var(--p)) !important;
          box-shadow: 0 0 0 3px hsl(var(--p) / 0.1) !important;
          outline: none !important;
        }

        .message-input-container .str-chat__message-input::placeholder {
          color: hsl(var(--bc) / 0.5) !important;
        }

        /* Hide default send button */
        .str-chat__message-input-send-button {
          display: none !important;
        }

        /* Custom send button styling */
        .str-chat__send-button {
          background: hsl(var(--p)) !important;
          border: none !important;
          border-radius: 50% !important;
          width: 36px !important;
          height: 36px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s ease !important;
        }

        .str-chat__send-button:hover {
          background: hsl(var(--p) / 0.8) !important;
          transform: scale(1.05) !important;
        }

        .str-chat__send-button:disabled {
          background: hsl(var(--bc) / 0.2) !important;
          cursor: not-allowed !important;
          transform: none !important;
        }

        .str-chat__send-button svg {
          color: hsl(var(--pc)) !important;
          width: 18px !important;
          height: 18px !important;
        }

        /* Message input container */
        .str-chat__message-input-wrapper {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
        }

        /* Typing indicator in input */
        .str-chat__message-input-typing-indicator {
          position: absolute;
          top: -32px;
          left: 16px;
          background: hsl(var(--b2)) !important;
          color: hsl(var(--bc) / 0.6) !important;
          padding: 4px 12px !important;
          border-radius: 12px !important;
          font-size: 12px !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        }

        /* File upload progress */
        .str-chat__file-upload-progress {
          background: hsl(var(--b2)) !important;
          border: 1px solid hsl(var(--b3)) !important;
          border-radius: 12px !important;
          margin-bottom: 8px !important;
        }

        /* Attachment previews */
        .str-chat__message-input-attachment-preview {
          background: hsl(var(--b2)) !important;
          border: 1px solid hsl(var(--b3)) !important;
          border-radius: 8px !important;
          padding: 8px !important;
          margin-bottom: 8px !important;
        }

        .str-chat__message-input-attachment-preview-remove {
          background: hsl(var(--er)) !important;
          color: hsl(var(--erc)) !important;
          border-radius: 50% !important;
          width: 20px !important;
          height: 20px !important;
        }

        /* Quote message preview */
        .str-chat__message-input-quoted-message-preview {
          background: hsl(var(--b2)) !important;
          border-left: 3px solid hsl(var(--p)) !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          margin-bottom: 8px !important;
        }

        /* Disabled state */
        .str-chat__message-input:disabled {
          background: hsl(var(--b3)) !important;
          color: hsl(var(--bc) / 0.5) !important;
          cursor: not-allowed !important;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .message-input-container .str-chat__message-input {
            font-size: 16px !important; /* Prevents zoom on iOS */
            padding: 10px 45px 10px 14px !important;
            min-height: 40px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomMessageInput;
