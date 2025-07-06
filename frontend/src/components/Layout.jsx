const Layout = ({ children, showSidebar = false }) => {
  return (
    <div className="flex min-h-screen bg-base-100">
      {showSidebar && <Sidebar />}

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
