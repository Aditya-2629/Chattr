import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeftIcon } from 'lucide-react';

const BackButton = ({ 
  className = "", 
  customRedirect = null, 
  showAlways = false 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine if we should show the back button
  const isChatPage = location.pathname?.startsWith("/chat");
  const isMessengerPage = location.pathname?.startsWith("/messenger");
  const isIndividualMessengerPage = location.pathname?.match(/\/messenger\/[^/]+$/);
  const isCallPage = location.pathname?.startsWith("/call");
  const isGroupChatPage = location.pathname?.includes("/groups/") && location.pathname?.includes("/chat");
  
  // Show back button logic
  const shouldShow = showAlways || 
                   isIndividualMessengerPage || 
                   isChatPage || 
                   isCallPage || 
                   isGroupChatPage;

  if (!shouldShow) return null;

  const handleBackClick = () => {
    if (customRedirect) {
      navigate(customRedirect);
      return;
    }
    
    // Default redirect logic
    if (isIndividualMessengerPage || isChatPage || isCallPage) {
      navigate('/messenger');
    } else if (isGroupChatPage) {
      navigate('/groups');
    } else {
      navigate('/');
    }
  };

  return (
    <button 
      className={`btn btn-ghost btn-circle btn-sm hover:bg-base-300/50 active:bg-base-300/70 border border-base-300/30 ${className}`}
      onClick={handleBackClick}
      aria-label="Go back"
      title="Go back"
    >
      <ArrowLeftIcon className="h-5 w-5" />
    </button>
  );
};

export default BackButton;
