import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, MessageCircleIcon, ShipWheelIcon, UsersIcon, XIcon } from "lucide-react";

const Sidebar = ({ onClose }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className="w-64 bg-gradient-to-b from-base-200/90 to-base-300/60 backdrop-blur-md border-r border-base-300/50 flex flex-col h-screen shadow-lg overflow-hidden fixed left-0 top-0">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-base-300/50 lg:p-5 bg-gradient-to-r from-base-200/80 to-base-300/40">
        <Link to="/" className="flex items-center gap-2 group" onClick={(e) => {
          if (onClose) {
            onClose();
          }
        }}>
          <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg group-hover:shadow-xl transition-all duration-300">
            <ShipWheelIcon className="size-5 sm:size-6 lg:size-7 text-white" />
          </div>
          <span className="text-lg sm:text-xl lg:text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            Chattr
          </span>
        </Link>
        
        {/* Enhanced Close button */}
        {onClose && (
          <button 
            className="btn btn-ghost btn-circle btn-sm lg:hidden hover:bg-base-300/50 active:bg-base-300/70 transition-all flex-shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close menu"
          >
            <XIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto">
        <Link
          to="/"
          onClick={onClose || (() => {})}
          className={`group flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl transition-all duration-300 touch-manipulation ${
            currentPath === "/" 
              ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-r-4 border-primary shadow-lg" 
              : "hover:bg-base-300/50 text-base-content/70 hover:text-base-content active:bg-base-300/70"
          }`}
        >
          <HomeIcon className="size-5 transition-all duration-300 flex-shrink-0" />
          <span className="font-medium text-sm sm:text-base">Home</span>
        </Link>

        <Link
          to="/friends"
          onClick={onClose || (() => {})}
          className={`group flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl transition-all duration-300 touch-manipulation ${
            currentPath === "/friends" 
              ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-r-4 border-primary shadow-lg" 
              : "hover:bg-base-300/50 text-base-content/70 hover:text-base-content active:bg-base-300/70"
          }`}
        >
          <UsersIcon className="size-5 transition-all duration-300 flex-shrink-0" />
          <span className="font-medium text-sm sm:text-base">Friends</span>
        </Link>

        <Link
          to="/messenger"
          onClick={onClose || (() => {})}
          className={`group flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl transition-all duration-300 touch-manipulation ${
            currentPath.startsWith("/messenger") 
              ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-r-4 border-primary shadow-lg" 
              : "hover:bg-base-300/50 text-base-content/70 hover:text-base-content active:bg-base-300/70"
          }`}
        >
          <MessageCircleIcon className="size-5 transition-all duration-300 flex-shrink-0" />
          <span className="font-medium text-sm sm:text-base">Messages</span>
          {/* Message count indicator */}
          {Math.random() > 0.6 && (
            <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse flex-shrink-0"></div>
          )}
        </Link>

        <Link
          to="/notifications"
          onClick={onClose || (() => {})}
          className={`group flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl transition-all duration-300 touch-manipulation ${
            currentPath === "/notifications" 
              ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-r-4 border-primary shadow-lg" 
              : "hover:bg-base-300/50 text-base-content/70 hover:text-base-content active:bg-base-300/70"
          }`}
        >
          <BellIcon className="size-5 transition-all duration-300 flex-shrink-0" />
          <span className="font-medium text-sm sm:text-base">Notifications</span>
          {/* Notification count indicator */}
          {Math.random() > 0.7 && (
            <div className="ml-auto badge badge-primary badge-sm flex-shrink-0">3</div>
          )}
        </Link>
      </nav>

      {/* Enhanced USER PROFILE SECTION */}
      <div className="p-3 sm:p-4 border-t border-base-300/50 mt-auto bg-gradient-to-r from-base-200/60 to-base-300/30">
        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-base-100/50 backdrop-blur-sm hover:bg-base-100/70 transition-all duration-300 cursor-pointer">
          <div className="avatar flex-shrink-0">
            <div className="w-10 sm:w-12 rounded-full ring-2 ring-primary/30">
              <img src={authUser?.profilePic} alt="User Avatar" className="rounded-full" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs sm:text-sm truncate">{authUser?.fullName}</p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="size-2 rounded-full bg-success inline-block animate-pulse flex-shrink-0" />
              Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
