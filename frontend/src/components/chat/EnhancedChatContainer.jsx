import React from 'react';
import { Channel, Chat } from 'stream-chat-react';
import { useThemeStore } from '../../store/useThemeStore';
import CustomMessageList from './CustomMessageList';
import CustomMessageInput from './CustomMessageInput';

const EnhancedChatContainer = ({ 
  client, 
  channel, 
  isGroupChat = false, 
  className = "" 
}) => {
  const { theme } = useThemeStore();

  return (
    <div 
      className={`flex flex-col h-full bg-gradient-to-b from-base-100 via-base-200/10 to-base-200/30 ${className}`}
      data-theme={theme}
    >
      <Chat client={client} theme="messaging light">
        <Channel channel={channel}>
          {/* Messages Area */}
          <div className="flex-1 overflow-hidden relative">
            <div 
              className="h-full overflow-y-auto scroll-smooth"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 25% 25%, hsl(var(--p) / 0.02) 0%, transparent 70%),
                  radial-gradient(circle at 75% 75%, hsl(var(--s) / 0.02) 0%, transparent 70%)
                `
              }}
            >
              <CustomMessageList />
            </div>
            
            {/* Scroll to bottom button */}
            <div className="absolute bottom-4 right-4 opacity-0 hover:opacity-100 transition-opacity">
              <button className="btn btn-circle btn-sm bg-base-100/80 backdrop-blur-sm border border-base-300/50 shadow-lg">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Message Input Area */}
          <div className="flex-shrink-0">
            <CustomMessageInput 
              channel={channel}
              isGroupChat={isGroupChat}
            />
          </div>
        </Channel>
      </Chat>

      {/* Global chat styling */}
      <style jsx global>{`
        /* Main chat container */
        .str-chat {
          height: 100% !important;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif !important;
        }

        .str-chat__container {
          height: 100% !important;
        }

        .str-chat__channel {
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
        }

        /* Channel header styling */
        .str-chat__channel-header {
          display: none !important; /* We have our own header */
        }

        /* Thread styling */
        .str-chat__thread {
          border-left: 1px solid hsl(var(--b3)) !important;
          background: hsl(var(--b1)) !important;
        }

        .str-chat__thread-header {
          background: hsl(var(--b2)) !important;
          border-bottom: 1px solid hsl(var(--b3)) !important;
          padding: 16px !important;
        }

        /* Message list styling */
        .str-chat__list {
          background: transparent !important;
          padding: 0 !important;
        }

        .str-chat__list-container {
          background: transparent !important;
        }

        /* Scrollbar styling for all elements */
        .str-chat *::-webkit-scrollbar {
          width: 6px !important;
          height: 6px !important;
        }

        .str-chat *::-webkit-scrollbar-track {
          background: transparent !important;
        }

        .str-chat *::-webkit-scrollbar-thumb {
          background: hsl(var(--bc) / 0.2) !important;
          border-radius: 3px !important;
        }

        .str-chat *::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--bc) / 0.3) !important;
        }

        .str-chat *::-webkit-scrollbar-corner {
          background: transparent !important;
        }

        /* Loading states */
        .str-chat__loading-channels {
          background: hsl(var(--b1)) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          height: 100% !important;
        }

        .str-chat__loading-channels-item {
          color: hsl(var(--bc) / 0.6) !important;
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          font-size: 14px !important;
        }

        /* Error states */
        .str-chat__connection-error {
          background: hsl(var(--er) / 0.1) !important;
          color: hsl(var(--er)) !important;
          border: 1px solid hsl(var(--er) / 0.2) !important;
          border-radius: 8px !important;
          padding: 12px 16px !important;
          margin: 8px !important;
          font-size: 14px !important;
        }

        /* Image gallery */
        .str-chat__gallery {
          background: rgba(0, 0, 0, 0.9) !important;
        }

        .str-chat__gallery-header {
          background: rgba(0, 0, 0, 0.8) !important;
          backdrop-filter: blur(10px) !important;
        }

        .str-chat__gallery-close {
          color: white !important;
          background: rgba(255, 255, 255, 0.1) !important;
          border-radius: 50% !important;
          width: 40px !important;
          height: 40px !important;
        }

        /* Modal and dropdown styling */
        .str-chat__modal {
          background: rgba(0, 0, 0, 0.5) !important;
          backdrop-filter: blur(4px) !important;
        }

        .str-chat__modal__inner {
          background: hsl(var(--b1)) !important;
          border: 1px solid hsl(var(--b3)) !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }

        .str-chat__modal__close-button {
          color: hsl(var(--bc)) !important;
          background: hsl(var(--b2)) !important;
          border: 1px solid hsl(var(--b3)) !important;
          border-radius: 50% !important;
          width: 32px !important;
          height: 32px !important;
        }

        /* Tooltip styling */
        .str-chat__tooltip {
          background: hsl(var(--n)) !important;
          color: hsl(var(--nc)) !important;
          border: 1px solid hsl(var(--b3)) !important;
          border-radius: 8px !important;
          padding: 6px 10px !important;
          font-size: 12px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }

        .str-chat__tooltip::before {
          border-top-color: hsl(var(--n)) !important;
        }

        /* User mention styling */
        .str-chat__message-mention {
          background: hsl(var(--p) / 0.1) !important;
          color: hsl(var(--p)) !important;
          border-radius: 4px !important;
          padding: 2px 4px !important;
          font-weight: 600 !important;
        }

        /* Channel mention styling */
        .str-chat__message-mention--channel {
          background: hsl(var(--s) / 0.1) !important;
          color: hsl(var(--s)) !important;
        }

        /* Command mention styling */
        .str-chat__message-mention--command {
          background: hsl(var(--a) / 0.1) !important;
          color: hsl(var(--a)) !important;
        }

        /* Link styling */
        .str-chat__message-text a {
          color: hsl(var(--p)) !important;
          text-decoration: underline !important;
          text-decoration-color: hsl(var(--p) / 0.3) !important;
          transition: all 0.2s ease !important;
        }

        .str-chat__message-text a:hover {
          color: hsl(var(--p) / 0.8) !important;
          text-decoration-color: hsl(var(--p)) !important;
        }

        /* Code block styling */
        .str-chat__message-text code {
          background: hsl(var(--b2)) !important;
          color: hsl(var(--bc)) !important;
          border: 1px solid hsl(var(--b3)) !important;
          border-radius: 4px !important;
          padding: 2px 6px !important;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace !important;
          font-size: 13px !important;
        }

        .str-chat__message-text pre {
          background: hsl(var(--b2)) !important;
          border: 1px solid hsl(var(--b3)) !important;
          border-radius: 8px !important;
          padding: 12px !important;
          overflow-x: auto !important;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace !important;
          font-size: 13px !important;
          line-height: 1.4 !important;
        }

        .str-chat__message-text pre code {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
        }

        /* Blockquote styling */
        .str-chat__message-text blockquote {
          border-left: 4px solid hsl(var(--p)) !important;
          background: hsl(var(--b2)) !important;
          padding: 12px 16px !important;
          margin: 8px 0 !important;
          border-radius: 0 8px 8px 0 !important;
          font-style: italic !important;
        }

        /* List styling */
        .str-chat__message-text ul,
        .str-chat__message-text ol {
          padding-left: 20px !important;
          margin: 8px 0 !important;
        }

        .str-chat__message-text li {
          margin: 4px 0 !important;
        }

        /* Selection styling */
        .str-chat__message-text ::selection {
          background: hsl(var(--p) / 0.2) !important;
        }

        /* Focus styling */
        .str-chat *:focus {
          outline: 2px solid hsl(var(--p)) !important;
          outline-offset: 2px !important;
        }

        .str-chat *:focus:not(:focus-visible) {
          outline: none !important;
        }

        /* Animations */
        .str-chat__message-simple {
          animation: fadeInUp 0.3s ease-out !important;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          .str-chat__message-simple__content {
            max-width: 85% !important;
            font-size: 15px !important;
          }

          .str-chat__message-simple__timestamp {
            font-size: 10px !important;
          }

          .str-chat__avatar {
            width: 28px !important;
            height: 28px !important;
          }
        }

        /* Dark mode specific adjustments */
        [data-theme*="dark"] .str-chat__message-simple__content,
        [data-theme="night"] .str-chat__message-simple__content,
        [data-theme="coffee"] .str-chat__message-simple__content {
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2) !important;
        }

        /* High contrast themes */
        [data-theme="dracula"] .str-chat__message-simple--me .str-chat__message-simple__content,
        [data-theme="synthwave"] .str-chat__message-simple--me .str-chat__message-simple__content {
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
        }
      `}</style>
    </div>
  );
};

export default EnhancedChatContainer;
