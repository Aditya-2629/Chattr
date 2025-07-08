import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, MessageCircleIcon, ShipWheelIcon, UsersIcon, XIcon } from "lucide-react";

const Sidebar = ({ onClose }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className="w-64 bg-gradient-to-b from-base-200/90 to-base-300/60 backdrop-blur-md border-r border-base-300/50 flex flex-col h-screen fixed left-0 top-0 shadow-lg overflow-hidden">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 border-b border-base-300/50 lg:p-5 bg-gradient-to-r from-base-200/80 to-base-300/40">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg group-hover:shadow-xl transition-all duration-300">
            <ShipWheelIcon className="size-6 lg:size-7 text-white" />
          </div>
          <span className="text-2xl lg:text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            Chattr
          </span>
        </Link>
        
        {/* Enhanced Close button */}
        {onClose && (
          <button 
            className="btn btn-ghost btn-circle btn-sm lg:hidden hover:bg-base-300/50 transition-all"
            onClick={onClose}
          >
            <XIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link
          to="/"
          className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            currentPath === "/" 
              ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-r-4 border-primary shadow-lg" 
              : "hover:bg-base-300/50 text-base-content/70 hover:text-base-content"
          }`}
        >
          <HomeIcon className="size-5 transition-all duration-300" />
          <span className="font-medium">Home</span>
        </Link>

        <Link
          to="/friends"
          className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            currentPath === "/friends" 
              ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-r-4 border-primary shadow-lg" 
              : "hover:bg-base-300/50 text-base-content/70 hover:text-base-content"
          }`}
        >
          <UsersIcon className="size-5 transition-all duration-300" />
          <span className="font-medium">Friends</span>
        </Link>

        <Link
          to="/messenger"
          className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            currentPath.startsWith("/messenger") 
              ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-r-4 border-primary shadow-lg" 
              : "hover:bg-base-300/50 text-base-content/70 hover:text-base-content"
          }`}
        >
          <MessageCircleIcon className="size-5 transition-all duration-300" />
          <span className="font-medium">Messages</span>
          {/* Message count indicator */}
          {Math.random() > 0.6 && (
            <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          )}
        </Link>

        <Link
          to="/notifications"
          className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            currentPath === "/notifications" 
              ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary border-r-4 border-primary shadow-lg" 
              : "hover:bg-base-300/50 text-base-content/70 hover:text-base-content"
          }`}
        >
          <BellIcon className="size-5 transition-all duration-300" />
          <span className="font-medium">Notifications</span>
          {/* Notification count indicator */}
          {Math.random() > 0.7 && (
            <div className="ml-auto badge badge-primary badge-sm">3</div>
          )}
        </Link>
      </nav>

      {/* Enhanced USER PROFILE SECTION */}
      <div className="p-4 border-t border-base-300/50 mt-auto bg-gradient-to-r from-base-200/60 to-base-300/30">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-base-100/50 backdrop-blur-sm hover:bg-base-100/70 transition-all duration-300 cursor-pointer">
          <div className="avatar">
            <div className="w-12 rounded-full ring-2 ring-primary/30">
              <img src={authUser?.profilePic} alt="User Avatar" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm truncate">{authUser?.fullName}</p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="size-2 rounded-full bg-success inline-block animate-pulse" />
              Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
