import { VideoIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

function CallButton({ handleVideoCall, disabled = false }) {
  const [isStarting, setIsStarting] = useState(false);

  const handleClick = async () => {
    if (!handleVideoCall) {
      toast.error('Video call is not available');
      return;
    }
    
    try {
      setIsStarting(true);
      await handleVideoCall();
    } catch (error) {
      console.error('Error starting video call:', error);
      toast.error('Failed to start video call');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="p-3 border-b flex items-center justify-end max-w-7xl mx-auto w-full absolute top-0 z-50 bg-base-200/95 backdrop-blur-md">
      <button 
        onClick={handleClick} 
        disabled={disabled || isStarting}
        className="btn btn-success btn-sm text-white hover:btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
        title="Start video call"
        aria-label="Start video call"
      >
        {isStarting ? (
          <div className="loading loading-spinner loading-sm"></div>
        ) : (
          <VideoIcon className="size-5" />
        )}
        <span className="hidden sm:inline ml-1">
          {isStarting ? 'Starting...' : 'Video Call'}
        </span>
      </button>
    </div>
  );
}

export default CallButton;
