import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeftIcon } from 'lucide-react';

const BackButton = ({ 
  className = "", 
  customRedirect = null, 
  showAlways = false,
  variant = "default" // "default", "primary", "ghost"
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Determine if we should show the back button
  const isChatPage = location.pathname?.startsWith("/chat");
  const isMessengerPage = location.pathname?.startsWith("/messenger");
  const isIndividualMessengerPage = location.pathname?.match(/\/messenger\/[^/]+$/);
  const isCallPage = location.pathname?.startsWith("/call");
  const isGroupChatPage = location.pathname?.includes("/groups/") && location.pathname?.includes("/chat");
  const isGroupMembersPage = location.pathname?.includes("/groups/") && location.pathname?.includes("/members");
  
  // Show back button logic
  const shouldShow = showAlways || 
                   isIndividualMessengerPage || 
                   isChatPage || 
                   isCallPage || 
                   isGroupChatPage ||
                   isGroupMembersPage;

  if (!shouldShow) return null;

  const handleBackClick = async () => {
    try {
      setIsNavigating(true);
      
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 150));
      
      if (customRedirect) {
        navigate(customRedirect);
        return;
      }
      
      // Smart redirect logic based on current page
      if (isIndividualMessengerPage || isChatPage || isCallPage) {
        navigate('/messenger');
      } else if (isGroupChatPage || isGroupMembersPage) {
        navigate('/groups');
      } else if (window.history.length > 2) {
        navigate(-1); // Go back in history if possible
      } else {
        navigate('/'); // Fallback to home
      }
    } catch (error) {
      console.error('Navigation error:', error);
      navigate('/'); // Fallback navigation
    } finally {
      setIsNavigating(false);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = "btn btn-circle btn-sm transition-all duration-200";
    const variantClasses = {
      default: "btn-ghost hover:bg-base-300/50 active:bg-base-300/70 border border-base-300/30",
      primary: "btn-primary hover:btn-primary-focus",
      ghost: "btn-ghost hover:bg-base-300/50"
    };
    return `${baseClasses} ${variantClasses[variant] || variantClasses.default} ${className}`;
  };

  return (
    <button 
      className={getButtonClasses()}
      onClick={handleBackClick}
      disabled={isNavigating}
      aria-label="Go back"
      title="Go back"
    >
      {isNavigating ? (
        <div className="loading loading-spinner loading-sm"></div>
      ) : (
        <ArrowLeftIcon className="h-5 w-5" />
      )}
    </button>
  );
};

export default BackButton;
