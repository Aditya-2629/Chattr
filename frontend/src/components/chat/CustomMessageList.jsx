import React from 'react';
import { useThemeStore } from '../../store/useThemeStore';
import { MessageList } from 'stream-chat-react';

const CustomMessageList = ({ messages, currentUser }) => {
  const { theme } = useThemeStore();

  return (
    <div className="custom-message-list flex-1 overflow-y-auto" data-theme={theme}>
      {/* Custom styling for Stream Chat MessageList */}
      <MessageList />
      
      <style jsx global>{`
        /* Custom Stream Chat Styling */
        .str-chat {
          --str-chat__font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
          --str-chat__border-radius-md: 12px;
          --str-chat__border-radius-sm: 8px;
        }

        /* Message bubbles */
        .str-chat__message-simple {
          padding: 8px 0;
        }

        .str-chat__message-simple__content {
          border-radius: 16px !important;
          padding: 12px 16px !important;
          max-width: 75% !important;
          position: relative;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        /* Own messages (right side) */
        .str-chat__message-simple--me .str-chat__message-simple__content {
          background: hsl(var(--p)) !important;
          color: hsl(var(--pc)) !important;
          margin-left: auto;
          border-bottom-right-radius: 6px !important;
        }

        /* Other messages (left side) */
        .str-chat__message-simple:not(.str-chat__message-simple--me) .str-chat__message-simple__content {
          background: hsl(var(--b2)) !important;
          color: hsl(var(--bc)) !important;
          border-bottom-left-radius: 6px !important;
          border: 1px solid hsl(var(--b3));
        }

        /* Message text */
        .str-chat__message-simple__text {
          font-size: 14px !important;
          line-height: 1.4 !important;
          word-wrap: break-word;
        }

        /* Message metadata */
        .str-chat__message-simple__timestamp {
          font-size: 11px !important;
          opacity: 0.7 !important;
          margin-top: 4px !important;
        }

        .str-chat__message-simple--me .str-chat__message-simple__timestamp {
          color: hsl(var(--pc) / 0.7) !important;
        }

        .str-chat__message-simple:not(.str-chat__message-simple--me) .str-chat__message-simple__timestamp {
          color: hsl(var(--bc) / 0.5) !important;
        }

        /* Avatar styling */
        .str-chat__avatar {
          width: 32px !important;
          height: 32px !important;
          border-radius: 50% !important;
          margin-right: 8px !important;
        }

        .str-chat__avatar-image {
          border-radius: 50% !important;
        }

        /* Message reactions */
        .str-chat__reaction-list {
          margin-top: 4px !important;
        }

        .str-chat__message-simple-reaction-group {
          background: hsl(var(--b1)) !important;
          border: 1px solid hsl(var(--b3)) !important;
          border-radius: 12px !important;
          padding: 2px 6px !important;
          font-size: 12px !important;
        }

        /* System messages */
        .str-chat__message--system {
          text-align: center !important;
          margin: 16px 0 !important;
        }

        .str-chat__message--system .str-chat__message-text {
          background: hsl(var(--b2)) !important;
          color: hsl(var(--bc) / 0.6) !important;
          padding: 8px 16px !important;
          border-radius: 20px !important;
          font-size: 12px !important;
          display: inline-block;
        }

        /* Date separator */
        .str-chat__date-separator {
          margin: 16px 0 !important;
          text-align: center;
        }

        .str-chat__date-separator-date {
          background: hsl(var(--b2)) !important;
          color: hsl(var(--bc) / 0.6) !important;
          padding: 4px 12px !important;
          border-radius: 12px !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          display: inline-block;
        }

        /* Message thread replies */
        .str-chat__quoted-message-preview {
          background: hsl(var(--b3)) !important;
          border-left: 3px solid hsl(var(--p)) !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          margin-bottom: 8px !important;
        }

        /* Typing indicator */
        .str-chat__typing-indicator {
          padding: 16px !important;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .str-chat__typing-indicator__avatars {
          margin-right: 8px !important;
        }

        .str-chat__typing-indicator__dots {
          display: flex;
          gap: 2px;
        }

        .str-chat__typing-indicator__dot {
          width: 6px !important;
          height: 6px !important;
          background: hsl(var(--bc) / 0.4) !important;
          border-radius: 50% !important;
          animation: typing 1.5s ease-in-out infinite;
        }

        .str-chat__typing-indicator__dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .str-chat__typing-indicator__dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-4px);
          }
        }

        /* Message attachments */
        .str-chat__message-attachment {
          border-radius: 12px !important;
          overflow: hidden;
          margin-top: 8px !important;
          max-width: 300px !important;
        }

        .str-chat__message-attachment--image img {
          border-radius: 12px !important;
          max-width: 100% !important;
          height: auto !important;
        }

        /* Link previews */
        .str-chat__message-attachment--url {
          border: 1px solid hsl(var(--b3)) !important;
          border-radius: 12px !important;
          overflow: hidden;
          background: hsl(var(--b1)) !important;
        }

        .str-chat__message-attachment--url .str-chat__message-attachment--url-inner {
          padding: 12px !important;
        }

        /* Message options */
        .str-chat__message-options {
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .str-chat__message-simple:hover .str-chat__message-options {
          opacity: 1;
        }

        /* Message actions */
        .str-chat__message-actions {
          background: hsl(var(--b1)) !important;
          border: 1px solid hsl(var(--b3)) !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .str-chat__message-actions-item {
          padding: 8px 12px !important;
          color: hsl(var(--bc)) !important;
          transition: background-color 0.2s ease;
        }

        .str-chat__message-actions-item:hover {
          background: hsl(var(--b2)) !important;
        }

        /* Message list container */
        .str-chat__virtual-message__wrapper,
        .str-chat__message-list {
          padding: 16px !important;
          background: transparent !important;
        }

        /* Scrollbar styling */
        .str-chat__message-list-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .str-chat__message-list-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .str-chat__message-list-scroll::-webkit-scrollbar-thumb {
          background: hsl(var(--bc) / 0.2);
          border-radius: 3px;
        }

        .str-chat__message-list-scroll::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--bc) / 0.3);
        }

        /* Empty state */
        .str-chat__message-list-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 32px;
          text-align: center;
        }

        .str-chat__message-list-empty-title {
          font-size: 18px;
          font-weight: 600;
          color: hsl(var(--bc));
          margin-bottom: 8px;
        }

        .str-chat__message-list-empty-subtitle {
          font-size: 14px;
          color: hsl(var(--bc) / 0.6);
        }

        /* Message status indicators */
        .str-chat__message-status {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 2px;
        }

        .str-chat__message-status-icon {
          width: 14px;
          height: 14px;
          opacity: 0.6;
        }

        /* Group message styling */
        .str-chat__message-simple--group .str-chat__message-simple__content {
          margin-left: 40px;
        }

        .str-chat__message-simple--group .str-chat__message-simple__content::before {
          content: attr(data-user-name);
          position: absolute;
          top: -18px;
          left: 0;
          font-size: 11px;
          font-weight: 600;
          color: hsl(var(--p));
        }

        /* Loading state */
        .str-chat__message-list--loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .str-chat__loading-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          color: hsl(var(--bc) / 0.6);
        }

        .str-chat__loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid hsl(var(--bc) / 0.2);
          border-top: 2px solid hsl(var(--p));
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CustomMessageList;
