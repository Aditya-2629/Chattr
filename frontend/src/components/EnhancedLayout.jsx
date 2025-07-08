import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { MenuIcon, XIcon } from "lucide-react";

const EnhancedLayout = ({ children, showSidebar = false, fullScreen = false }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200/30 to-base-100">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-base-100 via-base-200/30 to-base-100">
      {/* Mobile Sidebar Overlay */}
      {showSidebar && isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      {showSidebar && (
        <div className="hidden lg:block">
          <Sidebar />
        </div>
      )}

      {/* Mobile Sidebar */}
      {showSidebar && (
        <div className={`fixed left-0 top-0 h-full z-50 transform transition-all duration-300 ease-in-out lg:hidden ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <Sidebar onClose={() => setIsMobileSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 ${showSidebar ? 'lg:ml-64' : ''}`}>
        {/* Enhanced Navbar */}
        <div className="sticky top-0 z-30">
          <Navbar 
            showMenuButton={showSidebar}
            onMenuClick={() => setIsMobileSidebarOpen(true)}
          />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnhancedLayout;
