import { Link, useLocation, useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, MenuIcon, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import BackButton from "./BackButton";

const Navbar = ({ showMenuButton = false, onMenuClick }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const navigate = useNavigate();
  const isChatPage = location.pathname?.startsWith("/chat");
  const isMessengerPage = location.pathname?.startsWith("/messenger");
  const isIndividualMessengerPage = location.pathname?.match(/\/messenger\/[^/]+$/);
  const isCallPage = location.pathname?.startsWith("/call");
  
  const { logoutMutation, isPending: isLoggingOut } = useLogout();

  return (
    <nav className="bg-base-200/80 backdrop-blur-md border-b border-base-300 h-16 flex items-center">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left Side - Menu Button + Logo */}
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <BackButton />
            
            {/* Mobile Menu Button */}
            {showMenuButton && (
              <button 
                className="btn btn-ghost btn-circle lg:hidden hover:bg-base-300/50 active:bg-base-300/70"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onMenuClick) {
                    onMenuClick();
                  }
                }}
                aria-label="Open menu"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
            )}
            
            {/* Logo - Show on Chat/Messenger pages or when no sidebar */}
            {(isChatPage || isMessengerPage || !showMenuButton) && (
              <Link to="/" className="flex items-center gap-2">
                <ShipWheelIcon className="size-8 text-primary" />
                <span className="hidden sm:block text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                  Chattr
                </span>
              </Link>
            )}
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Notification Button */}
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle btn-sm sm:btn-md hover:bg-base-300/50 active:bg-base-300/70 transition-all relative" title="Notifications" aria-label="View notifications">
                <BellIcon className="h-5 w-5 sm:h-6 sm:w-6 text-base-content opacity-70" />
                {/* Notification Badge */}
                {Math.random() > 0.7 && (
                  <div className="absolute -top-1 -right-1 badge badge-primary badge-xs animate-pulse"></div>
                )}
              </button>
            </Link>

            {/* Theme Toggle */}
            <ThemeSelector />

            {/* Avatar with click to onboarding */}
            <div
              className="avatar cursor-pointer"
              onClick={() => navigate("/onboarding")}
            >
              <div className="w-8 sm:w-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                <img
                  src={authUser?.profilePic}
                  alt="User Avatar"
                  className="rounded-full"
                />
              </div>
            </div>

            {/* Logout Button - Hidden on small screens, shown in dropdown */}
            <button 
              className="hidden sm:flex btn btn-ghost btn-circle btn-sm sm:btn-md hover:bg-error/10 hover:text-error transition-all" 
              onClick={logoutMutation}
              disabled={isLoggingOut}
              title="Logout"
              aria-label="Logout"
            >
              {isLoggingOut ? (
                <div className="loading loading-spinner loading-sm"></div>
              ) : (
                <LogOutIcon className="h-5 w-5 sm:h-6 sm:w-6 text-base-content opacity-70" />
              )}
            </button>
            
            {/* Mobile Menu Dropdown */}
            <div className="dropdown dropdown-end sm:hidden">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm hover:bg-base-300/50 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                </svg>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52">
                <li>
                  <button 
                    onClick={logoutMutation} 
                    className="text-error hover:bg-error/10 transition-all"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <div className="loading loading-spinner loading-sm"></div>
                    ) : (
                      <LogOutIcon className="h-4 w-4" />
                    )}
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
