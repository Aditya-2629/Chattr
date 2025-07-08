import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { MenuIcon, XIcon } from "lucide-react";

const EnhancedLayout = ({ children, showSidebar = false, fullScreen = false }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside or pressing Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileSidebarOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileSidebarOpen]);

  // Handle mobile sidebar close
  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  // Handle mobile sidebar open
  const openMobileSidebar = () => {
    setIsMobileSidebarOpen(true);
  };

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200/30 to-base-100">
        {/* Mobile Sidebar Overlay for fullscreen pages */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={closeMobileSidebar}
          />
        )}

        {/* Mobile Sidebar for fullscreen pages */}
        {isMobileSidebarOpen && (
          <div className="fixed left-0 top-0 h-full z-50 w-64">
            <Sidebar onClose={closeMobileSidebar} />
          </div>
        )}

        {/* Navbar for fullscreen pages */}
        <div className="sticky top-0 z-30">
          <Navbar 
            showMenuButton={true}
            onMenuClick={openMobileSidebar}
          />
        </div>

        {/* Main content */}
        <div className="h-[calc(100vh-4rem)]">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-base-100 via-base-200/30 to-base-100">
      {/* Mobile Sidebar Overlay */}
      {showSidebar && isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Desktop Sidebar - Always show on desktop when showSidebar is true */}
      {showSidebar && (
        <div className="hidden lg:block">
          <Sidebar />
        </div>
      )}

      {/* Mobile Sidebar - Only show when explicitly opened */}
      {showSidebar && isMobileSidebarOpen && (
        <div className="fixed left-0 top-0 h-full z-50 w-64 lg:hidden">
          <Sidebar onClose={closeMobileSidebar} />
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 ${showSidebar ? 'lg:ml-64' : ''}`}>
        {/* Enhanced Navbar */}
        <div className="sticky top-0 z-30">
          <Navbar 
            showMenuButton={showSidebar}
            onMenuClick={openMobileSidebar}
          />
        </div>

        {/* Page Content */}
        <main className="flex-1 min-h-0 pt-4 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default EnhancedLayout;
